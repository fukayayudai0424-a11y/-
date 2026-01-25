"""
Sales Call Transcription AI - Main Application
営業通話の文字起こしと話者分離AI（2時間以上の長時間音声対応）
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import transcribe
from app.services.worker import worker

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時
    print("Starting background worker...")
    worker.start()
    yield
    # 終了時
    print("Stopping background worker...")
    worker.stop()


app = FastAPI(
    title="Sales Call Transcription AI",
    description="営業通話をMP3またはYouTubeリンクから文字起こしし、話者を分離するAI（2時間以上対応）",
    version="2.0.0",
    lifespan=lifespan
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ディレクトリの作成
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
JOBS_DIR = os.path.join(BASE_DIR, "jobs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(JOBS_DIR, exist_ok=True)

# ルーターの登録
app.include_router(transcribe.router, prefix="/api", tags=["transcription"])


@app.get("/")
async def root():
    return {
        "message": "Sales Call Transcription AI",
        "version": "2.0.0",
        "features": [
            "2時間以上の長時間音声に対応",
            "リアルタイム進捗表示",
            "話者分離（2名）"
        ],
        "endpoints": {
            "長時間音声（推奨）": {
                "create_job_file": "POST /api/jobs/file",
                "create_job_youtube": "POST /api/jobs/youtube",
                "check_status": "GET /api/jobs/{job_id}",
                "list_jobs": "GET /api/jobs"
            },
            "短時間音声（5分以内）": {
                "transcribe_file": "POST /api/transcribe/file",
                "transcribe_youtube": "POST /api/transcribe/youtube"
            },
            "その他": {
                "youtube_info": "GET /api/youtube/info",
                "health": "GET /api/health"
            }
        }
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "worker": "running" if worker._running else "stopped"
    }
