"""
Speaker Diarization Service - 話者分離サービス
pyannote.audioを使用して誰が話しているかを識別
"""

import os
import torch
from typing import List, Dict, Any, Tuple
from pyannote.audio import Pipeline
from pyannote.audio.pipelines.utils.hook import ProgressHook


class SpeakerDiarizationService:
    """話者分離（ダイアライゼーション）サービス"""

    def __init__(self, hf_token: str = None, num_speakers: int = 2):
        """
        Args:
            hf_token: Hugging Face APIトークン
            num_speakers: 話者数（デフォルト: 2人）
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.num_speakers = num_speakers
        self.hf_token = hf_token or os.getenv("HF_TOKEN")

        if not self.hf_token:
            print("Warning: HF_TOKEN not set. Using simple diarization fallback.")
            self.pipeline = None
        else:
            print("Loading speaker diarization pipeline...")
            self.pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=self.hf_token
            )
            self.pipeline.to(self.device)
            print("Speaker diarization pipeline loaded!")

    def diarize(self, audio_path: str) -> List[Dict[str, Any]]:
        """
        音声ファイルから話者を分離

        Args:
            audio_path: 音声ファイルのパス

        Returns:
            話者セグメントのリスト
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        if self.pipeline is None:
            # フォールバック: 簡易的な話者分離
            return self._simple_diarization(audio_path)

        # pyannoteによる話者分離
        diarization = self.pipeline(
            audio_path,
            num_speakers=self.num_speakers
        )

        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker,
                "duration": turn.end - turn.start
            })

        return segments

    def _simple_diarization(self, audio_path: str) -> List[Dict[str, Any]]:
        """
        簡易的な話者分離（pyannoteが使えない場合のフォールバック）
        音声の無音部分を検出して話者を交互に割り当て
        """
        from pydub import AudioSegment
        from pydub.silence import detect_nonsilent

        audio = AudioSegment.from_file(audio_path)
        nonsilent_ranges = detect_nonsilent(
            audio,
            min_silence_len=500,
            silence_thresh=-40
        )

        segments = []
        current_speaker = "SPEAKER_00"

        for i, (start_ms, end_ms) in enumerate(nonsilent_ranges):
            # 前のセグメントとの間隔が1秒以上なら話者を切り替え
            if i > 0:
                gap = start_ms - nonsilent_ranges[i - 1][1]
                if gap > 1000:
                    current_speaker = "SPEAKER_01" if current_speaker == "SPEAKER_00" else "SPEAKER_00"

            segments.append({
                "start": start_ms / 1000.0,
                "end": end_ms / 1000.0,
                "speaker": current_speaker,
                "duration": (end_ms - start_ms) / 1000.0
            })

        return segments

    def merge_transcription_with_speakers(
        self,
        transcription_segments: List[Dict[str, Any]],
        speaker_segments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        文字起こし結果と話者分離結果をマージ

        Args:
            transcription_segments: Whisperからの文字起こしセグメント
            speaker_segments: 話者分離セグメント

        Returns:
            話者情報付きの文字起こしセグメント
        """
        result = []

        for trans_seg in transcription_segments:
            trans_start = trans_seg["start"]
            trans_end = trans_seg["end"]
            trans_mid = (trans_start + trans_end) / 2

            # 最も重なりが大きい話者セグメントを見つける
            best_speaker = "UNKNOWN"
            best_overlap = 0

            for spk_seg in speaker_segments:
                spk_start = spk_seg["start"]
                spk_end = spk_seg["end"]

                # 重なり時間を計算
                overlap_start = max(trans_start, spk_start)
                overlap_end = min(trans_end, spk_end)
                overlap = max(0, overlap_end - overlap_start)

                if overlap > best_overlap:
                    best_overlap = overlap
                    best_speaker = spk_seg["speaker"]

            result.append({
                "id": trans_seg["id"],
                "start": trans_start,
                "end": trans_end,
                "text": trans_seg["text"],
                "speaker": best_speaker
            })

        return result

    def format_conversation(
        self,
        merged_segments: List[Dict[str, Any]],
        speaker_names: Dict[str, str] = None
    ) -> str:
        """
        会話形式でフォーマット

        Args:
            merged_segments: マージされたセグメント
            speaker_names: 話者名のマッピング（例: {"SPEAKER_00": "営業担当", "SPEAKER_01": "お客様"}）

        Returns:
            フォーマットされた会話テキスト
        """
        if speaker_names is None:
            speaker_names = {
                "SPEAKER_00": "話者A",
                "SPEAKER_01": "話者B"
            }

        lines = []
        current_speaker = None
        current_text = []
        current_start = None

        for seg in merged_segments:
            speaker = speaker_names.get(seg["speaker"], seg["speaker"])

            if speaker != current_speaker:
                if current_speaker is not None and current_text:
                    time_str = self._format_time(current_start)
                    lines.append(f"[{time_str}] {current_speaker}: {''.join(current_text)}")

                current_speaker = speaker
                current_text = [seg["text"]]
                current_start = seg["start"]
            else:
                current_text.append(seg["text"])

        # 最後のセグメントを追加
        if current_speaker is not None and current_text:
            time_str = self._format_time(current_start)
            lines.append(f"[{time_str}] {current_speaker}: {''.join(current_text)}")

        return "\n\n".join(lines)

    def _format_time(self, seconds: float) -> str:
        """秒を MM:SS 形式に変換"""
        minutes = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{minutes:02d}:{secs:02d}"
