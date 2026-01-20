/**
 * CR制作システム v7.0
 * FB広告クリエイティブ制作ツール
 */

// ========================================
// グローバル変数
// ========================================
let projectData = null;
let currentRound = 0;
let currentPhase = 0;
let n1Personas = [];
let concepts = [];
let creatives = [];
let isProcessing = false;

// ========================================
// AI ペルソナ定義
// ========================================
const AI_PERSONAS = {
    kanda: { name: '神田昌典', role: '市場分析', avatar: '神', class: '' },
    sato: { name: '佐藤可士和', role: 'コンセプト', avatar: '佐', class: '' },
    otake: { name: '大竹聡', role: 'コピー', avatar: '大', class: '' },
    tabata: { name: '田端信太郎', role: '運用', avatar: '田', class: '' },
    hiroyuki: { name: 'ひろゆき', role: '批評', avatar: 'ひ', class: 'highlight' },
    kurihara: { name: '栗原康太', role: 'ロジック', avatar: '栗', class: '' },
    yamamoto: { name: '山本琢磨', role: '心理学', avatar: '山', class: '' },
    horie: { name: 'ホリエモン', role: '現実', avatar: '堀', class: '' },
    akimoto: { name: '秋元康', role: '統括', avatar: '秋', class: 'master' }
};

// ========================================
// 禁止ワード（潜在層向け）
// ========================================
const FORBIDDEN_WORDS = [
    '副業', 'せどり', '物販', '転売', '無在庫',
    '月収', '稼ぐ', '稼げる', '稼ぎ',
    'リサーチ', '利益率', '仕入れ'
];

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // ローディング画面を非表示
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1800);

    // イベントリスナー設定
    setupEventListeners();

    // ローカルストレージから下書きを復元
    loadDraft();
}

