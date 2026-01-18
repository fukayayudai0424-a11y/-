const { chromium } = require('playwright');

async function test() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  console.log('Raw Proxy URL length:', proxyUrl ? proxyUrl.length : 0);

  // プロキシURLをパース
  const proxyMatch = proxyUrl.match(/http:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
  if (proxyMatch) {
    console.log('Proxy host:', proxyMatch[3]);
    console.log('Proxy port:', proxyMatch[4]);

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await browser.newContext({
      proxy: {
        server: `http://${proxyMatch[3]}:${proxyMatch[4]}`,
        username: proxyMatch[1],
        password: proxyMatch[2]
      },
      ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    try {
      console.log('Navigating to login page...');
      await page.goto('https://dpro.kashika-20mile.com/login', {
        timeout: 60000,
        waitUntil: 'domcontentloaded'
      });
      console.log('SUCCESS! Page loaded');
      console.log('Title:', await page.title());
      console.log('URL:', page.url());
    } catch (e) {
      console.error('Navigation error:', e.message);
    }

    await browser.close();
  } else {
    console.log('Could not parse proxy URL');
  }
}

test();
