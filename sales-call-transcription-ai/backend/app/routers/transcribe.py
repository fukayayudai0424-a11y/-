"""
Transcription API Router
文字起こしAPIエンドポイント（非同期ジョブ対応版）
"""

import os
import uuid
import shutil
from typing import Optional, Dict, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.services.transcription import TranscriptionService
from app.services.speaker_diarization import SpeakerDiarizationService
from app.services.youtube_extractor import YouTubeExtractor
from app.services.job_manager import job_manager, JobStatus
from app.services.worker import worker

router = APIRouter()

# サービスのインスタンス（遅延初期化）
_youtube_extractor: Optional[YouTubeExtractor] = None

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
JOBS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "jobs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)


def get_youtube_extractor() -> YouTubeExtractor:
    global _youtube_extractor
    if _youtube_extractor is None:
        _youtube_extractor = YouTubeExtractor(output_dir=UPLOAD_DIR)
    return _youtube_extractor


# ========== リクエスト/レスポンスモデル ==========

class YouTubeRequest(BaseModel):
    url: str
    language: str = "ja"
    speaker_a_name: str = "営業担当"
    speaker_b_name: str = "お客様"


class JobResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    message: str
    created_at: str
    updated_at: str
    result: Optional[dict] = None
    error: Optional[str] = None


class TranscriptionResponse(BaseModel):
    success: bool
    conversation: str
    segments: list
    metadata: Optional[dict] = None
    error: Optional[str] = None


# ========== 非同期ジョブAPI（長時間音声用） ==========

@router.post("/jobs/file", response_model=JobResponse)
async def create_file_job(
    file: UploadFile = File(...),
    language: str = Form(default="ja"),
    speaker_a_name: str = Form(default="営業担当"),
    speaker_b_name: str = Form(default="お客様")
):
    """
    【長時間音声用】ファイルアップロードでジョブを作成

    - 2時間以上の音声に対応
    - ジョブIDを返し、進捗は /api/jobs/{job_id} で確認
    """
    # ファイル形式の検証
    allowed_extensions = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )

    # ファイルを保存
    unique_id = str(uuid.uuid4())[:8]
    audio_path = os.path.join(UPLOAD_DIR, f"job_{unique_id}{file_ext}")

    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # ジョブを作成
    job = job_manager.create_job(
        audio_path=audio_path,
        language=language,
        speaker_a_name=speaker_a_name,
        speaker_b_name=speaker_b_name,
        metadata={"filename": file.filename}
    )

    # ワーカーにジョブを送信
    worker.submit_job(job.id)

    return JobResponse(
        job_id=job.id,
        status=job.status.value,
        progress=job.progress,
        message="ジョブを作成しました。処理を開始します..."
    )


