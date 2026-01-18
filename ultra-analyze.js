/**
 * 超詳細JS解析 - すべてのAPIパターンを抽出
 */

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

async function fetchWithProxy(url) {
  return fetch(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' } });
}

async function main() {
  const baseUrl = 'https://dpro.kashika-20mile.com';

  console.log('全JSファイルを取得・解析中...\n');

  // ページ取得
  const pages = ['/login', '/search', '/'];
  let allJsFiles = new Set();

  for (const page of pages) {
    try {
      const resp = await fetchWithProxy(baseUrl + page);
      const html = await resp.text();
      const jsFiles = html.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [];
      jsFiles.forEach(f => allJsFiles.add(f));
    } catch (e) {}
  }

  console.log('JSファイル数: ' + allJsFiles.size + '\n');

  // 全JSの内容を結合
  let allJs = '';
  for (const jsPath of allJsFiles) {
    try {
      const resp = await fetchWithProxy(baseUrl + jsPath);
      allJs += await resp.text() + '\n';
    } catch (e) {}
  }

  console.log('総JSサイズ: ' + (allJs.length / 1024).toFixed(0) + ' KB\n');

  // パターン検索
  const patterns = [
    // Firestore
    { name: 'Firestoreコレクション', regex: /collection\s*\(\s*\w+\s*,\s*["']([^"']+)["']\s*\)/g },
    { name: 'Firestoreドキュメント', regex: /doc\s*\(\s*\w+\s*,\s*["']([^"']+)["']/g },
    { name: 'Firestoreクエリ', regex: /where\s*\(\s*["']([^"']+)["']/g },

    // Firebase Functions
    { name: 'Cloud Functions', regex: /httpsCallable\s*\(\s*\w+\s*,\s*["']([^"']+)["']/g },
    { name: 'Functions URL', regex: /functions[^"']*["']([^"']+)["']/gi },

    // API endpoints
    { name: 'API パス', regex: /["'](\/api\/[^"']+)["']/g },
    { name: 'HTTP URL', regex: /["'](https?:\/\/[^"'\s]+)["']/g },

    // データ構造
    { name: 'オブジェクトキー videoUrl等', regex: /[{,]\s*(videoUrl|video_url|imageUrl|image_url|lpUrl|lp_url|views|likes|playCount)\s*:/gi },
    { name: 'TikTok/YouTube参照', regex: /["'](tiktok|youtube|instagram)[^"']*["']/gi },

    // Realtime Database
    { name: 'Realtime DB ref', regex: /ref\s*\(\s*\w+\s*,\s*["']([^"']+)["']/g },
    { name: 'Database URL', regex: /databaseURL\s*:\s*["']([^"']+)["']/g },
  ];

  const results = {};

  for (const p of patterns) {
    const matches = [];
    let match;
    while ((match = p.regex.exec(allJs)) !== null) {
      matches.push(match[1]);
    }
    if (matches.length > 0) {
      results[p.name] = [...new Set(matches)];
    }
  }

  // 結果表示
  for (const [name, values] of Object.entries(results)) {
    console.log('=== ' + name + ' ===');
    values.slice(0, 30).forEach(v => console.log('  ' + v));
    if (values.length > 30) console.log('  ... and ' + (values.length - 30) + ' more');
    console.log('');
  }

  // 特別な検索：firebaseやfirestoreの設定
  console.log('=== Firebase設定 ===');
  const firebaseConfigMatch = allJs.match(/\{[^}]*apiKey[^}]*projectId[^}]*\}/);
  if (firebaseConfigMatch) {
    console.log(firebaseConfigMatch[0].substring(0, 500));
  }

  // getDocやgetDocsの使われ方
  console.log('\n=== getDoc/getDocs使用箇所 ===');
  const getDocMatches = allJs.match(/getDoc[s]?\s*\([^)]+\)/g);
  if (getDocMatches) {
    [...new Set(getDocMatches)].slice(0, 20).forEach(m => console.log('  ' + m));
  }

  // onSnapshot（リアルタイム監視）
  console.log('\n=== onSnapshot使用箇所 ===');
  const snapshotMatches = allJs.match(/onSnapshot\s*\([^)]+\)/g);
  if (snapshotMatches) {
    [...new Set(snapshotMatches)].slice(0, 20).forEach(m => console.log('  ' + m));
  }
}

main().catch(console.error);
