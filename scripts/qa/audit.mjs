// Duyarlı tasarım / görünüm alanı / tarayıcı yakınlaştırması / taşma denetimi.
//
//   node scripts/qa/audit.mjs <baseUrl> <rapor.json> [--quick] [--pages=/,/yks]
//
// Matris (her sayfa için):
//  - Genişlikler: 280–2560 px, sitedeki bütün kırılım noktaları ve hemen öncesi/sonrası
//    (416, 480, 640, 768, 896, 960, 1024, 1280 ± 1)
//  - Tarayıcı yakınlaştırması: 1366×768 ve 1920×1080 pencerede %50–%200
//    (CSS görünüm alanı = pencere / yakınlaştırma, cihaz piksel oranı = yakınlaştırma;
//    tarayıcının Ctrl + / − yaptığının aynısı)
//  - Yatay telefon ve tablet, metni %200 büyütme (tarayıcının yazı boyutu ayarı)
// Her görünümde: yatay kaydırma ve sebebi, kesilen içerik, üst üste binen metinler,
// başlık/buton taşması, menü öğelerinin çakışması, yapışkan/sabit öğelerin ekran payı,
// tıklanabilir alanın başka öğe tarafından örtülmesi, küçük dokunma hedefleri, kırık ya da
// oranı bozulmuş görseller, çok küçük yazı, konsol hataları.
// Sonuç: sorun → hangi sayfa/görünümlerde → örnek öğe. Çıkış kodu sorun varsa 1.
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
import { inPageAudit, occlusionAudit } from './lib/audit-dom.mjs';

const args = process.argv.slice(2);
const base = args[0] || 'http://localhost:4322';
const outFile = args[1] || '.qa/audit.json';
const quick = args.includes('--quick');
// --selftest: aracın hata yakalayabildiğini kanıtlar (taşan kutu, çakışan metin, örtülen buton enjekte eder)
const selftest = args.includes('--selftest');
const pagesArg = args.find((a) => a.startsWith('--pages='));
const exe = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const PAGES = pagesArg
  ? pagesArg.slice(8).split(',')
  : ['/', '/yks', '/yks-sayaci', '/net-hesaplama', '/hakkimizda', '/marka', '/iletisim', '/hesap-silme', '/gizlilik', '/kullanim-sartlari', '/kvkk-aydinlatma', '/onizleme', '/404', '/erken-erisim/onaylandi', '/erken-erisim/tesekkurler'];

const configs = [];
const phoneH = (w) => Math.round(w * 2.1);
const widths = quick
  ? [320, 390, 768, 1024, 1280, 1920]
  : [280, 320, 360, 375, 390, 414, 415, 416, 417, 430, 479, 480, 481, 600, 639, 640, 641, 744, 767, 768, 769, 810, 820, 834, 895, 896, 897, 959, 960, 961, 1023, 1024, 1025, 1180, 1279, 1280, 1281, 1366, 1440, 1536, 1920, 2560];
for (const w of widths) {
  const h = w < 600 ? Math.min(phoneH(w), 932) : w < 1100 ? 1024 : w >= 2000 ? 1440 : 900;
  configs.push({ id: `${w}px`, w, h, dpr: w < 1024 ? 2 : 1, mobile: w < 1024, kind: 'genişlik' });
}
if (!quick) {
  for (const [ww, wh] of [[1366, 768], [1920, 1080]]) {
    for (const z of [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200]) {
      configs.push({ id: `${ww}@${z}%`, w: Math.round(ww / (z / 100)), h: Math.round(wh / (z / 100)), dpr: z / 100, mobile: false, kind: 'yakınlaştırma', zoom: z });
    }
  }
  for (const [w, h] of [[667, 375], [844, 390], [915, 412], [1024, 768], [1180, 820]]) {
    configs.push({ id: `${w}x${h} yatay`, w, h, dpr: 2, mobile: true, kind: 'yatay' });
  }
  for (const w of [390, 1280]) configs.push({ id: `${w}px metin %200`, w, h: w < 1000 ? 844 : 900, dpr: 2, mobile: w < 1000, kind: 'büyük metin', fontScale: 2 });
}

