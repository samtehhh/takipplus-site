// QA: sayfaları farklı genişliklerde tam sayfa çeker, yatay taşma ve küçük
// dokunma hedeflerini raporlar.
// Kullanım: node scripts/qa/shots.mjs <baseUrl> <outDir> [sayfa,sayfa] [genişlik,genişlik] [--landscape]
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const [base = 'http://localhost:4321', outDir = './.qa', pagesArg, widthsArg] = process.argv.slice(2);
const landscape = process.argv.includes('--landscape');
const pages = (pagesArg || '/,/yks,/hakkimizda,/marka,/iletisim,/hesap-silme,/gizlilik,/kullanim-sartlari,/kvkk-aydinlatma,/404').split(',');
const sizes = (widthsArg || '320x640,360x800,390x844,430x932,768x1024,1024x768,1440x900,1920x1080')
  .split(',')
  .map((s) => s.split('x').map(Number))
  .map(([w, h]) => (landscape && w < 1000 ? [h, w] : [w, h]));

mkdirSync(outDir, { recursive: true });
const exe = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--hide-scrollbars'] });
const report = [];

for (const path of pages) {
  for (const [w, h] of sizes) {
    const page = await browser.newPage();
    const mobile = w < 768;
    await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const res = await page.goto(base + path, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || getComputedStyle(el).position === 'fixed') continue;
        if (el.closest('.carousel__track, dialog, .sr-only, [aria-hidden="true"], .glow, .table-wrap')) continue;
        if (r.right > vw + 1 || r.left < -1) over.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${Math.round(r.left)}→${Math.round(r.right)})`);
      }
      const small = [];
      for (const el of document.querySelectorAll('a, button, input, summary, select')) {
        const r = el.getBoundingClientRect();
        if (!r.width || el.closest('dialog:not([open]), .sr-only, .waitlist__hp') || el.classList.contains('skip-link')) continue;
        const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
        if (inline) continue; // metin içi linkler WCAG 2.5.8 istisnası
        if (r.width < 44 || r.height < 44) small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
      const h1 = document.querySelectorAll('h1').length;
      return { scrollW: document.documentElement.scrollWidth, vw, over: over.slice(0, 8), small: small.slice(0, 10), h1 };
    });
    const name = `${path === '/' ? 'home' : path.slice(1).replace(/\//g, '_')}-${w}x${h}`;
    const file = `${outDir}/${name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    // Okunabilir parçalara böl
    const meta = await sharp(file).metadata();
    const seg = Math.round(w * 2.2);
    for (let y = 0, i = 0; y < meta.height; y += seg, i++) {
      await sharp(file)
        .extract({ left: 0, top: y, width: meta.width, height: Math.min(seg, meta.height - y) })
        .toFile(`${outDir}/${name}.part${i}.png`);
    }
    report.push({ page: path, size: `${w}x${h}`, status: res.status(), hScroll: info.scrollW > info.vw, h1: info.h1, overflow: info.over, smallTargets: info.small });
    await page.close();
  }
}
await browser.close();
for (const r of report) {
  const flags = [r.status >= 400 && r.page !== '/404' && `HTTP ${r.status}`, r.hScroll && 'YATAY KAYDIRMA', r.h1 !== 1 && `h1=${r.h1}`].filter(Boolean);
  console.log(`${r.page.padEnd(20)} ${r.size.padEnd(10)} ${flags.join(' ') || 'ok'}`);
  if (r.overflow.length) console.log('   taşma:', r.overflow.join(' | '));
  if (r.smallTargets.length) console.log('   küçük hedef:', r.smallTargets.join(' | '));
}
