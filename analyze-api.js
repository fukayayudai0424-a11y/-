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

  // Get all JS files
  const loginPage = await fetchWithProxy(`${baseUrl}/login`);
  const html = await loginPage.text();

  const jsFiles = html.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [];
  console.log(`Found ${jsFiles.length} JS files\n`);

  // Analyze each JS file for API patterns
  for (const jsPath of jsFiles) {
    const jsResp = await fetchWithProxy(`${baseUrl}${jsPath}`);
    const js = await jsResp.text();

    // Look for various API patterns
    const patterns = {
      'Firebase collections': js.match(/collection\s*\(\s*['"]([\w-]+)['"]/g),
      'API endpoints': js.match(/["'](\/api\/[^"']+)["']/g),
      'Fetch calls': js.match(/fetch\s*\(\s*["']([^"']+)["']/g),
      'Firebase functions': js.match(/functions\.httpsCallable\s*\(\s*["']([^"']+)["']/g),
      'Firestore paths': js.match(/doc\s*\(\s*['"]([\w\/-]+)['"]/g),
    };

    let found = false;
    for (const [name, matches] of Object.entries(patterns)) {
      if (matches && matches.length > 0) {
        if (!found) {
          console.log(`\n=== ${jsPath} ===`);
          found = true;
        }
        console.log(`${name}:`, [...new Set(matches)].slice(0, 10));
      }
    }

    // Look for specific keywords
    if (js.includes('searchKeyword') || js.includes('search_keyword')) {
      console.log('Contains: searchKeyword');
    }
    if (js.includes('tiktok') || js.includes('TikTok')) {
      console.log('Contains: tiktok');
    }
    if (js.includes('youtube') || js.includes('YouTube')) {
      console.log('Contains: youtube');
    }
  }

  // Check for specific pages
  console.log('\n=== Checking specific pages ===');

  const pages = ['/search', '/api/search', '/api/ads', '/api/videos'];
  for (const page of pages) {
    try {
      const resp = await fetchWithProxy(`${baseUrl}${page}`);
      console.log(`${page}: ${resp.status} (${resp.headers.get('content-type')})`);

      if (resp.status === 200 && resp.headers.get('content-type')?.includes('json')) {
        const data = await resp.json();
        console.log('  Data keys:', Object.keys(data).slice(0, 5));
      }
    } catch (e) {
      console.log(`${page}: Error - ${e.message}`);
    }
  }
}

main().catch(console.error);
