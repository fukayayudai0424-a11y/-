/**
 * 営業録画 文字起こしAI
 * Sales Recording Transcriber with Speaker Diarization
 */

// ============================================
// グローバル変数
// ============================================
let selectedFile = null;
let transcriptionResult = [];
let currentTab = 'file';

// ============================================
// 初期化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeFileUpload();
    loadSavedApiKey();
});

// ============================================
// タブ切り替え
// ============================================
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    currentTab = tab;

    // タブボタンの状態更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// ============================================
// ファイルアップロード
// ============================================
function initializeFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // ドラッグ＆ドロップ
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // クリックでアップロード
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    // ファイルサイズチェック (25MB制限)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
        showToast('ファイルサイズは25MB以下にしてください');
        return;
    }

    // ファイル形式チェック
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/webm', 'video/mp4', 'video/webm'];
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.mp4'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
        showToast('対応していないファイル形式です');
        return;
    }

    selectedFile = file;

    // UI更新
    document.getElementById('selectedFile').style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;
}

function removeFile() {
    selectedFile = null;
    document.getElementById('selectedFile').style.display = 'none';
    document.getElementById('fileInput').value = '';
}

// ============================================
// API Key管理
// ============================================
function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKey');
    const icon = document.querySelector('.toggle-visibility i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function loadSavedApiKey() {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
    }
}

function saveApiKey(key) {
    localStorage.setItem('openai_api_key', key);
}

// ============================================
// 文字起こし処理
// ============================================
async function startTranscription() {
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!apiKey) {
        showToast('APIキーを入力してください');
        return;
    }

    // APIキーを保存
    saveApiKey(apiKey);

    let audioBlob = null;

    if (currentTab === 'file') {
        if (!selectedFile) {
            showToast('ファイルを選択してください');
            return;
        }
        audioBlob = selectedFile;
    } else {
        const youtubeUrl = document.getElementById('youtubeUrl').value.trim();
        if (!youtubeUrl) {
            showToast('YouTubeのURLを入力してください');
            return;
        }

        // YouTube URLの検証
        if (!isValidYouTubeUrl(youtubeUrl)) {
            showToast('有効なYouTube URLを入力してください');
            return;
        }

        showToast('YouTube動画の音声抽出にはバックエンドサーバーが必要です。MP3ファイルをダウンロードしてアップロードしてください。');
        return;
    }

    // UI更新
    showProgress();

    try {
        // Whisper APIで文字起こし
        updateProgress(10, '音声ファイルを準備中...');

        const transcription = await transcribeWithWhisper(audioBlob, apiKey);

        updateProgress(70, '話者を分析中...');

        // 話者分離処理
        const segments = performSpeakerDiarization(transcription);

        updateProgress(90, '結果を生成中...');

        // 結果を保存
        transcriptionResult = segments;

        // 結果表示
        displayResults(segments);

        updateProgress(100, '完了!');

        setTimeout(() => {
            hideProgress();
            showResults();
        }, 500);

    } catch (error) {
        hideProgress();
        console.error('Transcription error:', error);
        showToast(error.message || '文字起こし中にエラーが発生しました');
    }
}

