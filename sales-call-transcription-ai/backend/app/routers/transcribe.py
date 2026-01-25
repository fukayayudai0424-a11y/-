"""
Transcription API Router
文字起こしAPIエンドポイント
"""

import os
import uuid
import shutil
from typing import Optional, Dict
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.services.transcription import TranscriptionService
from app.services.speaker_diarization import SpeakerDiarizationService
from app.services.youtube_extractor import YouTubeExtractor

router = APIRouter()

# サービスのインスタンス（遅延初期化）
_transcription_service: Optional[TranscriptionService] = None
_diarization_service: Optional[SpeakerDiarizationService] = None
_youtube_extractor: Optional[YouTubeExtractor] = None

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_transcription_service() -> TranscriptionService:
    global _transcription_service
    if _transcription_service is None:
        model_size = os.getenv("WHISPER_MODEL", "base")
        _transcription_service = TranscriptionService(model_size=model_size)
    return _transcription_service


def get_diarization_service() -> SpeakerDiarizationService:
    global _diarization_service
    if _diarization_service is None:
        _diarization_service = SpeakerDiarizationService(num_speakers=2)
    return _diarization_service


def get_youtube_extractor() -> YouTubeExtractor:
    global _youtube_extractor
    if _youtube_extractor is None:
        _youtube_extractor = YouTubeExtractor(output_dir=UPLOAD_DIR)
    return _youtube_extractor


class YouTubeRequest(BaseModel):
    url: str
    language: str = "ja"
    speaker_a_name: str = "営業担当"
    speaker_b_name: str = "お客様"


class TranscriptionResponse(BaseModel):
    success: bool
    conversation: str
    segments: list
    metadata: Optional[dict] = None
    error: Optional[str] = None


def cleanup_file(file_path: str):
    """バックグラウンドでファイルを削除"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass


@router.post("/transcribe/file", response_model=TranscriptionResponse)
async def transcribe_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = Form(default="ja"),
    speaker_a_name: str = Form(default="営業担当"),
    speaker_b_name: str = Form(default="お客様")
):
    """
    MP3/WAVファイルをアップロードして文字起こし

    - **file**: 音声ファイル（MP3, WAV, M4A対応）
    - **language**: 言語コード（ja: 日本語, en: 英語）
    - **speaker_a_name**: 話者Aの名前
    - **speaker_b_name**: 話者Bの名前
    """
    # ファイル形式の検証
    allowed_extensions = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )

    # 一時ファイルとして保存
    unique_id = str(uuid.uuid4())[:8]
    temp_path = os.path.join(UPLOAD_DIR, f"upload_{unique_id}{file_ext}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 文字起こしと話者分離を実行
        result = await process_audio(
            temp_path,
            language,
            {
                "SPEAKER_00": speaker_a_name,
                "SPEAKER_01": speaker_b_name
            }
        )

        # 処理完了後にファイルを削除
        background_tasks.add_task(cleanup_file, temp_path)

        return result

    except Exception as e:
        # エラー時もファイルを削除
        background_tasks.add_task(cleanup_file, temp_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe/youtube", response_model=TranscriptionResponse)
async def transcribe_youtube(
    request: YouTubeRequest,
    background_tasks: BackgroundTasks
):
    """
    YouTubeリンクから音声を抽出して文字起こし

    - **url**: YouTubeのURL
    - **language**: 言語コード（ja: 日本語, en: 英語）
    - **speaker_a_name**: 話者Aの名前
    - **speaker_b_name**: 話者Bの名前
    """
    extractor = get_youtube_extractor()

    # YouTube URLの検証
    if not extractor.is_valid_youtube_url(request.url):
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL"
        )

    # 音声を抽出
    extraction_result = extractor.extract_audio(request.url)

    if not extraction_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract audio: {extraction_result.get('error', 'Unknown error')}"
        )

    audio_path = extraction_result["file_path"]

    try:
        # 文字起こしと話者分離を実行
        result = await process_audio(
            audio_path,
            request.language,
            {
                "SPEAKER_00": request.speaker_a_name,
                "SPEAKER_01": request.speaker_b_name
            }
        )

        # メタデータを追加
        result.metadata = extraction_result["metadata"]

        # 処理完了後にファイルを削除
        background_tasks.add_task(cleanup_file, audio_path)

        return result

    except Exception as e:
        # エラー時もファイルを削除
        background_tasks.add_task(cleanup_file, audio_path)
        raise HTTPException(status_code=500, detail=str(e))


async def process_audio(
    audio_path: str,
    language: str,
    speaker_names: Dict[str, str]
) -> TranscriptionResponse:
    """
    音声ファイルを処理して文字起こしと話者分離を実行

    Args:
        audio_path: 音声ファイルのパス
        language: 言語コード
        speaker_names: 話者名のマッピング

    Returns:
        TranscriptionResponse
    """
    try:
        # サービスを取得
        transcription_service = get_transcription_service()
        diarization_service = get_diarization_service()

        # 1. 文字起こし
        print(f"Starting transcription for: {audio_path}")
        transcription_result = transcription_service.transcribe(audio_path, language)
        transcription_segments = transcription_result["segments"]
        print(f"Transcription complete. {len(transcription_segments)} segments found.")

        # 2. 話者分離
        print("Starting speaker diarization...")
        speaker_segments = diarization_service.diarize(audio_path)
        print(f"Diarization complete. {len(speaker_segments)} speaker segments found.")

        # 3. マージ
        merged_segments = diarization_service.merge_transcription_with_speakers(
            transcription_segments,
            speaker_segments
        )

        # 4. 会話形式にフォーマット
        conversation = diarization_service.format_conversation(
            merged_segments,
            speaker_names
        )

        return TranscriptionResponse(
            success=True,
            conversation=conversation,
            segments=merged_segments,
            metadata=None,
            error=None
        )

    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        return TranscriptionResponse(
            success=False,
            conversation="",
            segments=[],
            metadata=None,
            error=str(e)
        )


@router.get("/youtube/info")
async def get_youtube_info(url: str):
    """
    YouTube動画の情報を取得（ダウンロードなし）
    """
    extractor = get_youtube_extractor()

    if not extractor.is_valid_youtube_url(url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    info = extractor.get_video_info(url)

    if info is None:
        raise HTTPException(status_code=500, detail="Failed to fetch video info")

    return info
