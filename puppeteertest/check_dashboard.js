import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.toString());
  });

  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Dashboard loaded');
  } catch (err) {
    console.log('Navigation error:', err);
  }

  await browser.close();
})();
