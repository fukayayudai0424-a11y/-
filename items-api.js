/**
 * /api/v1/items APIを徹底的に試す
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

const proxyUrl = process.env.HTTPS_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

function log(msg) {
  console.log('[' + new Date().toISOString().slice(11, 19) + '] ' + msg);
}

async function firebaseLogin() {
  log('Firebase認証中...');
  const authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + CONFIG.firebaseApiKey;

  const resp = await fetch(authUrl, {
    agent,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: CONFIG.email,
      password: CONFIG.password,
      returnSecureToken: true
    })
  });

  const data = await resp.json();
  log('認証成功: ' + data.email);
  return data.idToken;
}

async function tryItemsApi(token) {
  const collectedData = [];

  // /api/v1/items の様々なバリエーションを試す
  const endpoints = [
    '/api/v1/items',
    '/api/v1/items?limit=100',
    '/api/v1/items?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
    '/api/v1/items?search=' + encodeURIComponent(CONFIG.searchKeyword),
    '/api/v1/items?q=' + encodeURIComponent(CONFIG.searchKeyword),
    '/api/v1/items/search',
    '/api/v1/items/list',
    '/api/v1/items/all',
    // 他の可能性
    '/api/v1/videos/items',
    '/api/v1/ads/items',
    '/api/v1/creatives/items',
    '/api/v1/tiktok/items',
    '/api/v1/youtube/items',
  ];

  for (const endpoint of endpoints) {
    log('試行: ' + endpoint);

    // GET
    try {
      const resp = await fetch(CONFIG.baseUrl + endpoint, {
        agent,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const contentType = resp.headers.get('content-type') || '';
      log('  Status: ' + resp.status + ', Content-Type: ' + contentType.substring(0, 30));

      if (contentType.includes('json')) {
        const data = await resp.json();
        log('  Response: ' + JSON.stringify(data).substring(0, 300));

        // データを抽出
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data.items) items = data.items;
        else if (data.data) items = data.data;
        else if (data.results) items = data.results;
        else if (data.list) items = data.list;

        if (items.length > 0) {
          log('  *** ' + items.length + ' 件のデータ発見！ ***');
          items.forEach(function(item) {
            collectedData.push(item);
          });
        }
      }
    } catch (e) {
      log('  GET エラー: ' + e.message);
    }

    // POST
    try {
      const resp = await fetch(CONFIG.baseUrl + endpoint, {
        agent,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: CONFIG.searchKeyword,
          search: CONFIG.searchKeyword,
          query: CONFIG.searchKeyword,
          limit: 100
        })
      });

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await resp.json();
        if (data && Object.keys(data).length > 0 && !data.error) {
          log('  POST Response: ' + JSON.stringify(data).substring(0, 300));

          let items = [];
          if (Array.isArray(data)) items = data;
          else if (data.items) items = data.items;
          else if (data.data) items = data.data;

          if (items.length > 0) {
            log('  *** POST: ' + items.length + ' 件のデータ発見！ ***');
            items.forEach(function(item) {
              collectedData.push(item);
            });
          }
        }
      }
    } catch (e) {
      // POSTエラーは無視
    }
  }

  return collectedData;
}

async function main() {
  log('========================================');
  log('Items API スクレイパー');
  log('========================================');

  try {
    const token = await firebaseLogin();
    const data = await tryItemsApi(token);

    log('\n総収集データ: ' + data.length + ' 件');

    // Excel出力
    const wsData = [
      ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
    ];

    data.forEach(function(item) {
      wsData.push([
        item.video_url || item.videoUrl || item.url || '',
        item.image_url || item.imageUrl || item.thumbnail || '',
        String(item.views || item.view_count || item.play_count || ''),
        String(item.increase || item.daily_increase || ''),
        String(item.likes || item.like_count || ''),
        (item.text || item.description || item.title || item.name || '').substring(0, 500),
        item.lp_url || item.lpUrl || item.landing_page || '',
        item.lp_text || ''
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 60 }, { wch: 60 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 80 }, { wch: 60 }, { wch: 80 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, '広告データ');
    XLSX.writeFile(wb, CONFIG.outputFile);

    log('Excel保存: ' + CONFIG.outputFile);

  } catch (error) {
    log('エラー: ' + error.message);
    console.error(error);
  }

  log('========================================');
}

main();
