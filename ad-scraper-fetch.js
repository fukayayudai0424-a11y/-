/**
 * 動画広告分析Pro - node-fetch + https-proxy-agent ベースのスクレイパー
 */

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { JSDOM } = require('jsdom');
const XLSX = require('xlsx');

const CONFIG = {
  baseUrl: 'https://dpro.kashika-20mile.com',
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9',
  searchKeyword: '類似キーワード',
  outputFile: 'ad_data.xlsx'
};

// プロキシエージェント作成
function createProxyAgent() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyUrl) {
    console.log('Using proxy agent');
    return new HttpsProxyAgent(proxyUrl);
  }
  return null;
}

const agent = createProxyAgent();

async function fetchWithProxy(url, options = {}) {
  const fetchOptions = {
    ...options,
    agent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      ...options.headers
    }
  };
  return fetch(url, fetchOptions);
}

// Firebase API Keyを取得
async function getFirebaseConfig() {
  console.log('Fetching login page to find Firebase config...');

  const response = await fetchWithProxy(`${CONFIG.baseUrl}/login`);
  const html = await response.text();

  // Firebase設定を探す（いくつかのパターンを試す）
  const patterns = [
    /apiKey['":\s]+['"]([^'"]+)['"]/,
    /FIREBASE_API_KEY['":\s]+['"]([^'"]+)['"]/,
    /"apiKey"\s*:\s*"([^"]+)"/
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // _next/static からJSファイルを探す
  const jsFileMatch = html.match(/\/_next\/static\/chunks\/[^"]+\.js/g);
  if (jsFileMatch) {
    console.log(`Found ${jsFileMatch.length} JS files, checking for Firebase config...`);

    for (const jsPath of jsFileMatch.slice(0, 5)) {
      try {
        const jsResponse = await fetchWithProxy(`${CONFIG.baseUrl}${jsPath}`);
        const jsContent = await jsResponse.text();

        for (const pattern of patterns) {
          const match = jsContent.match(pattern);
          if (match) {
            console.log('Found Firebase API Key in JS file');
            return match[1];
          }
        }
      } catch (e) {
        continue;
      }
    }
  }

  return null;
}

// Firebaseでログイン
async function firebaseLogin(apiKey, email, password) {
  console.log('Attempting Firebase authentication...');

  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const response = await fetchWithProxy(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true
    })
  });

  const data = await response.json();

  if (data.idToken) {
    console.log('Firebase login successful!');
    return data.idToken;
  } else {
    console.log('Firebase login failed:', data.error?.message || 'Unknown error');
    return null;
  }
}

// 検索ページを取得
async function fetchSearchPage(token, keyword) {
  console.log(`Fetching search results for: ${keyword}`);

  // 検索ページにアクセス
  const response = await fetchWithProxy(`${CONFIG.baseUrl}/search`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cookie': `token=${token}`
    }
  });

  const html = await response.text();
  console.log(`Search page fetched: ${html.length} bytes`);

  return html;
}

// HTMLからデータを抽出
function extractAdsFromHtml(html) {
  console.log('Parsing HTML and extracting ad data...');

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const ads = [];

  // 様々なセレクタでカード要素を探す
  const selectors = [
    '[class*="card"]',
    '[class*="item"]',
    '[class*="result"]',
    '[class*="video"]',
    '[class*="ad"]',
    'article',
    'tr'
  ];

  const processedElements = new Set();

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
      if (processedElements.has(el)) return;
      processedElements.add(el);

      const text = el.textContent || '';
      const links = Array.from(el.querySelectorAll('a')).map(a => a.href);
      const images = Array.from(el.querySelectorAll('img')).map(img => img.src);

      if (text.length > 30 || links.length > 0 || images.length > 0) {
        // メトリクス抽出
        const viewMatch = text.match(/(\d+[,\d]*)\s*(再生|回|views?)/i);
        const likeMatch = text.match(/(\d+[,\d]*)\s*(いいね|like|♡)/i);
        const increaseMatch = text.match(/[+＋]\s*(\d+[,\d]*)/);

        const videoUrl = links.find(l => l && (l.includes('youtube') || l.includes('tiktok'))) || '';
        const lpUrl = links.find(l => l && !l.includes('dpro.kashika') && (l.includes('lp') || l.includes('http'))) || '';

        ads.push({
          videoUrl,
          imageUrl: images[0] || '',
          views: viewMatch ? viewMatch[1] : '',
          recentIncrease: increaseMatch ? increaseMatch[1] : '',
          likes: likeMatch ? likeMatch[1] : '',
          adText: text.substring(0, 500).replace(/\s+/g, ' ').trim(),
          lpUrl,
          lpText: ''
        });
      }
    });
  }

  // 重複を除去
  const uniqueAds = ads.filter((ad, index, self) =>
    index === self.findIndex(a => a.adText === ad.adText)
  );

  return uniqueAds.slice(0, 50);
}

// Excelエクスポート
function exportToExcel(data) {
  console.log('Exporting to Excel...');

  const wsData = [
    ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
  ];

  for (const ad of data) {
    wsData.push([
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

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 60 }, { wch: 60 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 80 }, { wch: 60 }, { wch: 80 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, '広告データ');
  XLSX.writeFile(wb, CONFIG.outputFile);

  console.log(`Excel saved: ${CONFIG.outputFile}`);
}

// メイン処理
async function main() {
  console.log('========================================');
  console.log('動画広告分析Pro スクレイパー (fetch版)');
  console.log('========================================');

  let collectedAds = [];

  try {
    // 1. Firebase API Keyを取得
    const apiKey = await getFirebaseConfig();

    if (apiKey) {
      console.log('Firebase API Key found');

      // 2. ログイン
      const token = await firebaseLogin(apiKey, CONFIG.email, CONFIG.password);

      if (token) {
        // 3. 検索ページを取得
        const searchHtml = await fetchSearchPage(token, CONFIG.searchKeyword);

        // 4. データ抽出
        collectedAds = extractAdsFromHtml(searchHtml);
        console.log(`Extracted ${collectedAds.length} ads`);
      }
    } else {
      console.log('Firebase API Key not found, trying direct page fetch...');

      // 直接ページを取得してみる
      const response = await fetchWithProxy(`${CONFIG.baseUrl}/search`);
      const html = await response.text();
      collectedAds = extractAdsFromHtml(html);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }

  // 結果をエクスポート
  if (collectedAds.length > 0) {
    exportToExcel(collectedAds);
  } else {
    console.log('No ads collected, creating empty file...');
    exportToExcel([]);
  }

  console.log('========================================');
  console.log(`Total ads collected: ${collectedAds.length}`);
  console.log('========================================');
}

main().catch(console.error);
