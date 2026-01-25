/**
 * Sales Call Transcription AI - Frontend Application
 * 営業通話文字起こしAI フロントエンド
 */

// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : '';

// DOM Elements
const elements = {
    // Tabs
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),

    // File Upload
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('file-info'),
    fileName: document.getElementById('file-name'),
    fileSize: document.getElementById('file-size'),
    removeFile: document.getElementById('remove-file'),

    // YouTube
    youtubeUrl: document.getElementById('youtube-url'),
    youtubePreview: document.getElementById('youtube-preview'),
    youtubeThumbnail: document.getElementById('youtube-thumbnail'),
    youtubeTitle: document.getElementById('youtube-title'),
    youtubeDuration: document.getElementById('youtube-duration'),

    // Settings
    speakerA: document.getElementById('speaker-a'),
    speakerB: document.getElementById('speaker-b'),
    language: document.getElementById('language'),

    // Submit
    submitBtn: document.getElementById('submit-btn'),

    // Results
    resultsSection: document.getElementById('results-section'),
    conversationView: document.getElementById('conversation-view'),
    segmentsTable: document.getElementById('segments-table'),
    metadata: document.getElementById('metadata'),
    metadataContent: document.getElementById('metadata-content'),
    copyBtn: document.getElementById('copy-btn'),
    downloadBtn: document.getElementById('download-btn'),

    // Loading
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingStatus: document.getElementById('loading-status'),
    steps: {
        upload: document.getElementById('step-upload'),
        transcribe: document.getElementById('step-transcribe'),
        diarize: document.getElementById('step-diarize'),
        complete: document.getElementById('step-complete')
    },

    // Toast
    errorToast: document.getElementById('error-toast'),
    errorMessage: document.getElementById('error-message'),
    successToast: document.getElementById('success-toast'),
    successMessage: document.getElementById('success-message')
};

// State
let state = {
    activeTab: 'file',
    selectedFile: null,
    youtubeUrl: '',
    isProcessing: false,
    lastResult: null
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupTabNavigation();
    setupFileUpload();
    setupYouTubeInput();
    setupSubmitButton();
    setupResultActions();
}

// Tab Navigation
function setupTabNavigation() {
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update active tab
            elements.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content
            elements.tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });

            state.activeTab = tabId;
            updateSubmitButton();
        });
    });
}

// File Upload
function setupFileUpload() {
    // Click to upload
    elements.dropZone.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // File selected
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
    });

    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });

    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Remove file
    elements.removeFile.addEventListener('click', () => {
        state.selectedFile = null;
        elements.fileInput.value = '';
        elements.fileInfo.style.display = 'none';
        elements.dropZone.style.display = 'block';
        updateSubmitButton();
    });
}

function handleFileSelection(file) {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/webm', 'video/webm'];
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'];

    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
        showError('対応していないファイル形式です。MP3, WAV, M4A, OGG, FLAC, WebM形式のファイルをお使いください。');
        return;
    }

    state.selectedFile = file;

    // Update UI
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.dropZone.style.display = 'none';
    elements.fileInfo.style.display = 'flex';

    updateSubmitButton();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// YouTube Input
function setupYouTubeInput() {
    let debounceTimer;

    elements.youtubeUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        state.youtubeUrl = url;

        clearTimeout(debounceTimer);

        if (isValidYouTubeUrl(url)) {
            debounceTimer = setTimeout(() => {
                fetchYouTubeInfo(url);
            }, 500);
        } else {
            elements.youtubePreview.style.display = 'none';
        }

        updateSubmitButton();
    });
}

function isValidYouTubeUrl(url) {
    const patterns = [
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/
    ];

    return patterns.some(pattern => pattern.test(url));
}

