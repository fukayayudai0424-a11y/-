"""
Transcription Service - Whisperを使用した音声文字起こし
"""

import whisper
import torch
from typing import List, Dict, Any
import os


class TranscriptionService:
    """OpenAI Whisperを使用した音声文字起こしサービス"""

    def __init__(self, model_size: str = "base"):
        """
        Args:
            model_size: Whisperモデルサイズ (tiny, base, small, medium, large)
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading Whisper model '{model_size}' on {self.device}...")
        self.model = whisper.load_model(model_size, device=self.device)
        print("Whisper model loaded successfully!")

    def transcribe(self, audio_path: str, language: str = "ja") -> Dict[str, Any]:
        """
        音声ファイルを文字起こしする

        Args:
            audio_path: 音声ファイルのパス
            language: 言語コード (ja: 日本語, en: 英語)

        Returns:
            文字起こし結果（セグメント情報含む）
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        result = self.model.transcribe(
            audio_path,
            language=language,
            task="transcribe",
            verbose=False,
            word_timestamps=True
        )

        return {
            "text": result["text"],
            "segments": [
                {
                    "id": seg["id"],
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip()
                }
                for seg in result["segments"]
            ],
            "language": result["language"]
        }

    def get_segments_with_timestamps(self, audio_path: str, language: str = "ja") -> List[Dict[str, Any]]:
        """
        タイムスタンプ付きのセグメントを取得

        Args:
            audio_path: 音声ファイルのパス
            language: 言語コード

        Returns:
            セグメントのリスト
        """
        result = self.transcribe(audio_path, language)
        return result["segments"]