@router.post("/jobs/youtube", response_model=JobResponse)
async def create_youtube_job(request: YouTubeRequest):
    """
    【長時間音声用】YouTubeリンクでジョブを作成

    - 2時間以上の動画に対応
    - ジョブIDを返し、進捗は /api/jobs/{job_id} で確認
    """
    extractor = get_youtube_extractor()

    # URL検証
    if not extractor.is_valid_youtube_url(request.url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # 音声を抽出
    extraction_result = extractor.extract_audio(request.url)

    if not extraction_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract audio: {extraction_result.get('error', 'Unknown error')}"
        )

    # ジョブを作成
    job = job_manager.create_job(
        audio_path=extraction_result["file_path"],
        language=request.language,
        speaker_a_name=request.speaker_a_name,
        speaker_b_name=request.speaker_b_name,
        metadata=extraction_result["metadata"]
    )

    # ワーカーにジョブを送信
    worker.submit_job(job.id)

    return JobResponse(
        job_id=job.id,
        status=job.status.value,
        progress=job.progress,
        message="ジョブを作成しました。処理を開始します..."
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    ジョブの状態を取得

    - status: pending, processing, transcribing, diarizing, completed, failed
    - progress: 0-100
    - 完了時は result に結果が入る
    """
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(
        job_id=job.id,
        status=job.status.value,
        progress=job.progress,
        message=job.message,
        created_at=job.created_at,
        updated_at=job.updated_at,
        result=job.result,
        error=job.error
    )


@router.get("/jobs", response_model=List[JobStatusResponse])
async def list_jobs(limit: int = 20):
    """
    ジョブ一覧を取得
    """
    jobs = job_manager.list_jobs(limit=limit)

    return [
        JobStatusResponse(
            job_id=job.id,
            status=job.status.value,
            progress=job.progress,
            message=job.message,
            created_at=job.created_at,
            updated_at=job.updated_at,
            result=job.result if job.status == JobStatus.COMPLETED else None,
            error=job.error
        )
        for job in jobs
    ]


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """
    ジョブを削除
    """
    success = job_manager.delete_job(job_id)

    if not success:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"message": "Job deleted successfully"}


# ========== 同期API（短時間音声用・後方互換） ==========

def cleanup_file(file_path: str):
    """バックグラウンドでファイルを削除"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass


@router.post("/transcribe/file", response_model=TranscriptionResponse)
async def transcribe_file_sync(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = Form(default="ja"),
    speaker_a_name: str = Form(default="営業担当"),
    speaker_b_name: str = Form(default="お客様")
):
    """
    【短時間音声用】同期的に文字起こし（5分以内推奨）

    長時間音声は /api/jobs/file を使用してください
    """
    from app.services.transcription import TranscriptionService
    from app.services.speaker_diarization import SpeakerDiarizationService

    allowed_extensions = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"]
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )

    unique_id = str(uuid.uuid4())[:8]
    temp_path = os.path.join(UPLOAD_DIR, f"sync_{unique_id}{file_ext}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 同期処理
        model_size = os.getenv("WHISPER_MODEL", "base")
        transcription_service = TranscriptionService(model_size=model_size)
        diarization_service = SpeakerDiarizationService(num_speakers=2)

        transcription_result = transcription_service.transcribe(temp_path, language)
        transcription_segments = transcription_result["segments"]

        speaker_segments = diarization_service.diarize(temp_path)

        merged_segments = diarization_service.merge_transcription_with_speakers(
            transcription_segments,
            speaker_segments
        )

        speaker_names = {
            "SPEAKER_00": speaker_a_name,
            "SPEAKER_01": speaker_b_name
        }
        conversation = diarization_service.format_conversation(merged_segments, speaker_names)

        background_tasks.add_task(cleanup_file, temp_path)

        return TranscriptionResponse(
            success=True,
            conversation=conversation,
            segments=merged_segments,
            metadata=None,
            error=None
        )

    except Exception as e:
        background_tasks.add_task(cleanup_file, temp_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcribe/youtube", response_model=TranscriptionResponse)
async def transcribe_youtube_sync(
    request: YouTubeRequest,
    background_tasks: BackgroundTasks
):
    """
    【短時間動画用】同期的に文字起こし（5分以内推奨）

    長時間動画は /api/jobs/youtube を使用してください
    """
    from app.services.transcription import TranscriptionService
    from app.services.speaker_diarization import SpeakerDiarizationService

    extractor = get_youtube_extractor()

    if not extractor.is_valid_youtube_url(request.url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    extraction_result = extractor.extract_audio(request.url)

    if not extraction_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract audio: {extraction_result.get('error', 'Unknown error')}"
        )

    audio_path = extraction_result["file_path"]

    try:
        model_size = os.getenv("WHISPER_MODEL", "base")
        transcription_service = TranscriptionService(model_size=model_size)
        diarization_service = SpeakerDiarizationService(num_speakers=2)

        transcription_result = transcription_service.transcribe(audio_path, request.language)
        transcription_segments = transcription_result["segments"]

        speaker_segments = diarization_service.diarize(audio_path)

        merged_segments = diarization_service.merge_transcription_with_speakers(
            transcription_segments,
            speaker_segments
        )

        speaker_names = {
            "SPEAKER_00": request.speaker_a_name,
            "SPEAKER_01": request.speaker_b_name
        }
        conversation = diarization_service.format_conversation(merged_segments, speaker_names)

        background_tasks.add_task(cleanup_file, audio_path)

        return TranscriptionResponse(
            success=True,
            conversation=conversation,
            segments=merged_segments,
            metadata=extraction_result["metadata"],
            error=None
        )

    except Exception as e:
        background_tasks.add_task(cleanup_file, audio_path)
        raise HTTPException(status_code=500, detail=str(e))


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
