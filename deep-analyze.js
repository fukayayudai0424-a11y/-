/**
 * サイトのJavaScriptを詳細解析してFirestoreコレクション名を特定
 */

const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

async function fetchWithProxy(url) {
  return fetch(url, {
    agent,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
}

async function main() {
  const baseUrl = 'https://dpro.kashika-20mile.com';

  console.log('ページを取得中...');
  const loginPage = await fetchWithProxy(baseUrl + '/login');
  const html = await loginPage.text();

  // すべてのJSファイルを取得
  const jsFiles = html.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [];
  console.log('JSファイル数: ' + jsFiles.length);

  const allPatterns = {
    collections: new Set(),
    documents: new Set(),
    queries: new Set(),
    functions: new Set()
  };

  for (var i = 0; i < jsFiles.length; i++) {
    var jsPath = jsFiles[i];
    try {
      var jsResp = await fetchWithProxy(baseUrl + jsPath);
      var js = await jsResp.text();

      // Firestoreコレクション参照
      var collMatches = js.match(/collection\s*\(\s*\w+\s*,\s*["']([^"']+)["']/g);
      if (collMatches) {
        collMatches.forEach(function(m) {
          var name = m.match(/["']([^"']+)["']/);
          if (name) allPatterns.collections.add(name[1]);
        });
      }

      // doc参照
      var docMatches = js.match(/doc\s*\(\s*\w+\s*,\s*["']([^"']+)["']/g);
      if (docMatches) {
        docMatches.forEach(function(m) {
          var name = m.match(/["']([^"']+)["']/);
          if (name) allPatterns.documents.add(name[1]);
        });
      }

      // where/queryクエリ
      var queryMatches = js.match(/where\s*\(\s*["']([^"']+)["']/g);
      if (queryMatches) {
        queryMatches.forEach(function(m) {
          var name = m.match(/["']([^"']+)["']/);
          if (name) allPatterns.queries.add(name[1]);
        });
      }

      // Cloud Functions
      var funcMatches = js.match(/httpsCallable\s*\(\s*\w+\s*,\s*["']([^"']+)["']/g);
      if (funcMatches) {
        funcMatches.forEach(function(m) {
          var name = m.match(/["']([^"']+)["']/);
          if (name) allPatterns.functions.add(name[1]);
        });
      }

      // 文字列リテラルからコレクション名の候補
      var stringLiterals = js.match(/["']([a-zA-Z_][a-zA-Z0-9_]{2,30})["']/g);
      if (stringLiterals) {
        stringLiterals.forEach(function(s) {
          var str = s.slice(1, -1);
          // コレクション名っぽいもの
          if (str.match(/^(ad|video|creative|content|keyword|search|tiktok|youtube|instagram|facebook|campaign|user|team)/i)) {
            allPatterns.collections.add(str);
          }
        });
      }

    } catch (e) {
      continue;
    }
  }

  console.log('\n=== 発見したパターン ===\n');

  console.log('コレクション候補:');
  Array.from(allPatterns.collections).sort().forEach(function(c) {
    console.log('  - ' + c);
  });

  console.log('\nドキュメントパス:');
  Array.from(allPatterns.documents).sort().forEach(function(d) {
    console.log('  - ' + d);
  });

  console.log('\nクエリフィールド:');
  Array.from(allPatterns.queries).sort().forEach(function(q) {
    console.log('  - ' + q);
  });

  console.log('\nCloud Functions:');
  Array.from(allPatterns.functions).sort().forEach(function(f) {
    console.log('  - ' + f);
  });
}

main().catch(console.error);
