"""
YouTube Extractor Service - YouTubeから音声を抽出
"""

import os
import re
import uuid
from typing import Optional, Dict, Any
import yt_dlp


class YouTubeExtractor:
    """YouTubeから音声を抽出するサービス"""

    def __init__(self, output_dir: str = "uploads"):
        """
        Args:
            output_dir: 出力ディレクトリ
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def is_valid_youtube_url(self, url: str) -> bool:
        """
        YouTubeのURLかどうかを検証

        Args:
            url: 検証するURL

        Returns:
            有効なYouTube URLならTrue
        """
        youtube_patterns = [
            r'(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+',
            r'(https?://)?(www\.)?youtu\.be/[\w-]+',
            r'(https?://)?(www\.)?youtube\.com/embed/[\w-]+',
            r'(https?://)?(www\.)?youtube\.com/v/[\w-]+'
        ]

        for pattern in youtube_patterns:
            if re.match(pattern, url):
                return True
        return False

    def extract_audio(self, url: str, output_format: str = "mp3") -> Dict[str, Any]:
        """
        YouTubeから音声を抽出

        Args:
            url: YouTubeのURL
            output_format: 出力フォーマット（mp3, wav）

        Returns:
            抽出結果（ファイルパス、メタデータ）
        """
        if not self.is_valid_youtube_url(url):
            raise ValueError(f"Invalid YouTube URL: {url}")

        # 一意のファイル名を生成
        unique_id = str(uuid.uuid4())[:8]
        output_template = os.path.join(self.output_dir, f"youtube_{unique_id}")

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': output_format,
                'preferredquality': '192',
            }],
            'outtmpl': output_template,
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)

                output_path = f"{output_template}.{output_format}"

                return {
                    "success": True,
                    "file_path": output_path,
                    "metadata": {
                        "title": info.get("title", "Unknown"),
                        "duration": info.get("duration", 0),
                        "uploader": info.get("uploader", "Unknown"),
                        "upload_date": info.get("upload_date", "Unknown"),
                        "view_count": info.get("view_count", 0),
                        "description": info.get("description", "")[:500]
                    }
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "file_path": None,
                "metadata": None
            }

    def get_video_info(self, url: str) -> Optional[Dict[str, Any]]:
        """
        動画情報のみを取得（ダウンロードなし）

        Args:
            url: YouTubeのURL

        Returns:
            動画のメタデータ
        """
        if not self.is_valid_youtube_url(url):
            return None

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                return {
                    "title": info.get("title", "Unknown"),
                    "duration": info.get("duration", 0),
                    "uploader": info.get("uploader", "Unknown"),
                    "thumbnail": info.get("thumbnail", ""),
                    "description": info.get("description", "")[:500]
                }

        except Exception as e:
            return None

    def cleanup(self, file_path: str) -> bool:
        """
        一時ファイルを削除

        Args:
            file_path: 削除するファイルのパス

        Returns:
            削除成功ならTrue
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
