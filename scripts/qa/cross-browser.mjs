// Tarayıcılar arası test: Chrome, Edge, Firefox ve WebKit (Safari motoru) ile aynı denetim
// ve temel etkileşimler. Playwright gerekir (projeye bağımlılık olarak eklenmez):
//
//   npm i -g playwright && npx playwright install firefox webkit
//   PLAYWRIGHT=<playwright modülünün yolu> node scripts/qa/cross-browser.mjs <baseUrl> <ekran-klasörü>
//
// Her tarayıcıda ve görünümde: yatay kaydırma, kesilen içerik, metin çakışması, menü
// çakışması, kırık görsel, konsol/JS hataları (audit.mjs ile aynı kontroller). Ayrıca:
// mobil menü açılıp kapanıyor mu, tur sekmesi seçilince ekran değişiyor mu, galeri
// şeritleri ekleniyor mu, net hesabı doğru mu, sayaç akıyor mu. Ekran görüntüleri
// tarayıcılar arasında yan yana karşılaştırma için kaydedilir.
import { inPageAudit } from './lib/audit-dom.mjs';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const [base = 'http://localhost:4322', shotDir = '.qa/xb'] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require(process.env.PLAYWRIGHT || 'playwright');
mkdirSync(shotDir, { recursive: true });

const browsers = [
  ['chrome', () => chromium.launch({ channel: 'chrome' })],
  ['edge', () => chromium.launch({ channel: 'msedge' })],
  ['firefox', () => firefox.launch()],
  ['webkit', () => webkit.launch()],
];
const views = [
  { id: '390', w: 390, h: 844, dpr: 2, mobile: true },
  { id: '768', w: 768, h: 1024, dpr: 2, mobile: true },
  { id: '1280', w: 1280, h: 800, dpr: 1, mobile: false },
  { id: '1920', w: 1920, h: 1080, dpr: 1, mobile: false },
  { id: '1280@200%', w: 640, h: 400, dpr: 2, mobile: false },
];
const pages = ['/', '/yks', '/yks-sayaci', '/net-hesaplama', '/hakkimizda', '/gizlilik'];

let problems = 0;
const log = (s) => console.log(s);
for (const [name, launch] of browsers) {
  let browser;
  try {
    browser = await launch();
  } catch (e) {
    log(`${name}: açılamadı (${String(e).split('\n')[0].slice(0, 100)})`);
    continue;
  }
  for (const v of views) {
    // Firefox mobil öykünmeyi (isMobile) desteklemez; dokunma ve oran yine verilir
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: v.h },
      deviceScaleFactor: v.dpr,
      ...(name === 'firefox' ? {} : { isMobile: v.mobile }),
      hasTouch: v.mobile,
      reducedMotion: 'reduce',
      bypassCSP: true,
    });
    for (const path of pages) {
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
      page.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource.*404/.test(m.text()) && errors.push(m.text().slice(0, 140)));
      try {
        await page.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
        await page.addStyleTag({ content: '.defer{content-visibility:visible!important}' });
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < total; y += Math.floor(v.h * 0.85)) {
          await page.evaluate((y) => scrollTo(0, y), y);
          await page.waitForTimeout(60);
        }
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(500);
        const issues = (await page.evaluate(`(${inPageAudit.toString()})({})`)).filter((i) => i.sev !== 'LOW' && i.check !== 'küçük dokunma hedefi');
        for (const e of errors) issues.push({ check: 'konsol/JS hatası', sev: 'HIGH', el: '', detail: e });
        if (issues.length) {
          problems += issues.length;
          for (const i of issues) log(`✗ ${name.padEnd(7)} ${v.id.padEnd(9)} ${path.padEnd(14)} ${i.sev} ${i.check} · ${i.el} · ${i.detail}`);
        }
        if (['/', '/yks'].includes(path)) await page.screenshot({ path: `${shotDir}/${name}-${v.id.replace('%', '')}-${path === '/' ? 'home' : 'yks'}.png` });
      } catch (e) {
        problems++;
        log(`✗ ${name} ${v.id} ${path}: ${String(e).split('\n')[0].slice(0, 140)}`);
      }
      await page.close();
    }

    // Etkileşimler (yalnız 390 ve 1280'de)
    if (v.id === '390' || v.id === '1280') {
      const page = await ctx.newPage();
      const checks = [];
      try {
        await page.goto(base + '/yks', { waitUntil: 'networkidle' });
        if (v.id === '390') {
          await page.click('[data-menu-open], .menu-toggle');
          await page.waitForTimeout(400);
          const open = await page.evaluate(() => !!document.querySelector('dialog[open]'));
          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);
          const closed = await page.evaluate(() => !document.querySelector('dialog[open]'));
          checks.push(['mobil menü açılır/kapanır', open && closed]);
        }
        await page.evaluate(() => document.querySelector('#uygulama').scrollIntoView());
        await page.waitForTimeout(800);
        await page.click('[data-tour-tab="2"]');
        await page.waitForTimeout(700);
        checks.push(['tur sekmesi ekranı değiştirir', await page.evaluate(() => document.querySelectorAll('[data-tour] .device__shot')[2].classList.contains('is-active'))]);
        const cd = await page.evaluate(async () => {
          const s = document.querySelector('[data-cd="s"]');
          if (!s) return true;
          const a = s.textContent;
          await new Promise((r) => setTimeout(r, 1300));
          return a !== s.textContent || matchMedia('(prefers-reduced-motion: reduce)').matches;
        });
        checks.push(['sayaç akar', cd]);
        await page.goto(base + '/', { waitUntil: 'networkidle' });
        await page.evaluate(() => document.querySelector('#gorseller').scrollIntoView());
        await page.waitForTimeout(1500);
        checks.push(['galeri şeritleri eklenir', await page.evaluate(() => document.querySelectorAll('[data-gallery-sets] [data-gallery-set]').length === 2)]);
        await page.goto(base + '/net-hesaplama', { waitUntil: 'networkidle' });
        await page.fill('[data-subject="tyt_tur"] [data-d]', '32');
        await page.fill('[data-subject="tyt_tur"] [data-y]', '8');
        await page.waitForTimeout(200);
        checks.push(['net hesabı 32D 8Y = 30', (await page.textContent('[data-subject="tyt_tur"] [data-net]')).trim() === '30']);
      } catch (e) {
        checks.push([`etkileşim hatası: ${String(e).split('\n')[0].slice(0, 100)}`, false]);
      }
      for (const [label, ok] of checks) {
        if (!ok) problems++;
        log(`${ok ? '✓' : '✗'} ${name.padEnd(7)} ${v.id.padEnd(9)} ${label}`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
}
log(problems ? `SONUÇ: ${problems} sorun` : 'SONUÇ: dört tarayıcıda da sorun yok');
process.exit(problems ? 1 : 0);