async function transcribeWithWhisper(audioBlob, apiKey) {
    const formData = new FormData();
    formData.append('file', audioBlob, audioBlob.name || 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ja');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    updateProgress(30, 'Whisper APIに送信中...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    updateProgress(60, '文字起こしデータを処理中...');

    return await response.json();
}

function performSpeakerDiarization(transcription) {
    const segments = transcription.segments || [];
    const speaker1Name = document.getElementById('speaker1Name').value || '話者1';
    const speaker2Name = document.getElementById('speaker2Name').value || '話者2';

    // 話者分離のためのヒューリスティック分析
    // 実際のダイアライゼーションにはpyannoteなど専用ライブラリが必要ですが、
    // ここでは発話パターンと間隔に基づいた簡易的な分離を行います

    const processedSegments = [];
    let currentSpeaker = 1;
    let lastEndTime = 0;

    // 発話特性を分析（文の長さ、疑問形の頻度など）
    const segmentFeatures = segments.map(seg => ({
        text: seg.text,
        start: seg.start,
        end: seg.end,
        duration: seg.end - seg.start,
        isQuestion: /[？?]|ですか|ますか|でしょうか/.test(seg.text),
        hasGreeting: /こんにちは|お世話|ありがとう|よろしく/.test(seg.text),
        wordCount: seg.text.length
    }));

    // クラスタリングによる話者分離
    for (let i = 0; i < segmentFeatures.length; i++) {
        const seg = segmentFeatures[i];
        const gap = seg.start - lastEndTime;

        // 話者交代の判定基準
        // 1. 長い沈黙（1.5秒以上）
        // 2. 質問の後の応答
        // 3. 発話パターンの変化

        let shouldSwitch = false;

        if (gap > 1.5) {
            shouldSwitch = true;
        } else if (i > 0) {
            const prevSeg = segmentFeatures[i - 1];
            // 前の発話が質問で、現在が応答っぽい場合
            if (prevSeg.isQuestion && !seg.isQuestion) {
                shouldSwitch = true;
            }
            // 発話の長さが大きく変化
            if (Math.abs(seg.wordCount - prevSeg.wordCount) > 30) {
                shouldSwitch = true;
            }
        }

        if (shouldSwitch && i > 0) {
            currentSpeaker = currentSpeaker === 1 ? 2 : 1;
        }

        processedSegments.push({
            speaker: currentSpeaker,
            speakerName: currentSpeaker === 1 ? speaker1Name : speaker2Name,
            text: seg.text.trim(),
            start: seg.start,
            end: seg.end,
            duration: seg.duration
        });

        lastEndTime = seg.end;
    }

    // 連続する同一話者のセグメントを統合
    const mergedSegments = [];
    for (const seg of processedSegments) {
        const last = mergedSegments[mergedSegments.length - 1];
        if (last && last.speaker === seg.speaker && (seg.start - last.end) < 2) {
            // 統合
            last.text += seg.text;
            last.end = seg.end;
            last.duration = last.end - last.start;
        } else {
            mergedSegments.push({ ...seg });
        }
    }

    return mergedSegments;
}

// ============================================
// 結果表示
// ============================================
function displayResults(segments) {
    const container = document.getElementById('transcriptContainer');
    container.innerHTML = '';

    let speaker1Duration = 0;
    let speaker2Duration = 0;
    let totalDuration = 0;

    const speaker1Name = document.getElementById('speaker1Name').value || '話者1';
    const speaker2Name = document.getElementById('speaker2Name').value || '話者2';

    segments.forEach((seg, index) => {
        const item = document.createElement('div');
        item.className = `transcript-item speaker-${seg.speaker}`;
        item.style.animationDelay = `${index * 0.05}s`;

        item.innerHTML = `
            <div class="transcript-avatar">
                <i class="fas fa-${seg.speaker === 1 ? 'user' : 'user-tie'}"></i>
            </div>
            <div class="transcript-content">
                <div class="transcript-header">
                    <span class="transcript-speaker">${seg.speakerName}</span>
                    <span class="transcript-time">${formatTime(seg.start)} - ${formatTime(seg.end)}</span>
                </div>
                <p class="transcript-text">${escapeHtml(seg.text)}</p>
            </div>
        `;

        container.appendChild(item);

        // 統計計算
        if (seg.speaker === 1) {
            speaker1Duration += seg.duration;
        } else {
            speaker2Duration += seg.duration;
        }
        totalDuration = Math.max(totalDuration, seg.end);
    });

    // 統計情報更新
    document.getElementById('totalDuration').textContent = formatTime(totalDuration);
    document.getElementById('totalSegments').textContent = segments.length;
    document.getElementById('speaker1Time').textContent = formatTime(speaker1Duration);
    document.getElementById('speaker2Time').textContent = formatTime(speaker2Duration);
    document.getElementById('speaker1Label').textContent = speaker1Name;
    document.getElementById('speaker2Label').textContent = speaker2Name;
}

// ============================================
// プログレス表示
// ============================================
function showProgress() {
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('transcribeBtn').disabled = true;
}

function hideProgress() {
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('transcribeBtn').disabled = false;
}

function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressText').textContent = text;
}

function showResults() {
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// エクスポート機能
// ============================================
function copyToClipboard() {
    const text = transcriptionResult.map(seg =>
        `[${formatTime(seg.start)}] ${seg.speakerName}: ${seg.text}`
    ).join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
        showToast('クリップボードにコピーしました');
    }).catch(() => {
        showToast('コピーに失敗しました');
    });
}

function downloadAsText() {
    const text = transcriptionResult.map(seg =>
        `[${formatTime(seg.start)} - ${formatTime(seg.end)}] ${seg.speakerName}\n${seg.text}`
    ).join('\n\n' + '─'.repeat(50) + '\n\n');

    const header = `営業録画 文字起こし結果\n生成日時: ${new Date().toLocaleString('ja-JP')}\n${'═'.repeat(50)}\n\n`;

    downloadFile(header + text, 'transcription.txt', 'text/plain');
    showToast('テキストファイルをダウンロードしました');
}

function downloadAsCSV() {
    const headers = ['開始時間', '終了時間', '話者', '発言内容'];
    const rows = transcriptionResult.map(seg => [
        formatTime(seg.start),
        formatTime(seg.end),
        seg.speakerName,
        `"${seg.text.replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const bom = '\uFEFF'; // BOMを追加してExcelで日本語が文字化けしないように

    downloadFile(bom + csv, 'transcription.csv', 'text/csv');
    showToast('CSVファイルをダウンロードしました');
}

function downloadAsJSON() {
    const data = {
        generatedAt: new Date().toISOString(),
        totalSegments: transcriptionResult.length,
        segments: transcriptionResult.map(seg => ({
            speaker: seg.speakerName,
            speakerId: seg.speaker,
            startTime: seg.start,
            endTime: seg.end,
            startTimeFormatted: formatTime(seg.start),
            endTimeFormatted: formatTime(seg.end),
            text: seg.text
        }))
    };

    downloadFile(JSON.stringify(data, null, 2), 'transcription.json', 'application/json');
    showToast('JSONファイルをダウンロードしました');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// ユーティリティ
// ============================================
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isValidYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return pattern.test(url);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
