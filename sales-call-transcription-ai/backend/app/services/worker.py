"""
Background Worker - バックグラウンド処理ワーカー
長時間音声の文字起こしと話者分離を非同期で実行
"""

import os
import threading
import queue
import time
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

from .job_manager import job_manager, JobStatus, Job
from .transcription import TranscriptionService
from .speaker_diarization import SpeakerDiarizationService


class BackgroundWorker:
    """バックグラウンド処理ワーカー"""

    def __init__(self, max_workers: int = 2):
        self.task_queue = queue.Queue()
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.transcription_service: Optional[TranscriptionService] = None
        self.diarization_service: Optional[SpeakerDiarizationService] = None
        self._running = False
        self._worker_thread: Optional[threading.Thread] = None

    def start(self):
        """ワーカーを開始"""
        if self._running:
            return

        self._running = True
        self._worker_thread = threading.Thread(target=self._process_queue, daemon=True)
        self._worker_thread.start()
        print("Background worker started")

    def stop(self):
        """ワーカーを停止"""
        self._running = False
        if self._worker_thread:
            self._worker_thread.join(timeout=5)
        self.executor.shutdown(wait=False)
        print("Background worker stopped")

    def submit_job(self, job_id: str):
        """ジョブをキューに追加"""
        self.task_queue.put(job_id)
        print(f"Job {job_id} submitted to queue")

    def _process_queue(self):
        """キューからジョブを取り出して処理"""
        while self._running:
            try:
                job_id = self.task_queue.get(timeout=1)
                self.executor.submit(self._process_job, job_id)
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Queue processing error: {e}")

    def _get_transcription_service(self) -> TranscriptionService:
        """文字起こしサービスを取得（遅延初期化）"""
        if self.transcription_service is None:
            model_size = os.getenv("WHISPER_MODEL", "base")
            self.transcription_service = TranscriptionService(model_size=model_size)
        return self.transcription_service

    def _get_diarization_service(self) -> SpeakerDiarizationService:
        """話者分離サービスを取得（遅延初期化）"""
        if self.diarization_service is None:
            self.diarization_service = SpeakerDiarizationService(num_speakers=2)
        return self.diarization_service

    def _process_job(self, job_id: str):
        """ジョブを処理"""
        print(f"Processing job: {job_id}")

        job = job_manager.get_job(job_id)
        if not job:
            print(f"Job {job_id} not found")
            return

        try:
            # 処理開始
            job_manager.update_job(
                job_id,
                status=JobStatus.PROCESSING,
                progress=5.0,
                message="処理を開始しています..."
            )

            audio_path = job.audio_path
            if not audio_path or not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")

            # 文字起こし
            job_manager.update_job(
                job_id,
                status=JobStatus.TRANSCRIBING,
                progress=10.0,
                message="音声を文字起こししています... (これには時間がかかります)"
            )

            transcription_service = self._get_transcription_service()
            transcription_result = transcription_service.transcribe(audio_path, job.language)
            transcription_segments = transcription_result["segments"]

            print(f"Transcription complete: {len(transcription_segments)} segments")

            job_manager.update_job(
                job_id,
                progress=60.0,
                message=f"文字起こし完了 ({len(transcription_segments)}セグメント)。話者を識別しています..."
            )

            # 話者分離
            job_manager.update_job(
                job_id,
                status=JobStatus.DIARIZING,
                progress=65.0,
                message="話者を識別しています..."
            )

            diarization_service = self._get_diarization_service()
            speaker_segments = diarization_service.diarize(audio_path)

            print(f"Diarization complete: {len(speaker_segments)} speaker segments")

            job_manager.update_job(
                job_id,
                progress=85.0,
                message="話者識別完了。結果を整形しています..."
            )

            # マージ
            merged_segments = diarization_service.merge_transcription_with_speakers(
                transcription_segments,
                speaker_segments
            )

            # 会話形式にフォーマット
            speaker_names = {
                "SPEAKER_00": job.speaker_a_name,
                "SPEAKER_01": job.speaker_b_name
            }
            conversation = diarization_service.format_conversation(merged_segments, speaker_names)

            # 結果を保存
            result = {
                "success": True,
                "conversation": conversation,
                "segments": merged_segments,
                "metadata": job.metadata,
                "stats": {
                    "total_segments": len(merged_segments),
                    "speaker_a_segments": sum(1 for s in merged_segments if s["speaker"] == "SPEAKER_00"),
                    "speaker_b_segments": sum(1 for s in merged_segments if s["speaker"] == "SPEAKER_01"),
                }
            }

            job_manager.update_job(
                job_id,
                status=JobStatus.COMPLETED,
                progress=100.0,
                message="処理が完了しました！",
                result=result
            )

            print(f"Job {job_id} completed successfully")

            # 音声ファイルを削除
            try:
                if os.path.exists(audio_path):
                    os.remove(audio_path)
            except:
                pass

        except Exception as e:
            print(f"Job {job_id} failed: {str(e)}")
            import traceback
            traceback.print_exc()

            job_manager.update_job(
                job_id,
                status=JobStatus.FAILED,
                progress=0.0,
                message="処理中にエラーが発生しました",
                error=str(e)
            )


# グローバルインスタンス
worker = BackgroundWorker()
