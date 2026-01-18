/**
 * 発見したAPIエンドポイントから広告データを取得
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

function log(msg) {
  console.log('[' + new Date().toISOString().slice(11, 19) + '] ' + msg);
}

async function fetchApi(url, token) {
  const resp = await fetch(url, {
    agent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
  return resp;
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
  if (data.idToken) {
    log('認証成功: ' + data.email);
    return { token: data.idToken, userId: data.localId };
  }
  throw new Error('認証失敗');
}

async function main() {
  log('========================================');
  log('API直接アクセス スクレイパー');
  log('========================================');

  const collectedData = [];

  try {
    const auth = await firebaseLogin();
    const token = auth.token;
    const userId = auth.userId;

    // 発見したAPIエンドポイント
    const endpoints = [
      '/api/v1/advertisers/list',
      '/api/v1/genres/list',
      '/api/v1/products/list',
      '/api/v1/categories',
      '/api/v1/apps',
      '/api/v1/streaming_services',
      '/api/v1/transition_types',
      '/api/v1/transition_types/list',
      '/api/v1/account/list',
      '/api/v1/products?limit=100',
      '/api/v1/users/me',
      '/api/v1/users/' + userId + '/settings',
      '/api/v1/notifications?limit=50',
      // 検索系
      '/api/v1/search?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
      '/api/v1/videos?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
      '/api/v1/ads?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
      '/api/v1/creatives?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
      '/api/v1/tiktok/search?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
      '/api/v1/youtube/search?keyword=' + encodeURIComponent(CONFIG.searchKeyword),
    ];

    for (const endpoint of endpoints) {
      try {
        log('API: ' + endpoint);
        const resp = await fetchApi(CONFIG.baseUrl + endpoint, token);
        const contentType = resp.headers.get('content-type') || '';

        if (contentType.includes('json')) {
          const data = await resp.json();

          if (data && typeof data === 'object') {
            // データがあれば表示
            const keys = Object.keys(data);
            log('  -> キー: ' + keys.slice(0, 5).join(', '));

            // 配列データを探す
            let items = [];
            if (Array.isArray(data)) {
              items = data;
            } else if (data.data && Array.isArray(data.data)) {
              items = data.data;
            } else if (data.items && Array.isArray(data.items)) {
              items = data.items;
            } else if (data.results && Array.isArray(data.results)) {
              items = data.results;
            } else if (data.list && Array.isArray(data.list)) {
              items = data.list;
            }

            if (items.length > 0) {
              log('  -> ' + items.length + ' 件のデータ発見！');
              log('  -> サンプル: ' + JSON.stringify(items[0]).substring(0, 200));

              items.forEach(function(item) {
                collectedData.push({
                  source: endpoint,
                  videoUrl: item.video_url || item.videoUrl || item.url || item.link || '',
                  imageUrl: item.image_url || item.imageUrl || item.thumbnail || item.image || '',
                  views: String(item.views || item.view_count || item.play_count || ''),
                  likes: String(item.likes || item.like_count || ''),
                  adText: (item.text || item.description || item.title || item.name || '').substring(0, 500),
                  lpUrl: item.lp_url || item.lpUrl || item.landing_page || '',
                  raw: JSON.stringify(item).substring(0, 1000)
                });
              });
            }
          }
        } else {
          const text = await resp.text();
          if (text.length < 500 && !text.includes('<!DOCTYPE')) {
            log('  -> レスポンス: ' + text.substring(0, 100));
          }
        }
      } catch (e) {
        log('  -> エラー: ' + e.message);
      }
    }

    // POSTリクエストも試す
    log('\nPOSTリクエストを試行...');

    const postEndpoints = [
      { url: '/api/v1/search', body: { keyword: CONFIG.searchKeyword, limit: 50 } },
      { url: '/api/v1/videos/search', body: { keyword: CONFIG.searchKeyword } },
      { url: '/api/v1/ads/search', body: { query: CONFIG.searchKeyword } },
      { url: '/api/v1/creatives/search', body: { keyword: CONFIG.searchKeyword } },
    ];

    for (const ep of postEndpoints) {
      try {
        log('POST: ' + ep.url);
        const resp = await fetch(CONFIG.baseUrl + ep.url, {
          agent,
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ep.body)
        });

        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          const data = await resp.json();
          if (data && Object.keys(data).length > 0) {
            log('  -> データあり: ' + JSON.stringify(data).substring(0, 200));
          }
        }
      } catch (e) {
        log('  -> エラー: ' + e.message);
      }
    }

  } catch (error) {
    log('エラー: ' + error.message);
  }

  // Excel出力
  log('\n総収集データ: ' + collectedData.length + ' 件');

  const wsData = [
    ['ソース', '動画広告URL', '画像広告URL', '再生数', 'いいね数', '広告テキスト', 'LP URL', '生データ']
  ];

  collectedData.forEach(function(item) {
    wsData.push([
      item.source,
      item.videoUrl,
      item.imageUrl,
      item.views,
      item.likes,
      item.adText,
      item.lpUrl,
      item.raw
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 30 }, { wch: 50 }, { wch: 50 }, { wch: 15 },
    { wch: 15 }, { wch: 60 }, { wch: 50 }, { wch: 100 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, '広告データ');
  XLSX.writeFile(wb, CONFIG.outputFile);

  log('Excel保存: ' + CONFIG.outputFile);
  log('========================================');
}

main().catch(console.error);