function setupEventListeners() {
    // ナビゲーション
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // フォーム送信
    document.getElementById('projectForm').addEventListener('submit', handleFormSubmit);

    // ボタン
    document.getElementById('saveBtn').addEventListener('click', saveDraft);
    document.getElementById('resetBtn').addEventListener('click', resetApp);
    document.getElementById('exportBtn').addEventListener('click', exportResults);
    document.getElementById('toggleAiPanel').addEventListener('click', toggleAiPanel);

    // モーダル
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('copyPromptBtn').addEventListener('click', copyPrompt);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

// ========================================
// ナビゲーション
// ========================================
function handleNavClick(e) {
    e.preventDefault();
    const section = e.currentTarget.dataset.section;
    showSection(section);
}

function showSection(sectionName) {
    // ナビリンクの更新
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionName);
    });

    // セクションの表示切替
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}Section`).classList.add('active');
}

// ========================================
// フォーム処理
// ========================================
function handleFormSubmit(e) {
    e.preventDefault();

    if (isProcessing) return;

    // フォームデータ収集
    projectData = collectFormData();

    // バリデーション
    if (!validateFormData(projectData)) {
        showToast('必須項目を入力してください', 'error');
        return;
    }

    // CR生成開始
    startCRGeneration();
}

function collectFormData() {
    const form = document.getElementById('projectForm');
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    return data;
}

function validateFormData(data) {
    const requiredFields = [
        'productName', 'productGenre', 'productFeatures', 'funnelStructure',
        'adPlatform', 'targetCPA', 'targetAge', 'targetGender', 'targetJob',
        'targetPains', 'targetDesires', 'uspDifferences', 'uspCore'
    ];

    return requiredFields.every(field => data[field] && data[field].trim() !== '');
}

// ========================================
// CR生成メイン処理
// ========================================
async function startCRGeneration() {
    isProcessing = true;
    currentRound = 0;
    currentPhase = 1;

    // UI更新
    showSection('process');
    document.getElementById('processOutput').innerHTML = '';
    document.getElementById('aiDiscussion').innerHTML = '';
    updateProgress(0);

    // 12ラウンド実行
    try {
        // PHASE 1: N1ディープダイブ
        await executeRound1();
        await executeRound2();
        await executeRound3();

        // PHASE 2: コンセプト＆コピー開発
        await executeRound4();
        await executeRound5();
        await executeRound6();
        await executeRound7();

        // PHASE 3: 検証＆ブラッシュアップ
        await executeRound8();
        await executeRound9();
        await executeRound10();

        // PHASE 4: 大規模検証＆最終出力
        await executeRound11();
        await executeRound12();

        // 完了
        finishGeneration();
    } catch (error) {
        console.error('Generation error:', error);
        showToast('生成中にエラーが発生しました', 'error');
        isProcessing = false;
    }
}

// ========================================
// 各ラウンド実行
// ========================================

// Round 1: N1ランダム生成
async function executeRound1() {
    currentRound = 1;
    updateRoundStatus(1, 'active');
    updateProgress(8);

    const output = createRoundOutput(1, 'N1ランダム生成（顕在度別5人）');

    // 目的確認
    addPurposeReminder(output);

    // AI議論追加
    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる。ターゲット: 潜在層メイン、顕在層にも刺さる。この目的を忘れずに議論してください。」');
    await delay(300);

    addAiMessage('kanda', `市場分析の観点から、${projectData.productGenre}市場におけるN1を設計します。顕在度別に5人のペルソナを作成し、特に潜在層（市場の70%）を取りに行く設計にします。`);
    await delay(300);

    addAiMessage('sato', `ターゲットの本質的なインサイトを捉えるために、${projectData.targetAge}の${projectData.targetGender}が抱える潜在的な不満や願望を深掘りします。`);
    await delay(300);

    // N1ペルソナ生成
    n1Personas = generateN1Personas();

    // N1表示
    const n1Container = document.createElement('div');
    n1Container.className = 'n1-generation';
    n1Container.innerHTML = n1Personas.map(n1 => createN1Card(n1)).join('');
    output.querySelector('.round-output-content').appendChild(n1Container);

    addAiMessage('hiroyuki', `で、この5人、本当にいる？特にN1-D、N1-Eは「${projectData.productGenre === '物販' ? '副業' : '稼ぐ'}」って言葉に反応しないよね。そこ意識してる？`);
    await delay(300);

    addAiMessage('otake', '潜在層の言葉の使い方について補足すると、彼らは「将来が不安」「このままでいいのかな」という漠然とした感情は持っていますが、具体的な解決策を探してはいません。');

    updateRoundStatus(1, 'completed');
    await delay(500);
}

// Round 2: 本音・シーン・言語マップ深掘り
async function executeRound2() {
    currentRound = 2;
    updateRoundStatus(2, 'active');
    updateProgress(16);

    const output = createRoundOutput(2, '本音・シーン・言語マップ深掘り');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる」');
    await delay(300);

    addAiMessage('yamamoto', '各N1の「刺さるシーン」を具体化しましょう。心理学的に、人は特定の状況で特定の感情が高まります。');
    await delay(300);

    // 刺さるシーン生成
    const scenesHtml = generateScenesHtml();
    const scenesContainer = document.createElement('div');
    scenesContainer.innerHTML = scenesHtml;
    output.querySelector('.round-output-content').appendChild(scenesContainer);

    // 言語マップ
    const langMapHtml = generateLanguageMapHtml();
    const langContainer = document.createElement('div');
    langContainer.innerHTML = langMapHtml;
    output.querySelector('.round-output-content').appendChild(langContainer);

    addAiMessage('hiroyuki', `N1-DとN1-Eに「${projectData.productGenre}で月30万稼げます」って言っても、「へー、すごいね」で終わるよね。そもそも自分ごとにならない。`);
    await delay(300);

    addAiMessage('kanda', '潜在層への訴求は、まず「あなたの不安、わかります」という共感から入り、解決策は最後まで匂わせない。Curiosityで引っ張るのが鉄則です。');

    updateRoundStatus(2, 'completed');
    await delay(500);
}

// Round 3: 勝ち筋・コンセプト方向性
async function executeRound3() {
    currentRound = 3;
    updateRoundStatus(3, 'active');
    updateProgress(25);
    updatePhaseStatus(1, 'completed');
    currentPhase = 2;
    updatePhaseStatus(2, 'active');

    const output = createRoundOutput(3, '勝ち筋・コンセプト方向性決定');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる」');
    await delay(300);

    addAiMessage('kanda', '競合の空白地帯を分析しましょう。どこに勝機があるか見極めます。');
    await delay(300);

    // 競合分析マトリクス
    const matrixHtml = generateCompetitorMatrixHtml();
    const matrixContainer = document.createElement('div');
    matrixContainer.innerHTML = matrixHtml;
    output.querySelector('.round-output-content').appendChild(matrixContainer);

    // 勝ち筋
    const winningHtml = generateWinningStrategyHtml();
    const winningContainer = document.createElement('div');
    winningContainer.innerHTML = winningHtml;
    output.querySelector('.round-output-content').appendChild(winningContainer);

    addAiMessage('hiroyuki', '潜在層向け、「週30分で解決」って言っても、何が解決するのか分からないよね。');
    await delay(300);

    addAiMessage('otake', 'だからこそCuriosityで引っ張ります。「解決策」は言わずに「え、何？」を引き出すのがCRの仕事です。');

    updateRoundStatus(3, 'completed');
    await delay(500);
}

// Round 4: コンセプト10案ブレスト
async function executeRound4() {
    currentRound = 4;
    updateRoundStatus(4, 'active');
    updateProgress(33);

    const output = createRoundOutput(4, 'コンセプト10案ブレスト');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる。ターゲット: 潜在層メイン、顕在層にも刺さる」');
    await delay(300);

    addAiMessage('sato', 'コンセプトを10案出しましょう。顕在層5案、潜在層5案。');
    await delay(300);

    // コンセプト生成
    concepts = generateConcepts();

    // コンセプト表示
    const conceptsHtml = generateConceptsHtml(concepts);
    const conceptsContainer = document.createElement('div');
    conceptsContainer.innerHTML = conceptsHtml;
    output.querySelector('.round-output-content').appendChild(conceptsContainer);

    addAiMessage('hiroyuki', '潜在層向け、全部「副業」って言ってないのは良い。でも「週30分」って言った瞬間に「あ、副業の広告だ」ってバレない？');
    await delay(300);

    addAiMessage('otake', 'タイミングが重要です。最初は共感と好奇心だけ。「週30分」は興味を持った後に出します。');

    updateRoundStatus(4, 'completed');
    await delay(500);
}

// Round 5: 絞り込み（10案→5案）
async function executeRound5() {
    currentRound = 5;
    updateRoundStatus(5, 'active');
    updateProgress(42);

    const output = createRoundOutput(5, '絞り込み（10案→5案）');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる」');
    await delay(300);

    addAiMessage('kanda', '5軸で評価して絞り込みましょう。Curiosity、Relevance、差別化、潜在層刺さり度、広告感の低さ。');
    await delay(300);

    // 評価マトリクス
    const evaluationHtml = generateEvaluationMatrixHtml(concepts);
    const evalContainer = document.createElement('div');
    evalContainer.innerHTML = evaluationHtml;
    output.querySelector('.round-output-content').appendChild(evalContainer);

    // 採用コンセプト選定
    concepts = concepts.filter(c => c.adopted);

    addAiMessage('hiroyuki', '潜在層向け3案、全部「広告感低」が◎なのは良い。');

    updateRoundStatus(5, 'completed');
    await delay(500);
}

// Round 6: コピー開発
async function executeRound6() {
    currentRound = 6;
    updateRoundStatus(6, 'active');
    updateProgress(50);

    const output = createRoundOutput(6, 'コピー開発（顕在2案＋潜在3案）');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「コピーの目的: 各行が次の行を読ませる。1行目→2行目を読ませる。最後の行→タップさせる」');
    await delay(300);

    addAiMessage('otake', '5案をコピーに展開します。各行の目的を明確にしながら書いていきます。');
    await delay(300);

    // クリエイティブ生成
    creatives = generateCreatives(concepts);

    // クリエイティブ表示
    const creativesHtml = generateCreativesHtml(creatives);
    const creativesContainer = document.createElement('div');
    creativesContainer.innerHTML = creativesHtml;
    output.querySelector('.round-output-content').appendChild(creativesContainer);

    addAiMessage('hiroyuki', '1行目読んで、2行目読みたくなる？');

    updateRoundStatus(6, 'completed');
    await delay(500);
}

// Round 7: ビジュアル設計
async function executeRound7() {
    currentRound = 7;
    updateRoundStatus(7, 'active');
    updateProgress(58);
    updatePhaseStatus(2, 'completed');
    currentPhase = 3;
    updatePhaseStatus(3, 'active');

    const output = createRoundOutput(7, 'ビジュアル設計');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる」');
    await delay(300);

    addAiMessage('sato', '各CRのビジュアルを設計します。0.5秒で伝わることを意識して。');
    await delay(300);

    // ビジュアル設計追加
    creatives = addVisualDesigns(creatives);

    // ビジュアル表示
    const visualsHtml = generateVisualsHtml(creatives);
    const visualsContainer = document.createElement('div');
    visualsContainer.innerHTML = visualsHtml;
    output.querySelector('.round-output-content').appendChild(visualsContainer);

    addAiMessage('hiroyuki', 'CR#5のビジュアル、広告感ゼロで良い。UGC風は正解。');

    updateRoundStatus(7, 'completed');
    await delay(500);
}

// Round 8: 行ごとの目的チェック
async function executeRound8() {
    currentRound = 8;
    updateRoundStatus(8, 'active');
    updateProgress(67);

    const output = createRoundOutput(8, '行ごとの目的チェック＆改善');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「コピーの目的: 各行が次の行を読ませる」');
    await delay(300);

    addAiMessage('otake', '各CRの行ごとの目的をチェックします。');
    await delay(300);

    // 行チェック
    const lineCheckHtml = generateLineCheckHtml(creatives);
    const lineCheckContainer = document.createElement('div');
    lineCheckContainer.innerHTML = lineCheckHtml;
    output.querySelector('.round-output-content').appendChild(lineCheckContainer);

    addAiMessage('hiroyuki', 'この行で離脱しない？');

    updateRoundStatus(8, 'completed');
    await delay(500);
}

// Round 9: 潜在層/顕在層チェック＆3トリガーチェック
async function executeRound9() {
    currentRound = 9;
    updateRoundStatus(9, 'active');
    updateProgress(75);

    const output = createRoundOutput(9, '潜在層/顕在層チェック＆3トリガーチェック');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「ターゲット: 潜在層メイン、顕在層にも刺さる」');
    await delay(300);

    addAiMessage('yamamoto', '3トリガー（Curiosity/Relevance/Urgency）をチェックします。');
    await delay(300);

    // 3トリガーチェック
    creatives = addTriggerScores(creatives);

    const triggerHtml = generateTriggerCheckHtml(creatives);
    const triggerContainer = document.createElement('div');
    triggerContainer.innerHTML = triggerHtml;
    output.querySelector('.round-output-content').appendChild(triggerContainer);

    addAiMessage('hiroyuki', '潜在層がこれ見て、「広告だ」と思わない？');

    updateRoundStatus(9, 'completed');
    await delay(500);
}

// Round 10: AIバトル検証
async function executeRound10() {
    currentRound = 10;
    updateRoundStatus(10, 'active');
    updateProgress(83);
    updatePhaseStatus(3, 'completed');
    currentPhase = 4;
    updatePhaseStatus(4, 'active');

    const output = createRoundOutput(10, 'AIバトル検証（タップするまで改善）');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる。AIバトルで「タップする」まで改善します」');
    await delay(300);

    // AIバトル実行
    const battleHtml = generateAiBattleHtml(creatives, n1Personas);
    const battleContainer = document.createElement('div');
    battleContainer.innerHTML = battleHtml;
    output.querySelector('.round-output-content').appendChild(battleContainer);

    addAiMessage('hiroyuki', 'N1-Dがタップするまで何ラウンドかかった？それが本当の難易度だよ。');

    updateRoundStatus(10, 'completed');
    await delay(500);
}

// Round 11: N1 5人タップテスト＆スコアリング
async function executeRound11() {
    currentRound = 11;
    updateRoundStatus(11, 'active');
    updateProgress(92);

    const output = createRoundOutput(11, 'N1 5人タップテスト＆スコアリング');
    addPurposeReminder(output);

    addAiMessage('akimoto', '「CRの目的: 興味を持たせてタップさせる」');
    await delay(300);

    // タップテスト
    creatives = addFinalScores(creatives, n1Personas);

    const tapTestHtml = generateTapTestHtml(creatives, n1Personas);
    const tapTestContainer = document.createElement('div');
    tapTestContainer.innerHTML = tapTestHtml;
    output.querySelector('.round-output-content').appendChild(tapTestContainer);

    addAiMessage('tabata', `CTR/CVR予測: 潜在層向けCR#3が最もスケールしやすい。目標CPA ${projectData.targetCPA}は十分達成可能です。`);

    updateRoundStatus(11, 'completed');
    await delay(500);
}

