// Görsel regresyon: altyapı değişikliklerinin tasarımı bozmadığını kanıtlamak için.
//
//   node scripts/qa/visual.mjs capture <baseUrl> <klasör> [sayfa,sayfa] [GxY,GxY]
//   node scripts/qa/visual.mjs compare <önce-klasörü> <sonra-klasörü>
//
// capture: her sayfayı verilen genişliklerde tam sayfa çeker; konsol hatalarını
// ve CSP ihlallerini (securitypolicyviolation) raporlar.
// Sayfa ekran ekran (kaydırarak) çekilir: çok uzun sayfaların tek parça çekimi hem
// GPU doku sınırına takılıyor hem dakikalar sürüyor. Zamana bağlı öğeler (geri sayımlar,
// sayaçlar, videolar) gizlenir, animasyonlar kapatılır.
// compare: aynı adlı PNG'leri piksel piksel karşılaştırır, farkları
// <sonra-klasörü>/diff altına yazar. Fark varsa çıkış kodu 1.
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdirSync, readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [mode, a, b, pagesArg, sizesArg] = process.argv.slice(2);
const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
.defer{content-visibility:visible!important}
[data-cd],[data-yc],[data-tick],[data-countdown] time,video{visibility:hidden!important}`;

if (mode === 'capture') await capture(a, b);
else if (mode === 'compare') await compare(a, b);
else {
  console.error('kullanım: visual.mjs capture <baseUrl> <klasör> | compare <önce> <sonra>');
  process.exit(2);
}

async function capture(base, outDir) {
  const pages = (pagesArg || '/,/yks,/yks-sayaci,/net-hesaplama,/hakkimizda,/marka,/iletisim,/hesap-silme,/gizlilik,/kullanim-sartlari,/kvkk-aydinlatma,/erken-erisim/onaylandi,/erken-erisim/tesekkurler,/olmayan-sayfa').split(',');
  const sizes = (sizesArg || '320x700,360x800,390x844,768x1024,1024x768,1100x800,1280x800,1440x900,1920x1080').split(',').map((s) => s.split('x').map(Number));
  mkdirSync(outDir, { recursive: true });
  const exe = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--hide-scrollbars'] });
  let problems = 0;
  for (const path of pages) {
    for (const [w, h] of sizes) {
      // Her çekim boş önbellekle: tarayıcı srcset'ten önbellekteki daha büyük görseli seçebilir,
      // bu da önceki çekimlere bağlı (sahte) piksel farkı doğurur
      const ctx = await browser.createBrowserContext();
      const page = await ctx.newPage();
      const issues = [];
      page.on('console', (m) => m.type() === 'error' && issues.push(`konsol: ${m.text()}`));
      page.on('pageerror', (e) => issues.push(`js: ${e.message}`));
      await page.evaluateOnNewDocument(() => {
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) =>
          window.__csp.push(`${e.disposition} ${e.effectiveDirective} ${e.blockedURI || ''} ${e.sample || ''}`.trim()),
        );
      });
      const mobile = w < 768;
      await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.goto(base + path, { waitUntil: 'networkidle0' });
      // CSP satır içi stile izin vermez; oluşturulmuş stil sayfası CSP'ye takılmaz ve ihlal saymaz
      await page.evaluate((css) => { const sh = new CSSStyleSheet(); sh.replaceSync(css); document.adoptedStyleSheets = [...document.adoptedStyleSheets, sh]; }, FREEZE);
      await page.evaluate(() => document.fonts.ready);
      // Tembel (lazy) görseller yüklensin: sayfayı sonuna kadar kaydır, başa dön,
      // bütün görsellerin inmesini bekle. Aksi hâlde çekim zamanlamaya bağlı olur.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        scrollTo(0, 0);
        const pending = [...document.images].filter((i) => !i.complete && i.getClientRects().length);
        const loaded = Promise.all(pending.map((i) => new Promise((r) => (i.addEventListener('load', r, { once: true }), i.addEventListener('error', r, { once: true })))));
        await Promise.race([loaded, new Promise((r) => setTimeout(r, 5000))]);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      });
      await page.waitForNetworkIdle({ idleTime: 300 });
      const csp = await page.evaluate(() => window.__csp);
      for (const v of csp) issues.push(`csp: ${v}`);
      const name = `${path === '/' ? 'home' : path.slice(1).replace(/\//g, '_')}-${w}x${h}`;
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0, k = 0; y < total; y += h, k++) {
        await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
        await new Promise((r) => setTimeout(r, 120));
        await page.screenshot({ path: join(outDir, `${name}~${String(k).padStart(2, '0')}.png`) });
      }
      // Sayfa boyu da karşılaştırılır (son ekranın kayması ancak böyle görünür)
      writeFileSync(join(outDir, `${name}.height`), String(total));
      await ctx.close();
      // 404 sayfasının kendi isteği beklenen bir konsol hatası üretir
      const real = issues.filter((i) => !(path === '/olmayan-sayfa' && /404/.test(i)));
      if (real.length) {
        problems++;
        console.log(`${name}:\n  ${[...new Set(real)].join('\n  ')}`);
      }
    }
  }
  await browser.close();
  console.log(problems ? `capture: ${problems} çekimde sorun var` : 'capture: konsol hatası ve CSP ihlali yok');
}

