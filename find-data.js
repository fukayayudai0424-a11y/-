const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = process.env.HTTPS_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

async function main() {
  const baseUrl = 'https://dpro.kashika-20mile.com';

  // すべてのページのJSを取得
  const pages = ['/', '/search', '/login'];
  const allJs = [];

  for (const page of pages) {
    const resp = await fetch(baseUrl + page, { agent });
    const html = await resp.text();

    const jsFiles = html.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [];
    for (const jsPath of jsFiles) {
      if (!allJs.includes(jsPath)) {
        allJs.push(jsPath);
      }
    }
  }

  console.log('Total JS files:', allJs.length);

  // searchページ関連のJSを優先的に解析
  const searchJs = allJs.filter(f => f.includes('search') || f.includes('pages'));
  console.log('Search-related JS:', searchJs.length);

  for (const jsPath of searchJs) {
    const resp = await fetch(baseUrl + jsPath, { agent });
    const js = await resp.text();

    console.log('\n=== ' + jsPath.split('/').pop() + ' ===');

    // データ取得パターンを探す
    // GraphQL
    if (js.includes('graphql') || js.includes('GraphQL')) {
      console.log('GraphQL detected!');
      const gqlPatterns = js.match(/gql`[^`]+`/g);
      if (gqlPatterns) gqlPatterns.slice(0, 5).forEach(g => console.log('  ' + g.substring(0, 100)));
    }

    // Firestore collection参照（より詳細）
    const collectionRefs = js.match(/collection\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*,\s*["'][^"']+["']/g);
    if (collectionRefs) {
      console.log('Firestore collections:');
      [...new Set(collectionRefs)].forEach(c => console.log('  ' + c));
    }

    // APIパス
    const apiPaths = js.match(/["']\/api\/v1\/[^"']+["']/g);
    if (apiPaths && apiPaths.length > 0) {
      console.log('API paths:');
      [...new Set(apiPaths)].slice(0, 10).forEach(p => console.log('  ' + p));
    }

    // 興味深い関数名
    const interestingFuncs = js.match(/\b(searchAds|fetchVideos|getCreatives|loadData|fetchData|searchVideos|getTikTok|getYouTube|getAds)\s*[=(]/gi);
    if (interestingFuncs) {
      console.log('Interesting functions:');
      [...new Set(interestingFuncs)].forEach(f => console.log('  ' + f));
    }

    // axiosやfetchの使用
    const httpCalls = js.match(/(axios|fetch)\s*\.\s*(get|post|put)\s*\([^)]+\)/gi);
    if (httpCalls) {
      console.log('HTTP calls:');
      [...new Set(httpCalls)].slice(0, 10).forEach(h => console.log('  ' + h));
    }
  }
}

main().catch(console.error);