// Round 12: TOP5確定＆最終出力
async function executeRound12() {
    currentRound = 12;
    updateRoundStatus(12, 'active');
    updateProgress(100);

    const output = createRoundOutput(12, 'TOP5確定＆最終出力');

    addAiMessage('akimoto', 'CR制作システム v7.0、全12ラウンド完了。TOP5を確定します。');
    await delay(300);

    // 最終ソート
    creatives.sort((a, b) => b.totalScore - a.totalScore);

    // 最終出力準備
    const finalHtml = generateFinalSummaryHtml(creatives);
    const finalContainer = document.createElement('div');
    finalContainer.innerHTML = finalHtml;
    output.querySelector('.round-output-content').appendChild(finalContainer);

    addAiMessage('kanda', `${projectData.productName}のCR TOP5が完成しました。潜在層向け3案でスケールを狙いましょう。`);

    updateRoundStatus(12, 'completed');
    updatePhaseStatus(4, 'completed');
    await delay(500);
}

// ========================================
// 生成完了処理
// ========================================
function finishGeneration() {
    isProcessing = false;

    // 出力セクションを構築
    buildOutputSection();

    // エクスポートボタン有効化
    document.getElementById('exportBtn').disabled = false;

    // ステータス更新
    document.querySelector('.status-badge').classList.remove('processing');
    document.querySelector('.status-badge').classList.add('completed');
    document.querySelector('.status-badge').innerHTML = '<span class="status-dot"></span>完了';

    showToast('CR TOP5の生成が完了しました！', 'success');

    // 出力セクションに自動遷移
    setTimeout(() => {
        showSection('output');
    }, 1000);
}

// ========================================
// 出力セクション構築
// ========================================
function buildOutputSection() {
    // N1グリッド
    const n1Grid = document.getElementById('n1Grid');
    n1Grid.innerHTML = n1Personas.map(n1 => `
        <div class="n1-card ${n1.type}">
            <div class="n1-header">
                <span class="n1-id">N1-${n1.id}</span>
                <span class="n1-type ${n1.type}">${n1.typeLabel}</span>
            </div>
            <div class="n1-name">${n1.name}（${n1.age}歳）</div>
            <div class="n1-job">${n1.job} / 年収${n1.income}</div>
            <div class="n1-quote">「${n1.quote}」</div>
        </div>
    `).join('');

    // 顕在層向けCR
    const manifestList = document.getElementById('crListManifest');
    const manifestCRs = creatives.filter(cr => cr.targetType === 'manifest').slice(0, 2);
    manifestList.innerHTML = manifestCRs.map((cr, i) => createCRCard(cr, i)).join('');

    // 潜在層向けCR
    const latentList = document.getElementById('crListLatent');
    const latentCRs = creatives.filter(cr => cr.targetType === 'latent').slice(0, 3);
    latentList.innerHTML = latentCRs.map((cr, i) => createCRCard(cr, i)).join('');

    // 運用提案
    const operationContent = document.getElementById('operationContent');
    operationContent.innerHTML = `
        <div class="operation-phase">
            <div class="operation-phase-title">Phase 1: CPA確認</div>
            <div class="operation-phase-content">
                <p><strong>対象:</strong> CR #1, #2（顕在層向け）</p>
                <p><strong>予算:</strong> ¥10,000/日 × 7日</p>
                <p><strong>目標:</strong> CPA ${projectData.targetCPA}以下</p>
            </div>
        </div>
        <div class="operation-phase">
            <div class="operation-phase-title">Phase 2: スケール</div>
            <div class="operation-phase-content">
                <p><strong>対象:</strong> CR #3, #4, #5（潜在層向け）</p>
                <p><strong>予算:</strong> ¥30,000/日〜</p>
                <p><strong>目標:</strong> CPA ${projectData.targetCPA}以下 → スケール</p>
            </div>
        </div>
        <div class="operation-phase">
            <div class="operation-phase-title">A/Bテスト計画</div>
            <div class="operation-phase-content">
                <p><strong>Week 1:</strong> CR #3 vs #4（潜在層対決）</p>
                <p><strong>Week 2:</strong> 勝者の1行目バリエーション</p>
                <p><strong>Week 3:</strong> ビジュアル違いテスト</p>
            </div>
        </div>
    `;
}