async function compare(beforeDir, afterDir) {
  // TOL: piksel başına R+G+B fark toleransı (varsayılan 0 = birebir). Katman/gradyan titremesi
  // (ör. yeni bir containment bağlamı) 1-2 birimlik fark üretir; TOL=12 bunları yok sayar.
  const TOL = Number(process.env.TOL || 0);
  const files = existsSync(beforeDir) ? readdirSync(beforeDir).filter((f) => f.endsWith('.png')) : [];
  // Boş karşılaştırma "hepsi aynı" demek değildir
  if (!files.length) {
    console.log(`compare: ${beforeDir} içinde PNG yok`);
    process.exit(1);
  }
  const diffDir = join(afterDir, 'diff');
  let changed = 0;
  for (const f of readdirSync(beforeDir).filter((f) => f.endsWith('.height'))) {
    const hb = readFileSync(join(beforeDir, f), 'utf8'), ha = existsSync(join(afterDir, f)) ? readFileSync(join(afterDir, f), 'utf8') : '?';
    if (hb !== ha) console.log(`${f.replace('.height', '')}: sayfa boyu ${hb} → ${ha}`);
  }
  for (const f of files) {
    const after = join(afterDir, f);
    if (!existsSync(after)) {
      console.log(`${f}: sonra klasöründe yok`);
      changed++;
      continue;
    }
    const [A, B] = await Promise.all([join(beforeDir, f), after].map((p) => sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));
    if (A.info.width !== B.info.width || A.info.height !== B.info.height) {
      console.log(`${f}: boyut farklı ${A.info.width}×${A.info.height} → ${B.info.width}×${B.info.height}`);
      changed++;
      continue;
    }
    const out = Buffer.alloc(A.data.length);
    let diff = 0;
    for (let i = 0; i < A.data.length; i += 4) {
      const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
      if (d > TOL) {
        diff++;
        out[i] = 255;
        out[i + 3] = 255;
      } else {
        out[i] = out[i + 1] = out[i + 2] = A.data[i] >> 2;
        out[i + 3] = 255;
      }
    }
    if (diff) {
      changed++;
      mkdirSync(diffDir, { recursive: true });
      await sharp(out, { raw: { width: A.info.width, height: A.info.height, channels: 4 } }).png().toFile(join(diffDir, f));
      console.log(`${f}: ${diff} piksel farklı`);
    }
  }
  console.log(changed ? `compare: ${changed}/${files.length} görüntü farklı` : `compare: ${files.length} görüntünün hepsi piksel piksel aynı`);
  process.exit(changed ? 1 : 0);
}
