/**
 * 動画広告分析Pro - プロキシ対応版スクレイパー
 */

const { chromium } = require('playwright');
const XLSX = require('xlsx');

const CONFIG = {
  loginUrl: 'https://dpro.kashika-20mile.com/login',
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9',
  searchKeyword: '類似キーワード',
  outputFile: 'ad_data.xlsx'
};

const collectedAds = [];

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  log('========================================');
  log('動画広告分析Pro スクレイパー (プロキシ対応版)');
  log('========================================');

  // プロキシ設定を取得
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  log(`プロキシ: ${proxyUrl ? 'あり' : 'なし'}`);

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update'
    ]
  };

  // プロキシ設定
  if (proxyUrl) {
    launchOptions.proxy = { server: proxyUrl };
    log('Playwrightにプロキシを設定しました');
  }

  const browser = await chromium.launch(launchOptions);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    log('ログインページにアクセス中...');
    await page.goto(CONFIG.loginUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    log('ページ読み込み完了');
    await sleep(3000);

    // ログインフォームを待機
    log('ログインフォームを探索中...');

    // メールアドレス入力
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="メール"]');
    if (emailInput) {
      await emailInput.fill(CONFIG.email);
      log('メールアドレス入力完了');
    } else {
      // 全てのinputを取得して最初のものを使用
      const inputs = await page.$$('input');
      if (inputs.length > 0) {
        await inputs[0].fill(CONFIG.email);
        log('メールアドレス入力完了 (最初のinput)');
      }
    }

    // パスワード入力
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(CONFIG.password);
      log('パスワード入力完了');
    }

    await sleep(1000);

    // ログインボタンクリック
    const loginButton = await page.$('button[type="submit"], button:has-text("LOGIN"), button:has-text("ログイン")');
    if (loginButton) {
      await loginButton.click();
      log('ログインボタンクリック');
    } else {
      await page.keyboard.press('Enter');
      log('Enterキー押下');
    }

    // ナビゲーション待機
    await Promise.race([
      page.waitForNavigation({ timeout: 30000 }).catch(() => {}),
      sleep(10000)
    ]);

    log(`現在のURL: ${page.url()}`);
    await sleep(3000);

    // ログイン成功確認
    if (!page.url().includes('login')) {
      log('ログイン成功！');

      // 検索キーワード入力
      log('検索フィールドを探索中...');
      const searchInput = await page.$('input[type="search"], input[placeholder*="検索"], input[placeholder*="キーワード"], input[name="keyword"]');

      if (searchInput) {
        await searchInput.fill(CONFIG.searchKeyword);
        await page.keyboard.press('Enter');
        log('検索実行');
        await sleep(5000);
      }

      // データ収集
      log('広告データを収集中...');

      const pageData = await page.evaluate(() => {
        const results = [];

        // カード要素を探す
        const cards = document.querySelectorAll('[class*="card"], [class*="item"], [class*="result"], article, .ad, [class*="video"]');

        cards.forEach(card => {
          const text = card.textContent || '';
          const links = Array.from(card.querySelectorAll('a')).map(a => a.href);
          const images = Array.from(card.querySelectorAll('img')).map(i => i.src);
          const videos = Array.from(card.querySelectorAll('video, iframe')).map(v => v.src);

          // メトリクス抽出
          const viewMatch = text.match(/(\d+[,\d]*)\s*(再生|回|views?)/i);
          const likeMatch = text.match(/(\d+[,\d]*)\s*(いいね|like|♡)/i);
          const increaseMatch = text.match(/[+＋]\s*(\d+[,\d]*)/);

          if (links.length > 0 || images.length > 0 || text.length > 50) {
            results.push({
              videoUrl: videos[0] || links.find(l => l.includes('youtube') || l.includes('tiktok')) || '',
              imageUrl: images[0] || '',
              views: viewMatch ? viewMatch[1] : '',
              recentIncrease: increaseMatch ? increaseMatch[1] : '',
              likes: likeMatch ? likeMatch[1] : '',
              adText: text.substring(0, 500).trim(),
              lpUrl: links.find(l => l.includes('lp') || !l.includes('dpro.kashika')) || '',
              lpText: ''
            });
          }
        });

        return {
          url: window.location.href,
          title: document.title,
          results: results.slice(0, 50)
        };
      });

      log(`ページタイトル: ${pageData.title}`);
      log(`収集したアイテム: ${pageData.results.length}件`);

      collectedAds.push(...pageData.results);

    } else {
      log('ログインページに留まっています。認証情報を確認してください。');
    }

  } catch (error) {
    log(`エラー: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Excel出力
  log('Excelにエクスポート中...');

  const wsData = [
    ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
  ];

  for (const ad of collectedAds) {
    wsData.push([
      ad.videoUrl, ad.imageUrl, ad.views, ad.recentIncrease,
      ad.likes, ad.adText, ad.lpUrl, ad.lpText
    ]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 60 }, { wch: 60 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 80 }, { wch: 60 }, { wch: 80 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, '広告データ');
  XLSX.writeFile(wb, CONFIG.outputFile);

  log(`Excel保存完了: ${CONFIG.outputFile}`);
  log(`総収集データ: ${collectedAds.length}件`);
  log('========================================');
}

main().catch(console.error);
