# Sales Call Transcription AI
## 営業通話文字起こし・話者分離AI

営業録画やMP3ファイル、YouTubeリンクをアップロードすると、2名の話者を自動で識別し、すべての会話を文字起こしするAIアプリケーションです。

![Demo](https://via.placeholder.com/800x400?text=Sales+Call+Transcription+AI)

## 機能

- **MP3/音声ファイルのアップロード** - MP3, WAV, M4A, OGG, FLAC, WebM形式に対応
- **YouTubeリンクからの音声抽出** - URLを貼り付けるだけで自動的に音声を抽出
- **高精度な音声認識** - OpenAI Whisperによる多言語対応の文字起こし
- **話者分離（ダイアライゼーション）** - pyannote.audioによる2人の話者の自動識別
- **会話形式の出力** - タイムスタンプ付きの見やすい会話形式で表示
- **結果のエクスポート** - テキストファイルとしてダウンロード、クリップボードへのコピー

## 技術スタック

### バックエンド
- **FastAPI** - 高速なPython Webフレームワーク
- **OpenAI Whisper** - 高精度な音声認識モデル
- **pyannote.audio** - 話者分離（ダイアライゼーション）
- **yt-dlp** - YouTube音声抽出

### フロントエンド
- **Vanilla JavaScript** - 軽量で高速なUI
- **モダンCSS** - レスポンシブデザイン

### インフラ
- **Docker** - コンテナ化
- **Nginx** - リバースプロキシ

## セットアップ

### 必要条件

- Docker & Docker Compose
- Hugging Face アカウント（話者分離機能を使用する場合）

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd sales-call-transcription-ai
```

### 2. 環境変数を設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、Hugging Face トークンを設定:

```env
HF_TOKEN=your_huggingface_token_here
WHISPER_MODEL=base
```

#### Hugging Face トークンの取得方法

1. [Hugging Face](https://huggingface.co/) でアカウントを作成
2. [Settings > Access Tokens](https://huggingface.co/settings/tokens) でトークンを生成
3. 以下のモデルの利用規約に同意:
   - [pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1)
   - [pyannote/segmentation-3.0](https://huggingface.co/pyannote/segmentation-3.0)

### 3. Dockerで起動

```bash
docker-compose up -d --build
```

### 4. アクセス

- **フロントエンド**: http://localhost:3000
- **API ドキュメント**: http://localhost:8000/docs

## ローカル開発（Dockerなし）

### バックエンド

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### フロントエンド

```bash
cd frontend
# 任意のHTTPサーバーで起動
python -m http.server 3000
```

## API エンドポイント

### ファイルアップロードによる文字起こし

```
POST /api/transcribe/file
```

**パラメータ:**
- `file`: 音声ファイル (multipart/form-data)
- `language`: 言語コード (ja, en, zh, ko)
- `speaker_a_name`: 話者Aの名前
- `speaker_b_name`: 話者Bの名前

### YouTubeリンクによる文字起こし

```
POST /api/transcribe/youtube
```

**リクエストボディ:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "language": "ja",
  "speaker_a_name": "営業担当",
  "speaker_b_name": "お客様"
}
```

### レスポンス例

```json
{
  "success": true,
  "conversation": "[00:00] 営業担当: お忙しいところ...\n\n[00:15] お客様: はい、よろしくお願いします...",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 5.2,
      "text": "お忙しいところありがとうございます",
      "speaker": "SPEAKER_00"
    }
  ],
  "metadata": null
}
```

## Whisperモデルサイズ

| モデル | パラメータ数 | メモリ使用量 | 相対速度 | 精度 |
|--------|------------|-------------|---------|------|
| tiny   | 39M        | ~1GB        | ~32x    | 低   |
| base   | 74M        | ~1GB        | ~16x    | 中   |
| small  | 244M       | ~2GB        | ~6x     | 高   |
| medium | 769M       | ~5GB        | ~2x     | 高+  |
| large  | 1550M      | ~10GB       | 1x      | 最高 |

## トラブルシューティング

### 話者分離が動作しない

- Hugging Face トークンが正しく設定されているか確認
- pyannote モデルの利用規約に同意しているか確認
- HF_TOKEN が無い場合、簡易的な話者分離（無音検出ベース）にフォールバックします

### 文字起こしが遅い

- WHISPER_MODEL を `tiny` または `base` に変更
- GPU が利用可能な環境で実行

### YouTubeの音声が抽出できない

- yt-dlp を最新版に更新
- 動画が地域制限や年齢制限がないか確認

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して議論してください。
