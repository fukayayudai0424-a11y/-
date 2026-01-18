/**
 * Firebase SDK を使用した直接アクセス
 */

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const XLSX = require('xlsx');

// グローバルfetchを設定（Firebase SDKで使用）
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

global.fetch = function(url, opts) {
  return fetch(url, { ...opts, agent });
};

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

const CONFIG = {
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9',
  outputFile: 'ad_data.xlsx'
};

const firebaseConfig = {
  apiKey: 'AIzaSyACvJBtwGAk7ZHKzNhWiRY4_g-q0oF8VGQ',
  authDomain: 'dpro-c8874.firebaseapp.com',
  projectId: 'dpro-c8874',
  storageBucket: 'dpro-c8874.appspot.com'
};

function log(msg) {
  console.log('[' + new Date().toISOString().slice(11,19) + '] ' + msg);
}

async function main() {
  log('========================================');
  log('Firebase直接アクセス スクレイパー');
  log('========================================');

  try {
    // Firebase初期化
    log('Firebase初期化中...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // ログイン
    log('ログイン中...');
    const userCredential = await signInWithEmailAndPassword(auth, CONFIG.email, CONFIG.password);
    log('ログイン成功: ' + userCredential.user.email);

    // ユーザーID
    const userId = userCredential.user.uid;
    log('ユーザーID: ' + userId);

    // コレクション一覧を試す
    const possibleCollections = [
      'team', 'user', 'video', 'search', 'content',
      'Team', 'User', 'Video', 'Search', 'Content',
      'teams', 'users', 'videos', 'searches', 'contents',
      'Teams', 'Users', 'Videos', 'Searches', 'Contents',
      'ads', 'creatives', 'campaigns', 'keywords',
      'Ads', 'Creatives', 'Campaigns', 'Keywords',
      'tiktok', 'youtube', 'instagram', 'facebook',
      'TikTok', 'YouTube', 'Instagram', 'Facebook',
      'tiktok_ads', 'youtube_ads', 'ad_data', 'ad_creatives'
    ];

    // ユーザー固有のコレクションも試す
    const userCollections = possibleCollections.map(function(c) {
      return 'users/' + userId + '/' + c;
    });

    const allCollections = possibleCollections.concat(userCollections);
    const allData = [];

    for (var i = 0; i < allCollections.length; i++) {
      var collName = allCollections[i];
      try {
        log('コレクション取得中: ' + collName);
        var q = query(collection(db, collName), limit(50));
        var snapshot = await getDocs(q);

        if (!snapshot.empty) {
          log('  -> ' + snapshot.size + ' ドキュメント発見！');

          snapshot.forEach(function(doc) {
            var data = doc.data();
            allData.push({
              collection: collName,
              id: doc.id,
              ...data
            });
          });
        }
      } catch (e) {
        // アクセス権がないか存在しない
        continue;
      }
    }

    log('総データ件数: ' + allData.length);

    // Excel出力
    if (allData.length > 0) {
      log('Excelにエクスポート中...');

      const wsData = [
        ['コレクション', 'ID', '動画URL', '画像URL', '再生数', 'いいね数', 'テキスト', 'LP URL']
      ];

      for (var i = 0; i < allData.length; i++) {
        var item = allData[i];
        wsData.push([
          item.collection || '',
          item.id || '',
          item.videoUrl || item.video_url || item.url || '',
          item.imageUrl || item.image_url || item.thumbnail || '',
          String(item.views || item.view_count || ''),
          String(item.likes || item.like_count || ''),
          (item.text || item.description || item.title || '').substring(0, 200),
          item.lpUrl || item.lp_url || item.landing_page || ''
        ]);
      }

      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, '広告データ');
      XLSX.writeFile(wb, CONFIG.outputFile);
      log('Excel保存完了: ' + CONFIG.outputFile);
    } else {
      log('データが見つかりませんでした');

      // 空のExcelを作成
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet([
        ['動画広告URL', '画像広告URL', '再生数', '直近の増加数', 'いいね数', '広告テキスト', 'LP URL', 'LPの文']
      ]);
      XLSX.utils.book_append_sheet(wb, ws, '広告データ');
      XLSX.writeFile(wb, CONFIG.outputFile);
      log('空のExcel作成: ' + CONFIG.outputFile);
    }

  } catch (error) {
    log('エラー: ' + error.message);
    console.error(error);
  }

  log('========================================');
}

main();
