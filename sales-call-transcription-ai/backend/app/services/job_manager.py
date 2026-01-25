"""
Job Manager - バックグラウンドジョブ管理
長時間の音声処理を非同期で実行
"""

import os
import uuid
import json
import asyncio
import threading
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum
from dataclasses import dataclass, asdict
from pathlib import Path


class JobStatus(str, Enum):
    PENDING = "pending"          # 待機中
    PROCESSING = "processing"    # 処理中
    TRANSCRIBING = "transcribing"  # 文字起こし中
    DIARIZING = "diarizing"      # 話者分離中
    COMPLETED = "completed"      # 完了
    FAILED = "failed"            # 失敗


@dataclass
class Job:
    id: str
    status: JobStatus
    progress: float  # 0-100
    message: str
    created_at: str
    updated_at: str
    audio_path: Optional[str] = None
    language: str = "ja"
    speaker_a_name: str = "営業担当"
    speaker_b_name: str = "お客様"
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class JobManager:
    """ジョブ管理クラス"""

    def __init__(self, jobs_dir: str = "jobs"):
        self.jobs: Dict[str, Job] = {}
        self.jobs_dir = Path(jobs_dir)
        self.jobs_dir.mkdir(exist_ok=True)
        self._lock = threading.Lock()

    def create_job(
        self,
        audio_path: str,
        language: str = "ja",
        speaker_a_name: str = "営業担当",
        speaker_b_name: str = "お客様",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Job:
        """新しいジョブを作成"""
        job_id = str(uuid.uuid4())[:12]
        now = datetime.now().isoformat()

        job = Job(
            id=job_id,
            status=JobStatus.PENDING,
            progress=0.0,
            message="ジョブを作成しました",
            created_at=now,
            updated_at=now,
            audio_path=audio_path,
            language=language,
            speaker_a_name=speaker_a_name,
            speaker_b_name=speaker_b_name,
            metadata=metadata
        )

        with self._lock:
            self.jobs[job_id] = job
            self._save_job(job)

        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        """ジョブを取得"""
        with self._lock:
            if job_id in self.jobs:
                return self.jobs[job_id]

            # ファイルから読み込み
            job_file = self.jobs_dir / f"{job_id}.json"
            if job_file.exists():
                with open(job_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    job = Job(**data)
                    self.jobs[job_id] = job
                    return job

        return None

    def update_job(
        self,
        job_id: str,
        status: Optional[JobStatus] = None,
        progress: Optional[float] = None,
        message: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> Optional[Job]:
        """ジョブを更新"""
        with self._lock:
            job = self.jobs.get(job_id)
            if not job:
                return None

            if status is not None:
                job.status = status
            if progress is not None:
                job.progress = progress
            if message is not None:
                job.message = message
            if result is not None:
                job.result = result
            if error is not None:
                job.error = error

            job.updated_at = datetime.now().isoformat()
            self._save_job(job)

            return job

    def _save_job(self, job: Job):
        """ジョブをファイルに保存"""
        job_file = self.jobs_dir / f"{job.id}.json"
        with open(job_file, "w", encoding="utf-8") as f:
            json.dump(job.to_dict(), f, ensure_ascii=False, indent=2)

    def delete_job(self, job_id: str) -> bool:
        """ジョブを削除"""
        with self._lock:
            if job_id in self.jobs:
                job = self.jobs.pop(job_id)
                # 音声ファイルも削除
                if job.audio_path and os.path.exists(job.audio_path):
                    try:
                        os.remove(job.audio_path)
                    except:
                        pass

            job_file = self.jobs_dir / f"{job_id}.json"
            if job_file.exists():
                job_file.unlink()
                return True

        return False

    def list_jobs(self, limit: int = 50) -> list:
        """最近のジョブ一覧を取得"""
        jobs = []

        # メモリ上のジョブ
        with self._lock:
            jobs.extend(self.jobs.values())

        # ファイルからも読み込み
        for job_file in sorted(self.jobs_dir.glob("*.json"), reverse=True)[:limit]:
            job_id = job_file.stem
            if job_id not in [j.id for j in jobs]:
                job = self.get_job(job_id)
                if job:
                    jobs.append(job)

        # 作成日時でソート
        jobs.sort(key=lambda j: j.created_at, reverse=True)
        return jobs[:limit]


# グローバルインスタンス
job_manager = JobManager()
