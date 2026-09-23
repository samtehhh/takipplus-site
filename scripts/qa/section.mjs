// Tek bir bölümü farklı genişliklerde (ve büyük yazı ayarıyla) çeker.
// Kullanım: node scripts/qa/section.mjs <url> <seçici> <çıktı klasörü> 390 1024 1100 ...  [--big-text]
import puppeteer from 'puppeteer-core';
const args = process.argv.slice(2);
const big = args.includes('--big-text');
const [url, sel, out, ...widths] = args.filter((a) => a !== '--big-text');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const w of widths.map(Number)) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: 900, isMobile: w < 768, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { waitUntil: 'networkidle0' });
  if (big) await p.evaluate(() => (document.documentElement.style.fontSize = '20px'));
  await new Promise((r) => setTimeout(r, 300));
  const el = await p.$(sel);
  const info = await p.evaluate((s) => {
    const cards = [...document.querySelectorAll(s + ' li.extra, ' + s + ' > * li')].slice(0, 3).map((c) => Math.round(c.getBoundingClientRect().width));
    return { cards, hScroll: document.documentElement.scrollWidth > innerWidth };
  }, sel);
  await el.screenshot({ path: `${out}/sec-${w}${big ? '-big' : ''}.png` });
  console.log(w, big ? 'büyük yazı' : '', JSON.stringify(info));
  await p.close();
}
await b.close();
