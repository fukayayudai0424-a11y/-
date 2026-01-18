/**
 * 動画広告分析Pro - 広告データスクレイピングスクリプト
 *
 * このスクリプトは動画広告分析Proにログインし、広告データを収集してExcelファイルに出力します。
 *
 * 使用方法:
 *   1. npm install を実行
 *   2. npx playwright install chromium を実行
 *   3. node ad-scraper.js を実行
 *
 * 設定は CONFIG オブジェクトで変更できます。
 */

const { chromium } = require('playwright');
const XLSX = require('xlsx');

// ========================================
// 設定
// ========================================
const CONFIG = {
  loginUrl: 'https://dpro.kashika-20mile.com/login',
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9',
  searchKeyword: '類似キーワード',
  outputFile: 'ad_data.xlsx',
  screenshotsDir: './screenshots',
  timeout: 30000,
  maxAdsToCollect: 100
};

// 収集したデータ
const collectedAds = [];

// ========================================
// ユーティリティ関数
// ========================================
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// スクリーンショット保存
async function saveScreenshot(page, name) {
  const fs = require('fs');
  if (!fs.existsSync(CONFIG.screenshotsDir)) {
    fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
  }
  const path = `${CONFIG.screenshotsDir}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  log(`Screenshot saved: ${path}`);
}

// ========================================
// ログイン処理
// ========================================
async function login(page) {
  log('ログインページにアクセス中...');
  await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
  await saveScreenshot(page, '01_login_page');

  // ページが完全に読み込まれるまで待機
  await sleep(2000);

  // メールアドレス入力
  log('メールアドレスを入力中...');
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="メール"]',
    'input[placeholder*="email"]',
    'input[placeholder*="Email"]',
    '#email',
    '[data-testid="email"]',
    'input[autocomplete="email"]'
  ];

  let emailFilled = false;
  for (const selector of emailSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.fill(CONFIG.email);
        log(`メールアドレス入力完了 (selector: ${selector})`);
        emailFilled = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!emailFilled) {
    // 最初のテキスト/メール入力フィールドを探す
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      if (!type || type === 'text' || type === 'email') {
        await input.fill(CONFIG.email);
        log('メールアドレス入力完了 (最初の入力フィールド)');
        emailFilled = true;
        break;
      }
    }
  }

  // パスワード入力
  log('パスワードを入力中...');
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    '#password',
    '[data-testid="password"]'
  ];

  let passwordFilled = false;
  for (const selector of passwordSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        await element.fill(CONFIG.password);
        log(`パスワード入力完了 (selector: ${selector})`);
        passwordFilled = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  await saveScreenshot(page, '02_credentials_entered');

  // ログインボタンをクリック
  log('ログインボタンをクリック中...');
  const loginButtonSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("ログイン")',
    'button:has-text("Login")',
    'button:has-text("サインイン")',
    'button:has-text("Sign in")',
    '[data-testid="login-button"]',
    '.login-button',
    '#login-button'
  ];

  let clicked = false;
  for (const selector of loginButtonSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        log(`ログインボタンクリック完了 (selector: ${selector})`);
        clicked = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!clicked) {
    // フォーム内のボタンを探す
    try {
      await page.click('form button');
      log('ログインボタンクリック完了 (form button)');
      clicked = true;
    } catch (e) {
      // Enterキーを押す
      await page.keyboard.press('Enter');
      log('Enterキーを押下');
    }
  }

  // ナビゲーション待機
  await Promise.race([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: CONFIG.timeout }),
    sleep(10000)
  ]);

  await sleep(3000);
  await saveScreenshot(page, '03_after_login');

  // ログイン成功確認
  const currentUrl = page.url();
  if (currentUrl.includes('login')) {
    log('警告: まだログインページにいる可能性があります');
    // エラーメッセージを確認
    const errorText = await page.textContent('[class*="error"], [class*="alert"], .error-message').catch(() => null);
    if (errorText) {
      log(`エラーメッセージ: ${errorText}`);
    }
  } else {
    log('ログイン成功');
  }

  return true;
}

// ========================================
// キーワード検索
// ========================================
async function searchKeyword(page) {
  log(`キーワード検索: "${CONFIG.searchKeyword}"`);

  await sleep(2000);
  await saveScreenshot(page, '04_main_page');

  // 検索入力フィールドを探す
  const searchSelectors = [
    'input[type="search"]',
    'input[placeholder*="検索"]',
    'input[placeholder*="キーワード"]',
    'input[placeholder*="search"]',
    'input[name="keyword"]',
    'input[name="search"]',
    'input[name="q"]',
    '#search',
    '#keyword',
    '.search-input',
    '[data-testid="search-input"]'
  ];

  let searchInput = null;
  for (const selector of searchSelectors) {
    try {
      searchInput = await page.$(selector);
      if (searchInput) {
        log(`検索入力フィールド発見 (selector: ${selector})`);
        break;
      }
    } catch (e) {
      continue;
    }
  }

  // サイドバーやナビゲーションから検索ページへ移動する必要があるか確認
  if (!searchInput) {
    log('検索フィールドが見つかりません。ナビゲーションを確認中...');

    const navLinks = await page.$$('a, button');
    for (const link of navLinks) {
      const text = await link.textContent().catch(() => '');
      if (text && (text.includes('検索') || text.includes('リサーチ') || text.includes('広告'))) {
        log(`ナビゲーションリンク発見: "${text}"`);
        await link.click();
        await sleep(3000);
        await saveScreenshot(page, '04b_navigation');

        // 再度検索フィールドを探す
        for (const selector of searchSelectors) {
          try {
            searchInput = await page.$(selector);
            if (searchInput) break;
          } catch (e) {
            continue;
          }
        }
        if (searchInput) break;
      }
    }
  }

  if (searchInput) {
    await searchInput.fill(CONFIG.searchKeyword);
    log('検索キーワード入力完了');

    // 検索ボタンまたはEnterキー
    const searchButton = await page.$('button[type="submit"], button:has-text("検索"), [data-testid="search-button"]');
    if (searchButton) {
      await searchButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // 結果を待機
    await Promise.race([
      page.waitForLoadState('networkidle', { timeout: CONFIG.timeout }),
      sleep(10000)
    ]);

    await sleep(3000);
    await saveScreenshot(page, '05_search_results');
    log('検索完了');
  } else {
    log('検索フィールドが見つかりませんでした');
  }

  return true;
}

// ========================================
// 広告データ収集
// ========================================
async function collectAdData(page) {
  log('広告データを収集中...');

  await sleep(2000);

  // ページからデータを抽出
  const pageData = await page.evaluate(() => {
    const data = [];

    // テーブルデータを収集
    document.querySelectorAll('table').forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, index) => {
        if (index === 0) return; // ヘッダー行をスキップ

        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          const rowData = {
            type: 'table',
            cells: Array.from(cells).map(cell => ({
              text: cell.textContent.trim(),
              links: Array.from(cell.querySelectorAll('a')).map(a => a.href),
              images: Array.from(cell.querySelectorAll('img')).map(i => i.src)
            }))
          };
          data.push(rowData);
        }
      });
    });

    // カード形式のデータを収集
    const cardSelectors = [
      '[class*="card"]',
      '[class*="item"]',
      '[class*="ad-"]',
      '[class*="video-"]',
      '[class*="result"]',
      'article',
      '.list-item'
    ];

    const processedElements = new Set();

    cardSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        if (processedElements.has(card)) return;
        processedElements.add(card);

        const cardData = {
          type: 'card',
          text: card.textContent.trim().substring(0, 1000),
          links: Array.from(card.querySelectorAll('a')).map(a => ({
            href: a.href,
            text: a.textContent.trim()
          })),
          images: Array.from(card.querySelectorAll('img')).map(i => ({
            src: i.src,
            alt: i.alt
          })),
          videos: Array.from(card.querySelectorAll('video, iframe')).map(v => ({
            src: v.src || v.getAttribute('data-src')
          }))
        };

        if (cardData.links.length > 0 || cardData.images.length > 0 || cardData.text.length > 50) {
          data.push(cardData);
        }
      });
    });

    return {
      pageUrl: window.location.href,
      pageTitle: document.title,
      data: data.slice(0, 100) // 最大100件
    };
  });

  log(`ページURL: ${pageData.pageUrl}`);
  log(`ページタイトル: ${pageData.pageTitle}`);
  log(`収集したアイテム数: ${pageData.data.length}`);

  // データを構造化
  for (const item of pageData.data) {
    const adEntry = {
      videoUrl: '',
      imageUrl: '',
      views: '',
      recentIncrease: '',
      likes: '',
      adText: '',
      lpUrl: '',
      lpText: ''
    };

    if (item.type === 'table') {
      // テーブルデータから情報を抽出
      item.cells.forEach((cell, index) => {
        if (cell.links.length > 0) {
          const link = cell.links[0];
          if (link.includes('youtube') || link.includes('tiktok') || link.includes('video')) {
            adEntry.videoUrl = link;
          } else if (!adEntry.lpUrl) {
            adEntry.lpUrl = link;
          }
        }
        if (cell.images.length > 0 && !adEntry.imageUrl) {
          adEntry.imageUrl = cell.images[0];
        }
        if (cell.text && !adEntry.adText) {
          adEntry.adText = cell.text;
        }
      });
    } else if (item.type === 'card') {
      adEntry.adText = item.text;

      // リンクから情報を抽出
      item.links.forEach(link => {
        if (link.href) {
          if (link.href.includes('youtube') || link.href.includes('tiktok') || link.href.includes('video')) {
            adEntry.videoUrl = link.href;
          } else if (link.href.includes('lp') || link.href.includes('landing') || link.text.includes('LP')) {
            adEntry.lpUrl = link.href;
          }
        }
      });

      // 画像URL
      if (item.images.length > 0) {
        adEntry.imageUrl = item.images[0].src;
      }

      // 動画URL
      if (item.videos.length > 0 && item.videos[0].src) {
        adEntry.videoUrl = item.videos[0].src;
      }

      // テキストからメトリクスを抽出
      const viewMatch = item.text.match(/(\d+[,\d]*)\s*(再生|回|views?|回再生)/i);
      if (viewMatch) adEntry.views = viewMatch[1];

      const likeMatch = item.text.match(/(\d+[,\d]*)\s*(いいね|like|♡|👍)/i);
      if (likeMatch) adEntry.likes = likeMatch[1];

      const increaseMatch = item.text.match(/[+＋]?\s*(\d+[,\d]*)\s*(増加|増|increase)/i);
      if (increaseMatch) adEntry.recentIncrease = increaseMatch[1];
    }

    // 有効なデータのみ追加
    if (adEntry.videoUrl || adEntry.imageUrl || adEntry.adText.length > 20) {
      collectedAds.push(adEntry);
    }
  }

  log(`構造化されたデータ数: ${collectedAds.length}`);
  return collectedAds;
}

// ========================================
// 詳細ページからの追加データ収集
// ========================================
async function collectDetailData(page) {
  log('詳細ページからデータを収集中...');

  // 詳細リンクを取得
  const detailLinks = await page.$$eval(
    'a[href*="detail"], a[href*="/ad/"], a[href*="/video/"], [class*="detail"] a',
    links => links.slice(0, 10).map(l => l.href)
  );

  log(`詳細ページリンク数: ${detailLinks.length}`);

  for (let i = 0; i < detailLinks.length && i < 10; i++) {
    try {
      log(`詳細ページ ${i + 1}/${detailLinks.length} を処理中...`);

      await page.goto(detailLinks[i], { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      await sleep(2000);

      const detailData = await page.evaluate(() => {
        const getMetric = (patterns) => {
          for (const pattern of patterns) {
            const match = document.body.textContent.match(pattern);
            if (match) return match[1];
          }
          return '';
        };

        return {
          url: window.location.href,
          title: document.title,
          videoUrl: document.querySelector('video, iframe[src*="youtube"], iframe[src*="tiktok"]')?.src || '',
          imageUrl: document.querySelector('img[class*="main"], img[class*="thumb"]')?.src || '',
          views: getMetric([/(\d+[,\d]*)\s*(再生|views?)/i]),
          likes: getMetric([/(\d+[,\d]*)\s*(いいね|like)/i]),
          increase: getMetric([/[+＋](\d+[,\d]*)/]),
          adText: document.querySelector('[class*="description"], [class*="text"], .ad-text')?.textContent?.trim() || '',
          lpUrl: document.querySelector('a[href*="lp"], a:has-text("LP")')?.href || '',
          lpText: ''
        };
      });

      // LP URLがある場合、LP内容を取得
      if (detailData.lpUrl && detailData.lpUrl.startsWith('http')) {
        try {
          await page.goto(detailData.lpUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          detailData.lpText = await page.evaluate(() => {
            const mainContent = document.querySelector('main, article, .content, #content, .main');
            return (mainContent || document.body).textContent.trim().substring(0, 500);
          });
        } catch (e) {
          log(`LP取得エラー: ${e.message}`);
        }
      }

      collectedAds.push({
        videoUrl: detailData.videoUrl,
        imageUrl: detailData.imageUrl,
        views: detailData.views,
        recentIncrease: detailData.increase,
        likes: detailData.likes,
        adText: detailData.adText.substring(0, 500),
        lpUrl: detailData.lpUrl,
        lpText: detailData.lpText
      });

      // 一覧ページに戻る
      await page.goBack();
      await sleep(1000);

    } catch (e) {
      log(`詳細ページ処理エラー: ${e.message}`);
    }
  }

  return collectedAds;
}

// ========================================
// Excelエクスポート
// ========================================
function exportToExcel(data) {
  log('Excelファイルにエクスポート中...');

  // ヘッダー行
  const worksheetData = [
    ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
  ];

  // データ行
  for (const ad of data) {
    worksheetData.push([
      ad.videoUrl || '',
      ad.imageUrl || '',
      ad.views || '',
      ad.recentIncrease || '',
      ad.likes || '',
      ad.adText || '',
      ad.lpUrl || '',
      ad.lpText || ''
    ]);
  }

  // ワークブック作成
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 列幅設定
  worksheet['!cols'] = [
    { wch: 60 },  // 動画広告URL
    { wch: 60 },  // 画像広告URL
    { wch: 15 },  // 再生数
    { wch: 15 },  // 直近の増加数
    { wch: 15 },  // いいね数
    { wch: 80 },  // 広告テキスト
    { wch: 60 },  // LP URL
    { wch: 80 }   // LPの文
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, '広告データ');
  XLSX.writeFile(workbook, CONFIG.outputFile);

  log(`Excelファイル保存完了: ${CONFIG.outputFile}`);
  log(`エクスポートされたデータ件数: ${data.length}`);

  return CONFIG.outputFile;
}

// ========================================
// メイン処理
// ========================================
async function main() {
  log('========================================');
  log('動画広告分析Pro スクレイピングスクリプト');
  log('========================================');
  log(`ターゲットURL: ${CONFIG.loginUrl}`);
  log(`検索キーワード: ${CONFIG.searchKeyword}`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP'
  });

  const page = await context.newPage();

  // コンソールログを出力
  page.on('console', msg => {
    if (msg.type() === 'error') {
      log(`[ブラウザエラー] ${msg.text()}`);
    }
  });

  try {
    // 1. ログイン
    await login(page);

    // 2. キーワード検索
    await searchKeyword(page);

    // 3. 広告データ収集
    await collectAdData(page);

    // 4. 詳細ページからの追加データ収集（オプション）
    if (collectedAds.length < 10) {
      await collectDetailData(page);
    }

    // 5. Excelエクスポート
    if (collectedAds.length > 0) {
      exportToExcel(collectedAds);
    } else {
      log('収集されたデータがありません。空のExcelファイルを作成します。');
      exportToExcel([]);
    }

    await saveScreenshot(page, '99_final');

  } catch (error) {
    log(`エラー: ${error.message}`);
    console.error(error);
    await saveScreenshot(page, '99_error');

    // 収集できたデータがあればエクスポート
    if (collectedAds.length > 0) {
      log('エラーが発生しましたが、収集済みのデータをエクスポートします。');
      exportToExcel(collectedAds);
    }
  } finally {
    await browser.close();
  }

  log('========================================');
  log('スクリプト完了');
  log(`収集されたデータ件数: ${collectedAds.length}`);
  log('========================================');
}

// 実行
main().catch(console.error);