const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--hide-scrollbars'] });
const results = [];
const jobs = [];
for (const path of PAGES) for (const c of configs) jobs.push({ path, c });

async function run({ path, c }) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
  try {
    await page.setBypassCSP(true);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: c.w, height: c.h, deviceScaleFactor: c.dpr, isMobile: c.mobile, hasTouch: c.mobile });
    if (c.fontScale) {
      const cdp = await page.createCDPSession();
      await cdp.send('Page.setFontSizes', { fontSizes: { standard: 16 * c.fontScale, fixed: 13 * c.fontScale } });
    }
    await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.addStyleTag({ content: '.defer{content-visibility:visible!important}' });
    if (selftest)
      await page.evaluate(() => {
        const m = document.querySelector('main');
        const wide = document.createElement('div');
        wide.style.cssText = 'width:130vw;height:10px;background:red';
        m.prepend(wide);
        const h = document.querySelector('h1');
        const p = document.createElement('p');
        p.textContent = 'ÇAKIŞAN METİN TESTİ';
        p.style.cssText = `position:absolute;left:${h.getBoundingClientRect().left + 10}px;top:${h.getBoundingClientRect().top + scrollY + 5}px;z-index:50;font-size:30px;background:#000`;
        document.body.append(p);
      });
    // Sayfayı baştan sona gez: tembel görseller, görünme animasyonları, örtülme denetimi
    const occl = [];
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.max(300, Math.floor(c.h * 0.85));
    for (let y = 0; y < total; y += step) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
      await new Promise((r) => setTimeout(r, 90));
      occl.push(...(await page.evaluate(`(${occlusionAudit.toString()})()`)));
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    // başa dönünce görünürlük gözlemcileri (yapışkan çubuk vb.) tepki versin
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(async () => {
      await Promise.race([Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 4000))]);
    });
    const issues = await page.evaluate(`(${inPageAudit.toString()})({})`);
    // 404 sayfası kendi belgesi için 404 döner; bu beklenen bir "kaynak yüklenemedi" hatasıdır
    for (const e of errors) if (!(path === '/404' && /status of 404/.test(e))) issues.push({ check: 'konsol hatası', sev: 'HIGH', el: '', detail: e });
    results.push({ path, config: c.id, kind: c.kind, issues: [...issues, ...occl] });
  } catch (e) {
    results.push({ path, config: c.id, kind: c.kind, issues: [{ check: 'sayfa açılamadı', sev: 'CRITICAL', el: '', detail: String(e).slice(0, 160) }] });
  } finally {
    await page.close();
  }
}

const CONC = Number(process.env.CONC || 6);
let i = 0;
let done = 0;
await Promise.all(
  Array.from({ length: CONC }, async () => {
    while (i < jobs.length) {
      const job = jobs[i++];
      await run(job);
      done++;
      if (done % 50 === 0) console.error(`… ${done}/${jobs.length}`);
    }
  }),
);
await browser.close();
writeFileSync(outFile, JSON.stringify(results, null, 1));

// Özet: aynı sorun (sayfa + kontrol + öğe) → hangi görünümlerde
const groups = new Map();
for (const r of results)
  for (const is of r.issues) {
    const key = `${is.sev}|${r.path}|${is.check}|${is.el}`;
    if (!groups.has(key)) groups.set(key, { ...is, path: r.path, configs: [] });
    groups.get(key).configs.push(r.config);
  }
const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const list = [...groups.values()].sort((a, b) => order[a.sev] - order[b.sev] || a.path.localeCompare(b.path));
for (const g of list) console.log(`${g.sev.padEnd(8)} ${g.path.padEnd(14)} ${g.check} · ${g.el} · ${g.detail}\n         görünümler (${g.configs.length}): ${g.configs.slice(0, 10).join(', ')}${g.configs.length > 10 ? ' …' : ''}`);
console.log(`\ndenetim: ${PAGES.length} sayfa × ${configs.length} görünüm = ${jobs.length} yükleme; ${list.length} farklı sorun`);
process.exit(list.some((g) => g.sev !== 'LOW') ? 1 : 0);