async function fetchYouTubeInfo(url) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/youtube/info?url=${encodeURIComponent(url)}`);

        if (response.ok) {
            const info = await response.json();

            elements.youtubeThumbnail.src = info.thumbnail || '';
            elements.youtubeTitle.textContent = info.title || '動画タイトル';
            elements.youtubeDuration.textContent = info.duration
                ? `時間: ${formatDuration(info.duration)}`
                : '';
            elements.youtubePreview.style.display = 'flex';
        }
    } catch (error) {
        console.log('Could not fetch YouTube info');
    }
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Submit Button
function setupSubmitButton() {
    elements.submitBtn.addEventListener('click', handleSubmit);
}

function updateSubmitButton() {
    const canSubmit = (state.activeTab === 'file' && state.selectedFile) ||
                      (state.activeTab === 'youtube' && isValidYouTubeUrl(state.youtubeUrl));

    elements.submitBtn.disabled = !canSubmit || state.isProcessing;
}

async function handleSubmit() {
    if (state.isProcessing) return;

    state.isProcessing = true;
    updateSubmitButton();
    showLoading();

    try {
        let result;

        if (state.activeTab === 'file') {
            result = await transcribeFile();
        } else {
            result = await transcribeYouTube();
        }

        if (result.success) {
            state.lastResult = result;
            displayResults(result);
            showSuccess('文字起こしが完了しました！');
        } else {
            showError(result.error || '処理中にエラーが発生しました');
        }
    } catch (error) {
        showError('処理中にエラーが発生しました: ' + error.message);
    } finally {
        state.isProcessing = false;
        updateSubmitButton();
        hideLoading();
    }
}

async function transcribeFile() {
    updateLoadingStep('upload');

    const formData = new FormData();
    formData.append('file', state.selectedFile);
    formData.append('language', elements.language.value);
    formData.append('speaker_a_name', elements.speakerA.value || '営業担当');
    formData.append('speaker_b_name', elements.speakerB.value || 'お客様');

    updateLoadingStep('transcribe');

    const response = await fetch(`${API_BASE_URL}/api/transcribe/file`, {
        method: 'POST',
        body: formData
    });

    updateLoadingStep('diarize');

    const result = await response.json();

    updateLoadingStep('complete');

    return result;
}

async function transcribeYouTube() {
    updateLoadingStep('upload');

    const body = {
        url: state.youtubeUrl,
        language: elements.language.value,
        speaker_a_name: elements.speakerA.value || '営業担当',
        speaker_b_name: elements.speakerB.value || 'お客様'
    };

    updateLoadingStep('transcribe');

    const response = await fetch(`${API_BASE_URL}/api/transcribe/youtube`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    updateLoadingStep('diarize');

    const result = await response.json();

    updateLoadingStep('complete');

    return result;
}

// Loading
function showLoading() {
    elements.loadingOverlay.style.display = 'flex';
    Object.values(elements.steps).forEach(step => {
        step.classList.remove('active', 'completed');
    });
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

function updateLoadingStep(stepName) {
    const stepOrder = ['upload', 'transcribe', 'diarize', 'complete'];
    const currentIndex = stepOrder.indexOf(stepName);

    const statusMessages = {
        upload: 'ファイルを読み込んでいます...',
        transcribe: '音声を文字起こしています...',
        diarize: '話者を識別しています...',
        complete: '処理が完了しました！'
    };

    elements.loadingStatus.textContent = statusMessages[stepName];

    stepOrder.forEach((step, index) => {
        const stepElement = elements.steps[step];
        stepElement.classList.remove('active', 'completed');

        if (index < currentIndex) {
            stepElement.classList.add('completed');
        } else if (index === currentIndex) {
            stepElement.classList.add('active');
        }
    });
}

// Results Display
function displayResults(result) {
    elements.resultsSection.style.display = 'block';

    // Metadata
    if (result.metadata) {
        elements.metadata.style.display = 'block';
        elements.metadataContent.innerHTML = `
            <strong>タイトル:</strong> ${result.metadata.title || '-'}<br>
            <strong>投稿者:</strong> ${result.metadata.uploader || '-'}<br>
            <strong>長さ:</strong> ${result.metadata.duration ? formatDuration(result.metadata.duration) : '-'}
        `;
    } else {
        elements.metadata.style.display = 'none';
    }

    // Conversation view
    displayConversation(result.conversation, result.segments);

    // Segments table
    displaySegmentsTable(result.segments);

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function displayConversation(conversation, segments) {
    const speakerAName = elements.speakerA.value || '営業担当';
    const speakerBName = elements.speakerB.value || 'お客様';

    // Group consecutive segments by speaker
    const messages = [];
    let currentMessage = null;

    segments.forEach(seg => {
        const speaker = seg.speaker;
        const speakerName = speaker === 'SPEAKER_00' ? speakerAName : speakerBName;
        const speakerClass = speaker === 'SPEAKER_00' ? 'speaker-a' : 'speaker-b';

        if (currentMessage && currentMessage.speaker === speaker) {
            currentMessage.texts.push(seg.text);
            currentMessage.end = seg.end;
        } else {
            if (currentMessage) {
                messages.push(currentMessage);
            }
            currentMessage = {
                speaker: speaker,
                speakerName: speakerName,
                speakerClass: speakerClass,
                start: seg.start,
                end: seg.end,
                texts: [seg.text]
            };
        }
    });

    if (currentMessage) {
        messages.push(currentMessage);
    }

    // Render messages
    elements.conversationView.innerHTML = messages.map(msg => `
        <div class="message ${msg.speakerClass}">
            <div class="message-header">
                <span class="message-speaker ${msg.speakerClass}">${msg.speakerName}</span>
                <span class="message-time">${formatTime(msg.start)}</span>
            </div>
            <div class="message-text">${msg.texts.join(' ')}</div>
        </div>
    `).join('');
}

function displaySegmentsTable(segments) {
    const speakerAName = elements.speakerA.value || '営業担当';
    const speakerBName = elements.speakerB.value || 'お客様';

    const tbody = elements.segmentsTable.querySelector('tbody');
    tbody.innerHTML = segments.map(seg => {
        const speakerName = seg.speaker === 'SPEAKER_00' ? speakerAName : speakerBName;
        return `
            <tr>
                <td>${formatTime(seg.start)} - ${formatTime(seg.end)}</td>
                <td>${speakerName}</td>
                <td>${seg.text}</td>
            </tr>
        `;
    }).join('');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Result Actions
function setupResultActions() {
    elements.copyBtn.addEventListener('click', () => {
        if (!state.lastResult) return;

        navigator.clipboard.writeText(state.lastResult.conversation)
            .then(() => showSuccess('クリップボードにコピーしました'))
            .catch(() => showError('コピーに失敗しました'));
    });

    elements.downloadBtn.addEventListener('click', () => {
        if (!state.lastResult) return;

        const blob = new Blob([state.lastResult.conversation], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcription_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('ダウンロードを開始しました');
    });
}

// Toast Notifications
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorToast.style.display = 'flex';

    setTimeout(() => {
        elements.errorToast.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    elements.successMessage.textContent = message;
    elements.successToast.style.display = 'flex';

    setTimeout(() => {
        elements.successToast.style.display = 'none';
    }, 3000);
}