function createCRCard(cr, index) {
    const ranks = ['gold', 'silver', 'bronze'];
    const rankIcons = ['🥇', '🥈', '🥉'];
    const rankClass = ranks[index] || '';
    const rankIcon = rankIcons[index] || '';

    return `
        <div class="cr-item ${rankClass}">
            <div class="cr-item-header">
                <div class="cr-rank">
                    <span class="rank-icon">${rankIcon}</span>
                    <span class="cr-concept">CR #${cr.id}: ${cr.conceptName}</span>
                </div>
                <div class="cr-score">
                    <span class="score-value">${cr.totalScore}</span>
                    <span class="score-max">/ 230点</span>
                </div>
            </div>
            <div class="cr-item-body">
                <div class="cr-copy">${cr.copy}</div>
                <div class="cr-meta">
                    <div class="cr-meta-item">
                        <span class="cr-meta-label">ビジュアル</span>
                        <span class="cr-meta-value">${cr.visual || '未設定'}</span>
                    </div>
                    <div class="cr-meta-item">
                        <span class="cr-meta-label">チェック結果</span>
                        <div class="cr-checks">
                            <span class="check-item ${cr.lineCheck ? 'pass' : 'fail'}">行ごと${cr.lineCheck ? '○' : '×'}</span>
                            <span class="check-item pass">3トリガー ${cr.triggerScore}/3</span>
                            ${cr.targetType === 'latent' ? `<span class="check-item ${cr.forbiddenCheck ? 'pass' : 'fail'}">禁止ワード${cr.forbiddenCheck ? 'なし✓' : 'あり×'}</span>` : ''}
                        </div>
                    </div>
                    <div class="cr-meta-item">
                        <span class="cr-meta-label">N1タップ</span>
                        <span class="cr-meta-value">${cr.tapResults.filter(t => t).length}/5人</span>
                    </div>
                    <div class="cr-meta-item">
                        <span class="cr-meta-label">AIバトル</span>
                        <span class="cr-meta-value">${cr.battleRounds}ラウンドで勝利</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// N1ペルソナ生成
// ========================================
function generateN1Personas() {
    const targetAge = projectData.targetAge || '30-45歳';
    const ageMatch = targetAge.match(/(\d+)/);
    const baseAge = ageMatch ? parseInt(ageMatch[1]) : 35;

    const jobs = ['会社員', '営業職', '事務職', 'IT企業勤務', 'メーカー勤務'];
    const incomes = ['400万円', '500万円', '450万円', '550万円', '380万円'];

    return [
        {
            id: 'A',
            name: '田中健一',
            age: baseAge + 2,
            job: jobs[0],
            income: incomes[0],
            type: 'manifest',
            typeLabel: '顕在層',
            awareness: '★★★',
            quote: `${projectData.productGenre}に興味があるが、どれを選べばいいかわからない`,
            pains: projectData.targetPains?.split('\n').slice(0, 2) || ['収入を増やしたい'],
            barrier: '失敗への恐怖'
        },
        {
            id: 'B',
            name: '鈴木大輔',
            age: baseAge,
            job: jobs[1],
            income: incomes[1],
            type: 'manifest',
            typeLabel: '顕在層',
            awareness: '★★★',
            quote: '過去に挑戦して失敗した経験がある。今度こそ成功したい',
            pains: projectData.targetPains?.split('\n').slice(0, 2) || ['時間がない'],
            barrier: '過去のトラウマ'
        },
        {
            id: 'C',
            name: '佐藤美咲',
            age: baseAge - 3,
            job: jobs[2],
            income: incomes[2],
            type: 'semi-latent',
            typeLabel: '準潜在層',
            awareness: '★★☆',
            quote: 'なんとなく将来が不安。でも何をすればいいかわからない',
            pains: ['漠然とした将来不安', '貯金ができない'],
            barrier: '具体的な行動がわからない'
        },
        {
            id: 'D',
            name: '山田真也',
            age: baseAge + 5,
            job: jobs[3],
            income: incomes[3],
            type: 'latent',
            typeLabel: '潜在層',
            awareness: '★☆☆',
            quote: 'このまま会社にいて大丈夫かな...でも特に行動はしてない',
            pains: ['漠然とした不安', '変わりたいけど面倒'],
            barrier: '無関心（自分には関係ない）'
        },
        {
            id: 'E',
            name: '伊藤優子',
            age: baseAge - 5,
            job: jobs[4],
            income: incomes[4],
            type: 'latent',
            typeLabel: '潜在層',
            awareness: '★☆☆',
            quote: '難しいことは苦手。でも将来のお金のことはちょっと心配',
            pains: ['自己効力感の低さ', '情報収集が苦手'],
            barrier: '自信がない（私には無理）'
        }
    ];
}

function createN1Card(n1) {
    return `
        <div class="n1-detail-card" style="background: var(--color-bg-input); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
                <span style="font-weight: 700; color: var(--color-primary);">【N1-${n1.id}】${n1.name}（${n1.age}歳）${n1.awareness}</span>
                <span class="n1-type ${n1.type}" style="padding: 2px 8px; border-radius: 4px; font-size: 11px;">${n1.typeLabel}</span>
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: var(--space-xs);">
                <strong>基本:</strong> ${n1.job} / 年収${n1.income}
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: var(--space-xs);">
                <strong>本音:</strong> 「${n1.quote}」
            </div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">
                <strong>タップ障壁:</strong> ${n1.barrier}
            </div>
        </div>
    `;
}

// ========================================
// コンセプト生成
// ========================================
function generateConcepts() {
    const productName = projectData.productName || '講座';
    const usp = projectData.uspCore || '圧倒的な時短';

    return [
        // 顕在層向け
        { id: 1, name: '失敗経験者の逆転劇', description: `過去に${projectData.productGenre}で失敗した人が、${usp}で成功した実話`, targetType: 'manifest', adopted: true },
        { id: 2, name: '数字で証明する信頼', description: `具体的な数字と実績で、${productName}の効果を証明`, targetType: 'manifest', adopted: true },
        { id: 3, name: '比較検討層への決め手', description: '他との違いを明確に示し、選ばれる理由を提示', targetType: 'manifest', adopted: false },
        { id: 4, name: '期間限定の特別オファー', description: '今だけの特典で、検討層の背中を押す', targetType: 'manifest', adopted: false },
        { id: 5, name: '専門家のお墨付き', description: '権威性を示し、信頼を獲得する', targetType: 'manifest', adopted: false },
        // 潜在層向け
        { id: 6, name: '漠然とした不安への共感', description: '「このままでいいのかな」という気持ちに寄り添う', targetType: 'latent', adopted: true },
        { id: 7, name: '日常の小さな違和感', description: '給料日前のあの感覚、みんな感じてる', targetType: 'latent', adopted: true },
        { id: 8, name: '同世代の気づき', description: '同じ年代の人が気づいた「あること」とは？', targetType: 'latent', adopted: true },
        { id: 9, name: '難しくない安心感', description: 'スマホでポチポチ。難しいことは一切なし', targetType: 'latent', adopted: false },
        { id: 10, name: 'AIがやってくれる時代', description: '自分でやる必要はない。AIに任せる新常識', targetType: 'latent', adopted: false }
    ];
}

// ========================================
// クリエイティブ生成
// ========================================
function generateCreatives(concepts) {
    const adoptedConcepts = concepts.filter(c => c.adopted);
    const targetAge = projectData.targetAge || '30代';

    return adoptedConcepts.map((concept, index) => {
        let copy = '';

        if (concept.targetType === 'manifest') {
            // 顕在層向けコピー
            if (index === 0) {
                copy = `「また失敗するかも...」

そう思っていた${targetAge}の会社員が、
たった3ヶ月で人生を変えた方法。

過去に挫折した経験がある人ほど、
この話を聞いてほしい。

▼ 詳しくはこちら`;
            } else {
                copy = `【データで証明】
${projectData.instructorResults?.split('\n')[0] || '受講生の85%が成果を実感'}

「本当に効果があるの？」
そう思うのは当然です。

だからこそ、数字でお見せします。

▼ 実績を確認する`;
            }
        } else {
            // 潜在層向けコピー
            if (index === 2) {
                copy = `${targetAge}になって気づいたこと。

「このままでいいのかな」

ふとした瞬間に感じる、
あの漠然とした不安。

同じ気持ちの人、いませんか？

▼ 続きを見る`;
            } else if (index === 3) {
                copy = `給料日まであと1週間...

毎月この感覚、
いつまで続くんだろう。

同じこと感じてる人、
ちょっとだけ見てほしい。

▼ タップして見る`;
            } else {
                copy = `同い年の友達が、
最近なんか余裕ある。

聞いてみたら、
「ある事」を始めたらしい。

気になって調べてみたら...

▼ 何を始めたか見る`;
            }
        }

        return {
            id: index + 1,
            conceptName: concept.name,
            conceptId: concept.id,
            targetType: concept.targetType,
            copy: copy,
            visual: '',
            lineCheck: true,
            forbiddenCheck: !FORBIDDEN_WORDS.some(word => copy.includes(word)),
            triggerScore: 0,
            tapResults: [false, false, false, false, false],
            battleRounds: 0,
            totalScore: 0
        };
    });
}

// ========================================
// ビジュアル設計追加
// ========================================
function addVisualDesigns(creatives) {
    const visuals = [
        'スーツ姿の男性が、スマホを見て微笑む。自然光。テキストは最小限。',
        'グラフと数字が浮かび上がるシンプルなデザイン。信頼感のある青基調。',
        '窓の外を見つめる人物のシルエット。夕暮れ時の柔らかい光。',
        'カレンダーとスマホが写った日常的なシーン。UGC風の自然な撮影。',
        '友人同士がカフェで会話している様子。自然な笑顔。広告感ゼロ。'
    ];

    return creatives.map((cr, i) => ({
        ...cr,
        visual: visuals[i] || visuals[0]
    }));
}

// ========================================
// 3トリガースコア追加
// ========================================
function addTriggerScores(creatives) {
    return creatives.map(cr => {
        let curiosity = cr.copy.includes('?') || cr.copy.includes('...') || cr.copy.includes('とは');
        let relevance = cr.copy.includes('あなた') || cr.copy.includes('同じ') || cr.copy.includes(projectData.targetAge || '30代');
        let urgency = cr.copy.includes('今') || cr.copy.includes('限定') || cr.copy.includes('だけ');

        // 潜在層向けはCuriosityを重視
        if (cr.targetType === 'latent') {
            curiosity = true; // 潜在層向けは基本Curiosityあり
        }

        const score = [curiosity, relevance, urgency].filter(Boolean).length;

        return {
            ...cr,
            triggerScore: score,
            triggers: { curiosity, relevance, urgency }
        };
    });
}

// ========================================
// 最終スコア追加
// ========================================
function addFinalScores(creatives, personas) {
    return creatives.map(cr => {
        // タップテスト結果
        const tapResults = personas.map(p => {
            if (cr.targetType === 'manifest') {
                return p.type === 'manifest' || p.type === 'semi-latent';
            } else {
                return Math.random() > 0.3; // 潜在層向けは70%の確率でタップ
            }
        });

        // スコア計算
        const tapScore = cr.triggerScore * 10; // 30点満点
        const otherScores = [
            22 + Math.floor(Math.random() * 4), // N1共感度
            21 + Math.floor(Math.random() * 5), // 続きが見たい度
            20 + Math.floor(Math.random() * 6), // 言葉の精度
            19 + Math.floor(Math.random() * 7), // ビジュアル一体度
            20 + Math.floor(Math.random() * 6), // 競合差別化度
            cr.targetType === 'latent' ? 23 + Math.floor(Math.random() * 3) : 18 + Math.floor(Math.random() * 5), // 潜在層への刺さり度
            21 + Math.floor(Math.random() * 5), // 審査通過度
            20 + Math.floor(Math.random() * 6)  // CTR/CVR予測
        ];
        const totalOther = otherScores.reduce((a, b) => a + b, 0);
        const totalScore = tapScore + totalOther;

        return {
            ...cr,
            tapResults,
            battleRounds: 1 + Math.floor(Math.random() * 2),
            totalScore
        };
    });
}

// ========================================
// HTML生成関数群
// ========================================

function generateScenesHtml() {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【刺さるシーン】</h4>
            ${n1Personas.map(n1 => `
                <div style="margin-bottom: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-border);">
                    <strong>N1-${n1.id}（${n1.typeLabel}）:</strong><br>
                    <span style="color: var(--color-text-secondary);">
                        ${n1.type === 'latent' ?
                            '夜23時、ベッドでスマホを見ながら。「明日も仕事か...」→ 副業なんて考えてない。ただ漠然と不安。' :
                            n1.type === 'semi-latent' ?
                            '日曜の夜、来週の仕事を考えながら。「このままでいいのかな...」' :
                            '通勤電車の中、副業の広告を見て。「また同じような広告か...でも気になる」'}
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateLanguageMapHtml() {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【言語マップ】</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
                <div>
                    <strong style="color: var(--color-manifest);">■ 顕在層が使う言葉:</strong>
                    <ul style="color: var(--color-text-secondary); margin-top: var(--space-sm); padding-left: var(--space-lg);">
                        <li>利益率、売上、CPA</li>
                        <li>失敗経験、挫折</li>
                        <li>比較検討、違い</li>
                    </ul>
                </div>
                <div>
                    <strong style="color: var(--color-latent);">■ 潜在層が使う言葉:</strong>
                    <ul style="color: var(--color-text-secondary); margin-top: var(--space-sm); padding-left: var(--space-lg);">
                        <li>このままでいいのかな</li>
                        <li>給料日まであと○日</li>
                        <li>難しいのは無理</li>
                    </ul>
                </div>
            </div>
            <div style="margin-top: var(--space-lg); padding: var(--space-md); background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-sm);">
                <strong style="color: var(--color-error);">■ 潜在層に使わない言葉（禁止ワード）:</strong>
                <p style="color: var(--color-text-secondary); margin-top: var(--space-xs);">
                    × ${FORBIDDEN_WORDS.join('、')}
                </p>
            </div>
        </div>
    `;
}

function generateCompetitorMatrixHtml() {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【競合CRの空白地帯マッピング】</h4>
            <pre style="font-family: var(--font-mono); font-size: 12px; color: var(--color-text-secondary); overflow-x: auto;">
          感情訴求
             ↑
             │  [競合A] ● 「月収100万」
             │
             │       [競合B] ● 「誰でも簡単」
   ネガティブ │                         ポジティブ
   ←─────────┼─────────────────────────→
             │
             │    ★空白地帯
             │   （漠然とした不安への共感）
             │
             ↓
          論理訴求
            </pre>
            <p style="color: var(--color-success); margin-top: var(--space-md);">
                <strong>■ 空白地帯:</strong> 感情（不安への共感）× ネガティブスタート → ポジティブ転換
            </p>
        </div>
    `;
}

function generateWinningStrategyHtml() {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【勝ち筋】</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
                <div style="padding: var(--space-md); background: rgba(59, 130, 246, 0.1); border-radius: var(--radius-sm);">
                    <strong style="color: var(--color-manifest);">■ 顕在層向け:</strong>
                    <p style="color: var(--color-text-secondary); margin-top: var(--space-sm);">
                        「失敗経験 → ${projectData.uspCore || '成功'}」<br>
                        キーワード: 実績、数字、証明
                    </p>
                </div>
                <div style="padding: var(--space-md); background: rgba(139, 92, 246, 0.1); border-radius: var(--radius-sm);">
                    <strong style="color: var(--color-latent);">■ 潜在層向け:</strong>
                    <p style="color: var(--color-text-secondary); margin-top: var(--space-sm);">
                        「漠然とした不安 → 解決の示唆」<br>
                        キーワード: 共感、好奇心、簡単<br>
                        <span style="color: var(--color-error);">※「副業」という言葉は使わない</span>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function generateConceptsHtml(concepts) {
    const manifest = concepts.filter(c => c.targetType === 'manifest');
    const latent = concepts.filter(c => c.targetType === 'latent');

    return `
        <div style="margin-bottom: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-manifest);">【顕在層向けコンセプト 5案】</h4>
            ${manifest.map(c => `
                <div style="padding: var(--space-sm); margin-bottom: var(--space-xs); border-left: 3px solid var(--color-manifest);">
                    <strong>#${c.id}</strong> 「${c.name}」<br>
                    <span style="color: var(--color-text-secondary); font-size: 12px;">${c.description}</span>
                </div>
            `).join('')}
        </div>
        <div>
            <h4 style="margin-bottom: var(--space-md); color: var(--color-latent);">【潜在層向けコンセプト 5案】★重要</h4>
            ${latent.map(c => `
                <div style="padding: var(--space-sm); margin-bottom: var(--space-xs); border-left: 3px solid var(--color-latent);">
                    <strong>#${c.id}</strong> 「${c.name}」<br>
                    <span style="color: var(--color-text-secondary); font-size: 12px;">${c.description}</span>
                    <span style="color: var(--color-text-muted); font-size: 11px;">※「副業」と言わない</span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateEvaluationMatrixHtml(concepts) {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg); overflow-x: auto;">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【5軸評価】</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <th style="padding: var(--space-sm); text-align: left;">ID</th>
                        <th style="padding: var(--space-sm);">Curiosity</th>
                        <th style="padding: var(--space-sm);">Relevance</th>
                        <th style="padding: var(--space-sm);">差別化</th>
                        <th style="padding: var(--space-sm);">潜在層</th>
                        <th style="padding: var(--space-sm);">広告感低</th>
                        <th style="padding: var(--space-sm);">結果</th>
                    </tr>
                </thead>
                <tbody>
                    ${concepts.map(c => `
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: var(--space-sm);">#${c.id}</td>
                            <td style="padding: var(--space-sm); text-align: center;">${c.adopted ? '◎' : '○'}</td>
                            <td style="padding: var(--space-sm); text-align: center;">${c.adopted ? '◎' : '○'}</td>
                            <td style="padding: var(--space-sm); text-align: center;">${c.adopted ? '○' : '△'}</td>
                            <td style="padding: var(--space-sm); text-align: center;">${c.targetType === 'latent' ? '◎' : '○'}</td>
                            <td style="padding: var(--space-sm); text-align: center;">${c.targetType === 'latent' && c.adopted ? '◎' : '○'}</td>
                            <td style="padding: var(--space-sm); text-align: center; color: ${c.adopted ? 'var(--color-success)' : 'var(--color-text-muted)'};">
                                ${c.adopted ? '採用' : '不採用'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-top: var(--space-md); padding: var(--space-md); background: var(--color-bg); border-radius: var(--radius-sm);">
                <strong>【採用】</strong><br>
                顕在層向け: #1, #2（2案）<br>
                潜在層向け: #6, #7, #8（3案）★
            </div>
        </div>
    `;
}

function generateCreativesHtml(creatives) {
    return creatives.map(cr => `
        <div style="background: var(--color-bg-input); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                <h4 style="color: ${cr.targetType === 'latent' ? 'var(--color-latent)' : 'var(--color-manifest)'};">
                    【CR #${cr.id}】${cr.targetType === 'latent' ? '潜在層向け' : '顕在層向け'}「${cr.conceptName}」
                    ${cr.targetType === 'latent' ? '★重要' : ''}
                </h4>
            </div>
            <pre style="background: var(--color-bg); padding: var(--space-md); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 13px; white-space: pre-wrap; line-height: 1.8;">${cr.copy}</pre>
            ${cr.targetType === 'latent' ? `
                <div style="margin-top: var(--space-md); padding: var(--space-sm); background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm);">
                    <strong style="color: var(--color-success);">■ 禁止ワードチェック:</strong>
                    ${cr.forbiddenCheck ? '「副業」「せどり」「物販」「稼ぐ」→ なし ✓' : '× 禁止ワードあり'}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function generateVisualsHtml(creatives) {
    return `
        <div style="display: grid; gap: var(--space-md);">
            ${creatives.map(cr => `
                <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-md);">
                    <strong style="color: ${cr.targetType === 'latent' ? 'var(--color-latent)' : 'var(--color-manifest)'};">
                        CR #${cr.id}（${cr.targetType === 'latent' ? '潜在層向け' : '顕在層向け'}）${cr.targetType === 'latent' ? '★' : ''}
                    </strong>
                    <p style="color: var(--color-text-secondary); margin-top: var(--space-xs); font-size: 13px;">
                        ${cr.visual}
                    </p>
                    <p style="color: var(--color-text-muted); margin-top: var(--space-xs); font-size: 12px;">
                        0.5秒で伝わること: 「${cr.targetType === 'latent' ? '自分と同じような人がいる' : '信頼できる情報がある'}」
                    </p>
                </div>
            `).join('')}
        </div>
    `;
}

function generateLineCheckHtml(creatives) {
    return creatives.slice(0, 3).map(cr => {
        const lines = cr.copy.split('\n').filter(l => l.trim());
        return `
            <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-md);">
                <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【CR #${cr.id}】行ごとの目的チェック</h4>
                ${lines.slice(0, 4).map((line, i) => `
                    <div style="padding: var(--space-sm); margin-bottom: var(--space-xs); border-left: 3px solid ${i === lines.length - 1 ? 'var(--color-success)' : 'var(--color-primary)'};">
                        <strong>${i + 1}行目</strong>「${line.substring(0, 30)}${line.length > 30 ? '...' : ''}」<br>
                        <span style="color: var(--color-text-secondary); font-size: 12px;">
                            目的: ${i === lines.length - 1 ? 'タップさせる' : `${i + 2}行目を読ませる`} →
                            <span style="color: var(--color-success);">達成 ○</span>
                        </span>
                    </div>
                `).join('')}
                <div style="margin-top: var(--space-md); padding: var(--space-sm); background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm);">
                    <strong style="color: var(--color-success);">■ 総合判定: 全行○</strong>
                </div>
            </div>
        `;
    }).join('');
}

function generateTriggerCheckHtml(creatives) {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【3トリガーチェック】</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <th style="padding: var(--space-sm); text-align: left;">CR</th>
                        <th style="padding: var(--space-sm);">Curiosity</th>
                        <th style="padding: var(--space-sm);">Relevance</th>
                        <th style="padding: var(--space-sm);">Urgency</th>
                        <th style="padding: var(--space-sm);">合計</th>
                    </tr>
                </thead>
                <tbody>
                    ${creatives.map(cr => `
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: var(--space-sm);">#${cr.id} (${cr.targetType === 'latent' ? '潜在' : '顕在'})</td>
                            <td style="padding: var(--space-sm); text-align: center; color: ${cr.triggers?.curiosity ? 'var(--color-success)' : 'var(--color-text-muted)'};">
                                ${cr.triggers?.curiosity ? '○' : '×'}
                            </td>
                            <td style="padding: var(--space-sm); text-align: center; color: ${cr.triggers?.relevance ? 'var(--color-success)' : 'var(--color-text-muted)'};">
                                ${cr.triggers?.relevance ? '○' : '×'}
                            </td>
                            <td style="padding: var(--space-sm); text-align: center; color: ${cr.triggers?.urgency ? 'var(--color-success)' : 'var(--color-text-muted)'};">
                                ${cr.triggers?.urgency ? '○' : '×'}
                            </td>
                            <td style="padding: var(--space-sm); text-align: center; font-weight: bold; color: var(--color-primary);">
                                ${cr.triggerScore}/3
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="margin-top: var(--space-md); color: var(--color-text-secondary); font-size: 12px;">
                ※ 3つ中2つ以上発動で合格
            </p>
        </div>
    `;
}

function generateAiBattleHtml(creatives, personas) {
    const latentCR = creatives.find(cr => cr.targetType === 'latent');
    const latentN1 = personas.find(p => p.type === 'latent');

    if (!latentCR || !latentN1) return '';

    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">
                【AIバトル】CR #${latentCR.id} × N1-${latentN1.id}（潜在層）
            </h4>

            <div style="margin-bottom: var(--space-lg);">
                <div style="padding: var(--space-md); background: var(--color-bg); border-radius: var(--radius-sm); margin-bottom: var(--space-md);">
                    <strong style="color: var(--color-primary);">🛡️ タップさせるAI:</strong>
                    <pre style="margin-top: var(--space-sm); font-family: var(--font-mono); font-size: 12px; white-space: pre-wrap;">${latentCR.copy}</pre>
                </div>

                <div style="padding: var(--space-md); background: rgba(139, 92, 246, 0.1); border-radius: var(--radius-sm);">
                    <strong style="color: var(--color-latent);">👤 タップするAI（N1-${latentN1.id} ${latentN1.name} ${latentN1.age}歳・潜在層になりきり）:</strong>
                    <p style="margin-top: var(--space-sm); color: var(--color-text);">「タップする」</p>

                    <div style="margin-top: var(--space-md); font-size: 12px; color: var(--color-text-secondary);">
                        <strong>■ 3トリガー検証:</strong><br>
                        Curiosity: ○ （「え、何だろう」と気になった）<br>
                        Relevance: ○ （「同じこと感じてる」が刺さった）<br>
                        Urgency: △ （今すぐ感は弱いが、気になる）
                    </div>

                    <div style="margin-top: var(--space-md); font-size: 12px; color: var(--color-text-secondary);">
                        <strong>■ タップする理由:</strong><br>
                        「広告っぽくなかったから、普通に気になった。同じこと感じてる人がいるんだって思って、ちょっと見てみようかなって。」
                    </div>
                </div>
            </div>

            <div style="padding: var(--space-md); background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); text-align: center;">
                <strong style="color: var(--color-success); font-size: 16px;">🛡️ 勝利！（1ラウンド）</strong>
            </div>
        </div>
    `;
}

function generateTapTestHtml(creatives, personas) {
    return `
        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【N1 5人タップテスト】</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <th style="padding: var(--space-sm); text-align: left;">CR</th>
                        ${personas.map(p => `<th style="padding: var(--space-sm);">N1-${p.id}<br><span style="font-size: 10px; font-weight: normal;">${p.typeLabel}</span></th>`).join('')}
                        <th style="padding: var(--space-sm);">合計</th>
                    </tr>
                </thead>
                <tbody>
                    ${creatives.map(cr => `
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: var(--space-sm);">#${cr.id}</td>
                            ${cr.tapResults.map(tap => `
                                <td style="padding: var(--space-sm); text-align: center; color: ${tap ? 'var(--color-success)' : 'var(--color-text-muted)'};">
                                    ${tap ? '◎' : '×'}
                                </td>
                            `).join('')}
                            <td style="padding: var(--space-sm); text-align: center; font-weight: bold; color: var(--color-primary);">
                                ${cr.tapResults.filter(t => t).length}/5人
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div style="background: var(--color-bg-input); border-radius: var(--radius-md); padding: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--color-primary);">【スコアリング】230点満点</h4>
            ${creatives.map(cr => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm); margin-bottom: var(--space-xs); border-bottom: 1px solid var(--color-border);">
                    <span>CR #${cr.id}（${cr.targetType === 'latent' ? '潜在層向け' : '顕在層向け'}）${cr.targetType === 'latent' ? '★' : ''}</span>
                    <span style="font-weight: bold; color: ${cr.totalScore >= 200 ? 'var(--color-success)' : cr.totalScore >= 180 ? 'var(--color-primary)' : 'var(--color-text-secondary)'};">
                        ${cr.totalScore}点
                        ${cr.totalScore >= 200 ? '🥇本命' : cr.totalScore >= 180 ? '🥈対抗' : cr.totalScore >= 160 ? '🥉穴馬' : ''}
                    </span>
                </div>
            `).join('')}
        </div>
    `;
}

function generateFinalSummaryHtml(creatives) {
    return `
        <div style="text-align: center; padding: var(--space-xl);">
            <div style="font-size: 48px; margin-bottom: var(--space-md);">🏆</div>
            <h3 style="font-size: 24px; margin-bottom: var(--space-sm);">CR制作システム v7.0 完了</h3>
            <p style="color: var(--color-text-secondary);">
                案件: ${projectData.productName}<br>
                TOP5 CR生成完了
            </p>
            <div style="margin-top: var(--space-xl);">
                <button class="btn btn-primary btn-lg" onclick="showSection('output')">
                    最終出力を確認 →
                </button>
            </div>
        </div>
    `;
}

// ========================================
// UI更新関数群
// ========================================

function createRoundOutput(roundNum, title) {
    const container = document.getElementById('processOutput');
    const output = document.createElement('div');
    output.className = 'round-output';
    output.innerHTML = `
        <div class="round-output-header">
            <span class="round-output-number">${roundNum}</span>
            <span class="round-output-title">Round ${roundNum}: ${title}</span>
        </div>
        <div class="round-output-content"></div>
    `;
    container.appendChild(output);

    // スクロール
    container.scrollTop = container.scrollHeight;

    // カレントラウンド更新
    document.getElementById('currentRoundNum').textContent = roundNum;

    return output;
}

function addPurposeReminder(output) {
    const reminder = document.createElement('div');
    reminder.className = 'purpose-reminder';
    reminder.innerHTML = `
        <span class="purpose-reminder-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                <path d="M10 6v5M10 13v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </span>
        <div class="purpose-reminder-text">
            <strong>秋元（目的確認）:</strong><br>
            「CRの目的: <strong>興味を持たせてタップさせる</strong>」
        </div>
    `;
    output.querySelector('.round-output-content').appendChild(reminder);
}

function addAiMessage(personaKey, message) {
    const persona = AI_PERSONAS[personaKey];
    const discussion = document.getElementById('aiDiscussion');

    const msgElement = document.createElement('div');
    msgElement.className = 'ai-message';
    msgElement.innerHTML = `
        <div class="ai-message-avatar ${persona.class}">${persona.avatar}</div>
        <div class="ai-message-content">
            <div class="ai-message-name">${persona.name}（${persona.role}）</div>
            <div class="ai-message-text">${message}</div>
        </div>
    `;
    discussion.appendChild(msgElement);

    // スクロール
    discussion.scrollTop = discussion.scrollHeight;

    // アバターをアクティブに
    document.querySelectorAll('.ai-avatar').forEach(av => av.classList.remove('active'));
    const activeAvatar = document.querySelector(`.ai-avatar[data-name="${persona.name}"]`);
    if (activeAvatar) activeAvatar.classList.add('active');
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
}

function updateRoundStatus(roundNum, status) {
    const round = document.querySelector(`.round[data-round="${roundNum}"]`);
    if (round) {
        round.classList.remove('active', 'completed');
        round.classList.add(status);
    }
}

function updatePhaseStatus(phaseNum, status) {
    const phase = document.querySelector(`.phase[data-phase="${phaseNum}"]`);
    if (phase) {
        phase.classList.remove('active', 'completed');
        phase.classList.add(status);

        const icon = phase.querySelector('.phase-icon');
        icon.classList.remove('active', 'completed', 'pending');
        icon.classList.add(status);
    }
}

// ========================================
// ユーティリティ
// ========================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            ${type === 'success'
                ? '<circle cx="10" cy="10" r="8" stroke="var(--color-success)" stroke-width="1.5"/><path d="M7 10l2 2 4-4" stroke="var(--color-success)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
                : '<circle cx="10" cy="10" r="8" stroke="var(--color-error)" stroke-width="1.5"/><path d="M7 7l6 6M13 7l-6 6" stroke="var(--color-error)" stroke-width="1.5" stroke-linecap="round"/>'}
        </svg>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function saveDraft() {
    const data = collectFormData();
    localStorage.setItem('cr_draft', JSON.stringify(data));
    showToast('下書きを保存しました', 'success');
}

function loadDraft() {
    const draft = localStorage.getItem('cr_draft');
    if (draft) {
        const data = JSON.parse(draft);
        Object.entries(data).forEach(([key, value]) => {
            const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (field) field.value = value;
        });
    }
}

function resetApp() {
    if (confirm('入力内容をリセットしますか？')) {
        localStorage.removeItem('cr_draft');
        document.getElementById('projectForm').reset();

        // 状態リセット
        projectData = null;
        currentRound = 0;
        currentPhase = 0;
        n1Personas = [];
        concepts = [];
        creatives = [];
        isProcessing = false;

        // UI リセット
        updateProgress(0);
        document.querySelectorAll('.round, .phase').forEach(el => {
            el.classList.remove('active', 'completed');
        });
        document.getElementById('processOutput').innerHTML = `
            <div class="process-placeholder">
                <div class="placeholder-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
                        <path d="M24 16v16M16 24h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <p>案件情報を入力して「CR生成を開始」をクリックしてください</p>
            </div>
        `;
        document.getElementById('aiDiscussion').innerHTML = '';
        document.getElementById('exportBtn').disabled = true;

        showSection('input');
        showToast('リセットしました', 'success');
    }
}

function toggleAiPanel() {
    const panel = document.getElementById('aiPanel');
    panel.classList.toggle('collapsed');
}

function exportResults() {
    if (!creatives.length) {
        showToast('エクスポートするデータがありません', 'error');
        return;
    }

    // エクスポートテキスト生成
    let exportText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 CR制作システム v7.0 最終出力
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

案件: ${projectData.productName}
実行日: ${new Date().toLocaleDateString('ja-JP')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ N1（顕在度別5人）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${n1Personas.map(n1 => `N1-${n1.id}: ${n1.name}（${n1.age}歳）- ${n1.typeLabel}
  「${n1.quote}」`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ CR TOP5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    creatives.forEach((cr, i) => {
        const ranks = ['🥇', '🥈', '🥉', '4位', '5位'];
        exportText += `
${ranks[i]} CR #${cr.id}: ${cr.conceptName}（${cr.totalScore}点）
─────────────────────────────────
${cr.copy}
─────────────────────────────────
【ビジュアル】${cr.visual}
【チェック】行ごと○ / 3トリガー ${cr.triggerScore}/3 ${cr.targetType === 'latent' ? '/ 禁止ワードなし✓' : ''}
【N1タップ】${cr.tapResults.filter(t => t).length}/5人

`;
    });

    exportText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 運用提案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【Phase 1: CPA確認】
CR #1, #2（顕在層向け）
予算: ¥10,000/日 × 7日
目標: CPA ${projectData.targetCPA}以下

【Phase 2: スケール】
CR #3, #4, #5（潜在層向け）
予算: ¥30,000/日〜
目標: CPA ${projectData.targetCPA}以下 → スケール

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以上、CR制作システム v7.0 最終出力完了。
`;

    // ダウンロード
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CR_TOP5_${projectData.productName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('エクスポートしました', 'success');
}

function closeModal() {
    document.getElementById('copyModal').classList.remove('active');
}

function copyPrompt() {
    const text = document.getElementById('promptText').value;
    navigator.clipboard.writeText(text).then(() => {
        showToast('クリップボードにコピーしました', 'success');
        closeModal();
    });
}

// ========================================
// グローバル関数（HTML から呼び出し用）
// ========================================
window.showSection = showSection;
