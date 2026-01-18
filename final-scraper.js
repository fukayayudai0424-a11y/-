/**
 * 最終版スクレイパー - Puppeteer + Proxy Authentication
 */

const puppeteer = require('puppeteer-core');
const XLSX = require('xlsx');
const fs = require('fs');

const CONFIG = {
  loginUrl: 'https://dpro.kashika-20mile.com/login',
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9',
  searchKeyword: '類似キーワード',
  outputFile: 'ad_data.xlsx'
};

function log(msg) {
  console.log('[' + new Date().toISOString().slice(11,19) + '] ' + msg);
}

async function sleep(ms) {
  return new Promise(function(r) { setTimeout(r, ms); });
}

// Chromiumパスを探す
function findChromium() {
  const paths = [
    '/root/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome',
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  log('========================================');
  log('動画広告分析Pro 最終版スクレイパー');
  log('========================================');

  const chromePath = findChromium();
  if (!chromePath) {
    log('Chromiumが見つかりません');
    return;
  }
  log('Chromium: ' + chromePath);

  // プロキシ情報をパース
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  const proxyMatch = proxyUrl ? proxyUrl.match(/http:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/) : null;

  if (!proxyMatch) {
    log('プロキシ情報が見つかりません');
    return;
  }

  const proxyUser = proxyMatch[1];
  const proxyPass = proxyMatch[2];
  const proxyHost = proxyMatch[3];
  const proxyPort = proxyMatch[4];
  log('プロキシ: ' + proxyHost + ':' + proxyPort);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--proxy-server=http://' + proxyHost + ':' + proxyPort
    ]
  });

  const page = await browser.newPage();

  // プロキシ認証
  await page.authenticate({
    username: proxyUser,
    password: proxyPass
  });

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const collectedAds = [];

  try {
    log('ログインページにアクセス中...');
    await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    log('ページ読み込み完了');

    await sleep(2000);

    // ログインフォーム入力
    log('ログイン情報を入力中...');

    // メールアドレス
    await page.waitForSelector('input', { timeout: 10000 });
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type(CONFIG.email, { delay: 50 });
      await inputs[1].type(CONFIG.password, { delay: 50 });
      log('認証情報入力完了');
    }

    await sleep(1000);

    // ログインボタン
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(function(el) { return el.textContent; }, btn);
      if (text.includes('LOGIN') || text.includes('ログイン')) {
        await btn.click();
        log('ログインボタンクリック');
        break;
      }
    }

    // ナビゲーション待機
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(function() {});
    await sleep(3000);

    log('現在のURL: ' + page.url());

    if (!page.url().includes('login')) {
      log('ログイン成功！');

      // 検索フィールドを探す
      const searchInput = await page.$('input[type="search"], input[placeholder*="検索"], input[placeholder*="キーワード"]');
      if (searchInput) {
        await searchInput.type(CONFIG.searchKeyword, { delay: 30 });
        await page.keyboard.press('Enter');
        log('検索実行');
        await sleep(5000);
      }

      // データ収集
      log('データを収集中...');

      const pageData = await page.evaluate(function() {
        var results = [];
        var cards = document.querySelectorAll('[class*="card"], [class*="item"], [class*="result"], article');

        cards.forEach(function(card) {
          var text = card.textContent || '';
          var links = Array.from(card.querySelectorAll('a')).map(function(a) { return a.href; });
          var images = Array.from(card.querySelectorAll('img')).map(function(i) { return i.src; });

          if (text.length > 30 || links.length > 0) {
            var viewMatch = text.match(/(\d+[,\d]*)\s*(再生|回|views?)/i);
            var likeMatch = text.match(/(\d+[,\d]*)\s*(いいね|like)/i);

            results.push({
              videoUrl: links.find(function(l) { return l.includes('youtube') || l.includes('tiktok'); }) || '',
              imageUrl: images[0] || '',
              views: viewMatch ? viewMatch[1] : '',
              likes: likeMatch ? likeMatch[1] : '',
              adText: text.substring(0, 500).replace(/\s+/g, ' ').trim(),
              lpUrl: links.find(function(l) { return !l.includes('dpro.kashika'); }) || ''
            });
          }
        });

        return results;
      });

      log('収集データ: ' + pageData.length + '件');
      collectedAds.push.apply(collectedAds, pageData);
    } else {
      log('ログインに失敗しました');
    }

  } catch (error) {
    log('エラー: ' + error.message);
  } finally {
    await browser.close();
  }

  // Excel出力
  log('Excelにエクスポート中...');
  var wsData = [
    ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
  ];

  for (var i = 0; i < collectedAds.length; i++) {
    var ad = collectedAds[i];
    wsData.push([
      ad.videoUrl || '', ad.imageUrl || '', ad.views || '', '',
      ad.likes || '', ad.adText || '', ad.lpUrl || '', ''
    ]);
  }

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, '広告データ');
  XLSX.writeFile(wb, CONFIG.outputFile);

  log('Excel保存完了: ' + CONFIG.outputFile + ' (' + collectedAds.length + '件)');
  log('========================================');
}

main().catch(console.error);
