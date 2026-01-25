"""
Sales Call Transcription AI - Main Application
営業通話の文字起こしと話者分離AI
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.routers import transcribe

load_dotenv()

app = FastAPI(
    title="Sales Call Transcription AI",
    description="営業通話をMP3またはYouTubeリンクから文字起こしし、話者を分離するAI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# アップロードディレクトリの作成
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ルーターの登録
app.include_router(transcribe.router, prefix="/api", tags=["transcription"])


@app.get("/")
async def root():
    return {
        "message": "Sales Call Transcription AI",
        "version": "1.0.0",
        "endpoints": {
            "transcribe_file": "POST /api/transcribe/file",
            "transcribe_youtube": "POST /api/transcribe/youtube",
            "health": "GET /api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
