const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const CONFIG = {
  baseUrl: 'https://dpro.kashika-20mile.com',
  email: 'admin@hoshi-gumi.jp',
  password: 'yakini9'
};

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

async function fetchWithProxy(url, options = {}) {
  return fetch(url, {
    ...options,
    agent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options.headers
    }
  });
}

async function main() {
  // Get Firebase API Key
  const loginPage = await fetchWithProxy(`${CONFIG.baseUrl}/login`);
  const loginHtml = await loginPage.text();

  const jsFiles = loginHtml.match(/\/_next\/static\/chunks\/[^"]+\.js/g) || [];
  let apiKey = null;

  for (const jsPath of jsFiles) {
    const jsResp = await fetchWithProxy(`${CONFIG.baseUrl}${jsPath}`);
    const jsContent = await jsResp.text();
    const match = jsContent.match(/apiKey['":\s]+['"]([^'"]+)['"]/);
    if (match) {
      apiKey = match[1];
      break;
    }
  }

  console.log('API Key:', apiKey);

  // Login
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const authResp = await fetchWithProxy(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: CONFIG.email,
      password: CONFIG.password,
      returnSecureToken: true
    })
  });
  const authData = await authResp.json();
  console.log('Login successful:', !!authData.idToken);
  console.log('User ID:', authData.localId);

  // Check what APIs are available
  console.log('\n--- Checking various endpoints ---\n');

  // Try search page
  const searchResp = await fetchWithProxy(`${CONFIG.baseUrl}/search`, {
    headers: { 'Authorization': `Bearer ${authData.idToken}` }
  });
  const searchHtml = await searchResp.text();
  console.log('Search page HTML (first 2000 chars):');
  console.log(searchHtml.substring(0, 2000));

  // Look for API endpoints in the JS
  console.log('\n--- Looking for API endpoints ---\n');
  for (const jsPath of jsFiles.slice(0, 3)) {
    const jsResp = await fetchWithProxy(`${CONFIG.baseUrl}${jsPath}`);
    const jsContent = await jsResp.text();

    // Find API patterns
    const apiPatterns = jsContent.match(/["'](\/api\/[^"']+)["']/g);
    if (apiPatterns) {
      console.log(`Found in ${jsPath}:`, [...new Set(apiPatterns)].slice(0, 10));
    }

    const firebasePatterns = jsContent.match(/firestore|firebase|collection|document/gi);
    if (firebasePatterns) {
      console.log('Firebase/Firestore patterns found:', [...new Set(firebasePatterns)].length);
    }
  }
}

main().catch(console.error);
