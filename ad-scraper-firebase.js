/**
 * 動画広告分析Pro - Firebase Firestore ベースのスクレイパー
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
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

// Firebase認証
async function firebaseLogin() {
  console.log('Firebase認証中...');

  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${CONFIG.firebaseApiKey}`;

  const response = await fetchWithProxy(authUrl, {
    method: 'POST',
    body: JSON.stringify({
      email: CONFIG.email,
      password: CONFIG.password,
      returnSecureToken: true
    })
  });

  const data = await response.json();

  if (data.idToken) {
    console.log('認証成功！ユーザーID:', data.localId);
    return {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      userId: data.localId
    };
  }

  throw new Error('Authentication failed: ' + (data.error?.message || 'Unknown'));
}

// Firebase projectId を取得
async function getFirebaseProjectId() {
  // JSファイルからprojectIdを探す
  const loginPage = await fetchWithProxy(`${CONFIG.baseUrl}/login`);
  const html = await loginPage.text();

  const jsFiles = html.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [];

  for (const jsPath of jsFiles) {
    const jsResp = await fetchWithProxy(`${CONFIG.baseUrl}${jsPath}`);
    const js = await jsResp.text();

    // projectId パターン
    const projectMatch = js.match(/projectId['":\s]+['"]([^'"]+)['"]/);
    if (projectMatch) {
      return projectMatch[1];
    }
  }

  return null;
}

// Firestore REST API でデータ取得
async function queryFirestore(auth, projectId, collection, filters = {}) {
  console.log(`Firestore クエリ: ${collection}`);

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;

  const response = await fetchWithProxy(firestoreUrl, {
    headers: {
      'Authorization': `Bearer ${auth.idToken}`
    }
  });

  const data = await response.json();

  if (data.documents) {
    console.log(`${data.documents.length} ドキュメント取得`);
    return data.documents;
  }

  return [];
}

// Firestoreドキュメントをパース
function parseFirestoreDocument(doc) {
  const fields = doc.fields || {};
  const result = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
    } else if (value.integerValue !== undefined) {
      result[key] = parseInt(value.integerValue);
    } else if (value.doubleValue !== undefined) {
      result[key] = value.doubleValue;
    } else if (value.booleanValue !== undefined) {
      result[key] = value.booleanValue;
    } else if (value.arrayValue !== undefined) {
      result[key] = value.arrayValue.values || [];
    } else if (value.mapValue !== undefined) {
      result[key] = value.mapValue.fields || {};
    }
  }

  return result;
}

// 複数のコレクションを試す
async function tryCollections(auth, projectId) {
  const possibleCollections = [
    'ads',
    'videos',
    'advertisements',
    'creatives',
    'campaigns',
    'video_ads',
    'ad_data',
    'contents',
    'media',
    'tiktok_ads',
    'youtube_ads',
    'search_results'
  ];

  const allData = [];

  for (const collection of possibleCollections) {
    try {
      const docs = await queryFirestore(auth, projectId, collection);
      if (docs.length > 0) {
        console.log(`  → ${collection}: ${docs.length}件のデータ`);
        for (const doc of docs) {
          allData.push({
            collection,
            ...parseFirestoreDocument(doc)
          });
        }
      }
    } catch (e) {
      // コレクションが存在しないか、アクセス権がない
      continue;
    }
  }

  return allData;
}

// データをExcel形式に変換
function convertToAdFormat(data) {
  return data.map(item => ({
    videoUrl: item.videoUrl || item.video_url || item.url || item.link || '',
    imageUrl: item.imageUrl || item.image_url || item.thumbnail || item.thumb || '',
    views: item.views || item.view_count || item.playCount || '',
    recentIncrease: item.increase || item.daily_increase || item.recentIncrease || '',
    likes: item.likes || item.like_count || item.likeCount || '',
    adText: item.text || item.description || item.caption || item.title || '',
    lpUrl: item.lpUrl || item.lp_url || item.landing_page || item.landingUrl || '',
    lpText: item.lpText || item.lp_text || ''
  }));
}

// Excelエクスポート
function exportToExcel(data) {
  console.log('Excelにエクスポート中...');

  const wsData = [
    ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
  ];

  for (const ad of data) {
    wsData.push([
      ad.videoUrl || '',
      ad.imageUrl || '',
      String(ad.views || ''),
      String(ad.recentIncrease || ''),
      String(ad.likes || ''),
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

  console.log(`Excel保存完了: ${CONFIG.outputFile}`);
}

// メイン
async function main() {
  console.log('========================================');
  console.log('動画広告分析Pro スクレイパー (Firebase版)');
  console.log('========================================');
  console.log(`検索キーワード: ${CONFIG.searchKeyword}`);

  try {
    // 1. 認証
    const auth = await firebaseLogin();

    // 2. プロジェクトID取得
    console.log('Firebase プロジェクトID を取得中...');
    const projectId = await getFirebaseProjectId();
    console.log('プロジェクトID:', projectId);

    if (!projectId) {
      throw new Error('Project ID not found');
    }

    // 3. データ取得
    console.log('Firestoreからデータを取得中...');
    const rawData = await tryCollections(auth, projectId);

    // 4. フォーマット変換
    const ads = convertToAdFormat(rawData);
    console.log(`総データ件数: ${ads.length}`);

    // 5. Excel出力
    exportToExcel(ads);

  } catch (error) {
    console.error('エラー:', error.message);

    // エラーでも空のExcelを作成
    exportToExcel([]);
  }

  console.log('========================================');
}

main().catch(console.error);
