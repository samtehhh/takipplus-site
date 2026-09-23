// Davranış testleri: JS kapalı görünürlük, mobil menü, sabit CTA, form doğrulama, fontlar.
import puppeteer from 'puppeteer-core';
const base = process.argv[2] || 'http://localhost:4322';
const out = process.argv[3] || '.';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [];
const ok = (name, cond, extra = '') => results.push(`${cond ? 'GEÇTİ' : 'KALDI'}  ${name}${extra ? ' — ' + extra : ''}`);

// 1) JS kapalı: tüm data-reveal içerik görünür olmalı
{
  const p = await b.newPage();
  await p.setJavaScriptEnabled(false);
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto(base + '/yks', { waitUntil: 'networkidle0' });
  const hidden = await p.evaluate(() => [...document.querySelectorAll('[data-reveal],[data-animate]')].filter((e) => getComputedStyle(e).opacity === '0').length);
  ok('JS kapalıyken görünmeyen öğe yok', hidden === 0, `${hidden} gizli`);
  await p.close();
}
// 2) Mobil menü
{
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto(base + '/', { waitUntil: 'networkidle0' });
  await p.click('[data-menu-open]');
  await new Promise((r) => setTimeout(r, 400));
  const st = await p.evaluate(() => ({
    open: document.querySelector('[data-menu]').open,
    exp: document.querySelector('[data-menu-open]').getAttribute('aria-expanded'),
    focusIn: document.querySelector('[data-menu]').contains(document.activeElement),
    overflow: getComputedStyle(document.documentElement).overflow,
  }));
  ok('Menü açılıyor, aria-expanded=true', st.open && st.exp === 'true');
  ok('Odak menüye geçiyor', st.focusIn);
  ok('Arka plan kaymıyor (overflow hidden)', st.overflow === 'hidden');
  await p.screenshot({ path: `${out}/menu-open.png` });
  await p.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));
  const st2 = await p.evaluate(() => ({ open: document.querySelector('[data-menu]').open, exp: document.querySelector('[data-menu-open]').getAttribute('aria-expanded'), focus: document.activeElement?.matches('[data-menu-open]') }));
  ok('ESC ile kapanıyor, odak butona dönüyor', !st2.open && st2.exp === 'false' && st2.focus);
  await p.close();
}
// 3) Sabit CTA
{
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto(base + '/yks', { waitUntil: 'networkidle0' });
  const s0 = await p.evaluate(() => document.querySelector('[data-sticky]').classList.contains('is-shown'));
  await p.evaluate(() => window.scrollTo({ top: 2500, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 600));
  const s1 = await p.evaluate(() => document.querySelector('[data-sticky]').classList.contains('is-shown'));
  await p.screenshot({ path: `${out}/sticky.png` });
  await p.evaluate(() => document.querySelector('#erken-erisim').scrollIntoView({ behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 600));
  const s2 = await p.evaluate(() => document.querySelector('[data-sticky]').classList.contains('is-shown'));
  ok('Sabit CTA hero görünürken gizli', !s0);
  ok('Sabit CTA hero geçilince görünüyor', s1);
  ok('Sabit CTA form görününce gizleniyor', !s2);
  // 4) Form doğrulama
  await p.click('#erken-erisim button[type=submit]');
  await new Promise((r) => setTimeout(r, 200));
  const errs = await p.evaluate(() => [...document.querySelectorAll('#erken-erisim [data-error]')].map((e) => e.textContent));
  ok('Boş gönderimde alan altı hata mesajları', errs.every(Boolean), errs.join(' / '));
  const consentDefault = await p.evaluate(() => document.querySelector('#erken-erisim input[name=consent]').checked);
  ok('KVKK onay kutusu işaretsiz geliyor', consentDefault === false);
  const inputFont = await p.evaluate(() => getComputedStyle(document.querySelector('#erken-erisim input[type=email]')).fontSize);
  ok('E-posta alanı ≥16px (iOS yakınlaştırmaz)', parseFloat(inputFont) >= 16, inputFont);
  await p.close();
}
// 5) Türkçe glifler kendi fontumuzla
{
  const p = await b.newPage();
  await p.goto(base + '/hakkimizda', { waitUntil: 'networkidle0' });
  const fonts = await p.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.unicodeRange.slice(0, 12)); });
  ok('Türkçe alt küme fontları yüklendi', fonts.some((f) => f.includes('U+11E')), fonts.join(', '));
  await p.close();
}
await b.close();
console.log(results.join('\n'));
