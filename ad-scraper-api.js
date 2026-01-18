/**
 * 動画広告分析Pro - API v1 ベースのスクレイパー
 */

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const XLSX = require('xlsx');

const CONFIG = {
  baseUrl: 'https://dpro.kashika-20mile.com',
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9',
  searchKeyword: '類似キーワード',
  outputFile: 'ad_data.xlsx',
  firebaseApiKey: 'AIzaSyACvJBtwGAk7ZHKzNhWiRY4_g-q0oF8VGQ'
};

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

async function fetchWithProxy(url, options = {}) {
  return fetch(url, {
    ...options,
    agent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ja,en-US;q=0.9',
      ...options.headers
    }
  });
}

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

// Firebase認証
async function firebaseLogin() {
  log('Firebase認証中...');

  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${CONFIG.firebaseApiKey}`;

  const response = await fetchWithProxy(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: CONFIG.email,
      password: CONFIG.password,
      returnSecureToken: true
    })
  });

  const data = await response.json();

  if (data.idToken) {
    log(`認証成功！ユーザー: ${data.email}`);
    return data.idToken;
  }

  throw new Error('認証失敗: ' + (data.error?.message || 'Unknown'));
}

// ユーザー情報取得
async function getUserInfo(token) {
  log('ユーザー情報を取得中...');

  const response = await fetchWithProxy(`${CONFIG.baseUrl}/api/v1/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const text = await response.text();
  log(`/api/v1/users/me レスポンス: ${text.substring(0, 200)}`);

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// 様々なAPIエンドポイントを試す
async function tryApiEndpoints(token) {
  log('APIエンドポイントを探索中...');

  const endpoints = [
    '/api/v1/ads',
    '/api/v1/videos',
    '/api/v1/search',
    '/api/v1/creatives',
    '/api/v1/campaigns',
    '/api/v1/tiktok/ads',
    '/api/v1/youtube/ads',
    '/api/v1/contents',
    '/api/v1/keywords',
    '/api/search',
    '/api/ads',
    '/api/videos',
    `/api/v1/search?keyword=${encodeURIComponent(CONFIG.searchKeyword)}`,
    `/api/v1/ads?keyword=${encodeURIComponent(CONFIG.searchKeyword)}`
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithProxy(`${CONFIG.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('json')) {
        const data = await response.json();
        if (data && (Array.isArray(data) || (data.data && Array.isArray(data.data)) || Object.keys(data).length > 0)) {
          log(`✓ ${endpoint}: データあり`);
          results.push({ endpoint, data });
        }
      } else if (response.status === 200) {
        const text = await response.text();
        if (text.length < 5000 && !text.includes('<!DOCTYPE')) {
          log(`✓ ${endpoint}: ${text.substring(0, 100)}`);
        }
      }
    } catch (e) {
      // エンドポイントが存在しない
      continue;
    }
  }

  return results;
}

// POSTリクエストで検索
async function searchWithPost(token) {
  log('POST検索を試行中...');

  const searchEndpoints = [
    { url: '/api/v1/search', body: { keyword: CONFIG.searchKeyword } },
    { url: '/api/v1/ads/search', body: { keyword: CONFIG.searchKeyword } },
    { url: '/api/v1/videos/search', body: { query: CONFIG.searchKeyword } },
    { url: '/api/search', body: { q: CONFIG.searchKeyword } }
  ];

  for (const { url, body } of searchEndpoints) {
    try {
      const response = await fetchWithProxy(`${CONFIG.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('json')) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          log(`✓ POST ${url}: データあり`);
          return data;
        }
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

// データを広告形式に変換
function convertToAds(rawData) {
  if (!rawData) return [];

  let items = [];

  if (Array.isArray(rawData)) {
    items = rawData;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    items = rawData.data;
  } else if (rawData.items && Array.isArray(rawData.items)) {
    items = rawData.items;
  } else if (rawData.results && Array.isArray(rawData.results)) {
    items = rawData.results;
  }

  return items.map(item => ({
    videoUrl: item.videoUrl || item.video_url || item.url || item.link || '',
    imageUrl: item.imageUrl || item.image_url || item.thumbnail || item.thumb || item.image || '',
    views: String(item.views || item.view_count || item.playCount || item.play_count || ''),
    recentIncrease: String(item.increase || item.daily_increase || item.recentIncrease || ''),
    likes: String(item.likes || item.like_count || item.likeCount || ''),
    adText: item.text || item.description || item.caption || item.title || item.ad_text || '',
    lpUrl: item.lpUrl || item.lp_url || item.landing_page || item.landingUrl || '',
    lpText: item.lpText || item.lp_text || item.lp_content || ''
  }));
}

// Excelエクスポート
function exportToExcel(data) {
  log(`Excelにエクスポート中... (${data.length}件)`);

  const wsData = [
    ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
  ];

  for (const ad of data) {
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
}

// メイン
async function main() {
  console.log('========================================');
  console.log('動画広告分析Pro スクレイパー (API版)');
  console.log('========================================');

  let allAds = [];

  try {
    // 1. 認証
    const token = await firebaseLogin();

    // 2. ユーザー情報確認
    const userInfo = await getUserInfo(token);
    if (userInfo) {
      log(`ユーザー情報: ${JSON.stringify(userInfo).substring(0, 100)}`);
    }

    // 3. APIエンドポイント探索
    const apiResults = await tryApiEndpoints(token);

    for (const result of apiResults) {
      const ads = convertToAds(result.data);
      if (ads.length > 0) {
        log(`${result.endpoint} から ${ads.length} 件のデータを取得`);
        allAds.push(...ads);
      }
    }

    // 4. POST検索も試す
    const searchResult = await searchWithPost(token);
    if (searchResult) {
      const ads = convertToAds(searchResult);
      if (ads.length > 0) {
        log(`POST検索から ${ads.length} 件のデータを取得`);
        allAds.push(...ads);
      }
    }

  } catch (error) {
    console.error('エラー:', error.message);
  }

  // 5. Excel出力
  log(`総データ件数: ${allAds.length}`);
  exportToExcel(allAds);

  console.log('========================================');
}

main().catch(console.error);
