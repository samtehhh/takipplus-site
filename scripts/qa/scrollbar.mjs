// Kaydırma çubuğunu gerçek (görünür modlu, ekran dışı) Chrome ile çeker; başlıksız mod çubuğu çizmez.
// Kullanım: node scripts/qa/scrollbar.mjs <url> <çıktı klasörü> [kaydırma px]
import puppeteer from 'puppeteer-core';
const [url, out, y = '1400'] = process.argv.slice(2);
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: false,
  ignoreDefaultArgs: ['--hide-scrollbars'],
  args: ['--window-position=-4000,0', '--window-size=1120,820'],
  defaultViewport: null,
});
const [p] = await b.pages();
await p.goto(url, { waitUntil: 'networkidle0' });
await p.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), +y);
await new Promise((r) => setTimeout(r, 600));
const vw = await p.evaluate(() => [innerWidth, innerHeight, innerWidth - document.documentElement.clientWidth]);
await p.screenshot({ path: `${out}/sb-full-${y}.png` });
await p.screenshot({ path: `${out}/sb-edge-${y}.png`, clip: { x: vw[0] - 90, y: 0, width: 90, height: vw[1] } });
await p.hover('body').catch(() => {});
console.log(vw);
await b.close();
