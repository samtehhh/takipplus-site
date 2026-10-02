// İki parmakla yakınlaştırma / uzaklaştırma testi — GERÇEK Android cihazda.
//
//   adb forward tcp:9333 localabstract:chrome_devtools_remote
//   node scripts/qa/pinch.mjs 9333 https://takipplus.com.tr [/,/yks,...]
//   adb forward --remove tcp:9333
//
// Masaüstü Chrome'un mobil öykünmesinde sentetik pinch hiç uygulanmaz (sade bir kontrol
// sayfasında da ölçek 1'de kalır); orada alınan "geçti/kaldı" anlamsızdır. Bu yüzden test
// USB hata ayıklamayla bağlı telefondaki Chrome'a bağlanır. Yeni bir sekme açar, sonunda
// kapatır; telefondaki diğer sekmelere dokunmaz.
//
// Önce aracın kendisini sınar: sade bir kontrol sayfasında yakınlaşma olmuyorsa araç
// bozuktur ve site sonucu yazılmaz. Sonra her sayfada:
//  - yakınlaştırmayı kapatan ayarlar: viewport meta (maximum-scale, user-scalable=no) ve
//    pinch'i dışlayan touch-action değerleri
//  - farklı öğelerin (başlık, cihaz görseli, yatay galeri, tur sekmeleri, buton, SSS, alt
//    bilgi, form alanı) üstünde 2 kat yakınlaştırıp adım adım uzaklaştırma; ölçek 1'e dönmeli.
// Yakınlaşmış ekranda bazı noktalar "Position out of bounds" verir; her adım birkaç noktadan
// denenir, sonuç visualViewport.scale'den okunur.
import puppeteer from 'puppeteer-core';

const [port = '9333', base = 'https://takipplus.com.tr', pagesArg] = process.argv.slice(2);
const pages = (pagesArg || '/,/yks,/yks-sayaci,/net-hesaplama,/gizlilik').split(',');
const targets = [
  ['başlık', 'h1'],
  ['cihaz görseli', '.device'],
  ['yatay galeri', '.sg__track, .fan'],
  ['tur sekmeleri', '.tour__tabs'],
  ['buton', '.btn'],
  ['SSS', '.faq'],
  ['form alanı', 'input:not([type=hidden])'],
  ['alt bilgi', '.site-footer'],
];

const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null });
const page = await browser.newPage();
await page.bringToFront();
const cdp = await page.createCDPSession();
const scale = () => page.evaluate(() => visualViewport.scale);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Hareketi sırayla birkaç noktadan dener; ölçek değişince durur
async function pinch(f) {
  const { w, h } = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  const pts = [[w / 2, h / 2], [100, 200], [50, 50], [w * 0.3, h * 0.3], [w / 2, h * 0.25], [w * 0.7, h * 0.7]].map(([x, y]) => [Math.round(x), Math.round(y)]);
  const before = await scale();
  for (const [x, y] of pts) {
    try {
      await cdp.send('Input.synthesizePinchGesture', { x, y, scaleFactor: f, gestureSourceType: 'touch' });
      await wait(450);
    } catch {
      continue;
    }
    if (Math.abs((await scale()) - before) > 0.01) return true;
  }
  return false;
}

// 2 kat yakınlaş, 0,8'lik adımlarla 1'e dön
async function zoomCycle() {
  for (let k = 0; k < 3 && (await scale()) < 1.8; k++) await pinch(2);
  const zin = await scale();
  const steps = [];
  for (let k = 0; k < 10 && (await scale()) > 1.02; k++) {
    const moved = await pinch(0.8);
    steps.push((await scale()).toFixed(2) + (moved ? '' : ' (uygulanamadı)'));
    if (!moved) break;
  }
  const zout = await scale();
  if (zout > 1.05) await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 }).catch(() => {});
  return { ok: zin > 1.5 && zout < 1.05, text: `${zin.toFixed(2)} → ${steps.join(' → ')}` };
}

let fails = 0;
try {
  // 1) Aracın kendisi çalışıyor mu (sade kontrol sayfası)
  await page.goto('data:text/html,<meta name=viewport content="width=device-width,initial-scale=1"><h1>Kontrol</h1>' + '<p>metin</p>'.repeat(80));
  await wait(800);
  const control = await zoomCycle();
  console.log(`kontrol sayfası: ${control.ok ? '✓' : '✗'} ${control.text}`);
  if (!control.ok) {
    console.log('SONUÇ: araç bu tarayıcıda hareket üretemiyor; site sonucu geçersiz olurdu');
    process.exitCode = 2;
  } else {
    for (const path of pages) {
      await page.goto(base + path, { waitUntil: 'networkidle2', timeout: 60000 });
      await wait(1500);
      const meta = await page.$eval('meta[name=viewport]', (m) => m.content).catch(() => '(yok)');
      if (/maximum-scale\s*=\s*1(\.0)?\b|user-scalable\s*=\s*(no|0)/i.test(meta)) {
        fails++;
        console.log(`✗ ${path}: viewport meta yakınlaştırmayı kısıtlıyor: ${meta}`);
      }
      const blocked = await page.evaluate(() => {
        const out = new Set();
        for (const el of document.querySelectorAll('*')) {
          const t = getComputedStyle(el).touchAction;
          if (t && t !== 'auto' && t !== 'manipulation' && !/pinch-zoom/.test(t)) out.add(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}: ${t}`);
        }
        return [...out].slice(0, 8);
      });
      if (blocked.length) {
        fails++;
        console.log(`✗ ${path}: pinch'i dışlayan touch-action: ${blocked.join(' | ')}`);
      }
      console.log(`${path}  (meta: ${meta})`);
      for (const [name, sel] of targets) {
        const found = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return false;
          el.scrollIntoView({ block: 'center', behavior: 'instant' });
          return true;
        }, sel);
        if (!found) continue;
        await wait(400);
        const r = await zoomCycle();
        if (!r.ok) fails++;
        console.log(`  ${r.ok ? '✓' : '✗'} ${name.padEnd(14)} ${r.text}`);
      }
    }
    console.log(fails ? `SONUÇ: ${fails} sorun` : 'SONUÇ: her noktada yakınlaştırma ve uzaklaştırma çalışıyor');
    process.exitCode = fails ? 1 : 0;
  }
} finally {
  await page.close();
  await browser.disconnect();
}
