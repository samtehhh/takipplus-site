// Derleme sonrası kontroller. Hata varsa derleme başarısız olur (Vercel
// deploy'u da yayına çıkmaz).
//
// Sayfa içi: kırık iç link/varlık, eksik çapa, sayfa başına tek H1, başlık ≤ 60
// ve açıklama ≤ 155 karakter, canonical/OG/Twitter, lang, satır içi betik ve
// stil (CSP), JSON-LD geçerliliği ve doğruluk kuralları, ana sayfa ağırlığı.
// HTTP: vercel.json kuralları yerelde taklit edilerek yönlendirme, 404,
// başlık, sitemap ve .well-known testleri (scripts/lib/site-checks.mjs).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps, canonicalHost } from '../src/config/site.js';
import { loadRoutes, resolve as route } from './lib/vercel-routing.mjs';
import { checkSite } from './lib/site-checks.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const vercelUrl = new URL('../vercel.json', import.meta.url);
const vercel = JSON.parse(readFileSync(vercelUrl, 'utf8'));
const isPreviewBuild = process.env.VERCEL_ENV === 'preview';
const errors = [];
const warnings = [];

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const toUrl = (f) => '/' + relative(dist, f).split(sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '');

const pages = new Map();
for (const f of htmlFiles) pages.set(toUrl(f).replace(/\/$/, '') || '/', readFileSync(f, 'utf8'));

function resolve(path) {
  const clean = decodeURI(path.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return join(dist, 'index.html');
  const p = join(dist, clean);
  for (const c of [p, `${p}.html`, join(p, 'index.html')]) if (existsSync(c) && statSync(c).isFile()) return c;
  if (vercel.rewrites?.some((r) => r.source === clean)) return 'rewrite';
  if (clean.startsWith('/_vercel/') || clean.startsWith('/api/')) return 'runtime';
  return null;
}

const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const meta = (html, attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
const released = Object.values(apps).some((a) => a.released);

for (const [url, html] of pages) {
  const where = url;
  const isNoindex = /name="robots" content="noindex/.test(html) || url === '/404';

  // Linkler ve varlıklar
  for (const m of html.matchAll(/\s(?:href|src|srcset|content)="([^"]+)"/g)) {
    for (const raw of m[1].split(',').map((s) => s.trim().split(' ')[0])) {
      if (!raw.startsWith('/') || raw.startsWith('//')) continue;
      const [path, hash] = raw.split('#');
      const target = resolve(path || url);
      if (!target) errors.push(`${where}: kırık iç bağlantı/varlık → ${raw}`);
      else if (hash && target.endsWith('.html')) {
        const tHtml = readFileSync(target, 'utf8');
        if (!ids(tHtml).has(hash)) errors.push(`${where}: çapa bulunamadı → ${raw}`);
      }
    }
  }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids(html).has(m[1])) errors.push(`${where}: sayfa içi çapa yok → #${m[1]}`);

  // SEO
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${where}: ${h1} adet h1`);
  const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replace(/&amp;/g, '&');
  const desc = meta(html, 'name', 'description') ?? '';
  if (!title || title.length > 60) (isNoindex ? warnings : errors).push(`${where}: title ${title.length} karakter "${title}"`);
  if (!desc || desc.length > 155) (isNoindex ? warnings : errors).push(`${where}: description ${desc.length} karakter`);
  if (!/<html lang="tr"/.test(html)) errors.push(`${where}: <html lang="tr"> yok`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) errors.push(`${where}: canonical yok`);
  else {
    const c = new URL(canonical);
    if (c.origin !== site.url) errors.push(`${where}: canonical production adresini göstermiyor (${canonical})`);
    if (!isNoindex && c.pathname !== url) errors.push(`${where}: canonical kendini göstermiyor (${canonical})`);
  }
  if (meta(html, 'property', 'og:locale') !== site.locale) errors.push(`${where}: og:locale ${meta(html, 'property', 'og:locale')}`);
  if (meta(html, 'name', 'twitter:card') !== 'summary_large_image') errors.push(`${where}: twitter:card yok`);
  const og = meta(html, 'property', 'og:image');
  if (!og || !resolve(new URL(og).pathname)) errors.push(`${where}: og:image dosyası yok (${og})`);
  else if (new URL(og).origin !== site.url) errors.push(`${where}: og:image production adresinde değil (${og})`);
  if (meta(html, 'property', 'og:image:width') !== '1200' || meta(html, 'property', 'og:image:height') !== '630') errors.push(`${where}: og:image 1200×630 değil`);

  // CSP: satır içi betik, olay işleyici ve stil olmamalı
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/g)) errors.push(`${where}: satır içi betik CSP'ye takılır → ${m[0]}`);
  if (/\son[a-z]+="/.test(html)) errors.push(`${where}: satır içi olay işleyici (onclick vb.)`);
  const noScripts = html.replace(/<script\b[\s\S]*?<\/script>/g, '');
  if (/<style[\s>]/i.test(noScripts)) errors.push(`${where}: <style> bloğu CSP'ye takılır (inlineStylesheets: 'never' olmalı)`);
  const styleAttr = noScripts.match(/<[^>]+\sstyle\s*=\s*["'][^>]*>/);
  if (styleAttr) errors.push(`${where}: style özniteliği CSP'ye takılır → ${styleAttr[0].slice(0, 120)}`);

  // JSON-LD: geçerli JSON ve doğruluk kuralları
  const ld = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      ld.push(JSON.parse(m[1]));
    } catch (e) {
      errors.push(`${where}: JSON-LD ayrıştırılamadı (${e.message})`);
    }
  }
  const types = ld.map((x) => x['@type']);
  const text = JSON.stringify(ld);
  if (/aggregateRating|"review"|ratingValue/.test(text)) errors.push(`${where}: şemada puan/yorum var (uydurma veri yasak)`);
  if (!released && /MobileApplication|"offers"|downloadUrl/.test(text)) errors.push(`${where}: yayın öncesi MobileApplication/offers/downloadUrl şemada olmamalı`);
  if (url === '/') {
    for (const t of ['Organization', 'WebSite']) {
      const item = ld.find((x) => x['@type'] === t);
      if (!item) errors.push(`/: ${t} şeması yok`);
      else if (!site.alternateNames.every((n) => item.alternateName?.includes(n))) errors.push(`/: ${t}.alternateName eksik`);
    }
    const org = ld.find((x) => x['@type'] === 'Organization');
    if (org && !org.contactPoint?.email) errors.push('/: Organization.contactPoint yok');
  } else if (!isNoindex && !types.includes('BreadcrumbList')) errors.push(`${where}: BreadcrumbList şeması yok`);
  for (const b of ld.filter((x) => x['@type'] === 'BreadcrumbList')) {
    const last = b.itemListElement?.at(-1)?.item;
    if (last && new URL(last).pathname !== url) errors.push(`${where}: BreadcrumbList son öğesi sayfanın kendisi değil (${last})`);
  }
  if (/<div class="faq/.test(html) && !types.includes('FAQPage')) errors.push(`${where}: SSS var ama FAQPage şeması yok`);
  if (url.startsWith('/rehber/') && !types.includes('Article')) errors.push(`${where}: Article şeması yok`);
}

// Ana sayfa ilk yükleme ağırlığı (HTML + CSS + JS + preload edilen fontlar + eager görseller)
const home = pages.get('/');
const assets = new Set();
for (const m of home.matchAll(/<(?:link|script)[^>]+(?:href|src)="(\/[^"]+\.(?:css|js|woff2))"/g)) assets.add(m[1]);
for (const m of home.matchAll(/<img[^>]+src="(\/[^"]+)"(?![^>]*loading="lazy")/g)) assets.add(m[1]);
let bytes = Buffer.byteLength(home);
for (const a of assets) {
  const f = resolve(a);
  if (f && f.startsWith(dist)) bytes += statSync(f).size;
}
const kb = (bytes / 1024).toFixed(1);
console.log(`check-dist: ${pages.size} sayfa, ana sayfa ilk yükleme ≈ ${kb} KB (sıkıştırmasız)`);
if (bytes > 500 * 1024) errors.push(`ana sayfa ilk yükleme ${kb} KB > 500 KB`);

// Sitemap: her tarih gerçek bir değişiklik tarihi olmalı; tarihsiz sayfa uyarı
const sitemapXml = files.filter((f) => /sitemap-\d+\.xml$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('');
for (const m of sitemapXml.matchAll(/<url><loc>([^<]+)<\/loc>(<lastmod>)?/g)) if (!m[2]) warnings.push(`sitemap: ${m[1]} için lastmod yok (git geçmişi okunamadı)`);
const inSitemap = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
for (const [url, html] of pages) {
  const indexable = !/name="robots" content="noindex/.test(html) && url !== '/404';
  if (indexable && !isPreviewBuild && !inSitemap.has(url)) errors.push(`sitemap: indekslenebilir ${url} sitemap'te yok`);
}

// Analiz sağlayıcısı CSP'de izinli mi
const cspValues = vercel.headers.flatMap((h) => h.headers).filter((x) => /^Content-Security-Policy/.test(x.key)).map((x) => x.value);
const analyticsHost = { umami: site.analytics.umamiSrc && new URL(site.analytics.umamiSrc).origin, plausible: 'https://plausible.io' }[site.analytics.provider];
if (analyticsHost) for (const v of cspValues) if (!v.includes(analyticsHost)) errors.push(`vercel.json CSP: analiz sağlayıcısı ${analyticsHost} script-src/connect-src'de yok`);

// HTTP düzeyi: vercel.json kurallarının yerel taklidi
const routes = loadRoutes(vercelUrl);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
const exists = (p) => {
  const f = join(dist, decodeURIComponent(p));
  return existsSync(f) && statSync(f).isFile();
};
const get = async (href) => {
  const u = new URL(href);
  if (u.pathname.startsWith('/_vercel/')) return { status: 200, headers: {}, body: '' };
  const r = route(routes, { host: u.host, path: u.pathname, exists });
  const headers = Object.fromEntries(Object.entries(r.headers).map(([k, v]) => [k.toLowerCase(), v]));
  if (headers.location) {
    const loc = new URL(headers.location, href);
    if (!loc.search) loc.search = u.search; // Vercel yönlendirmede sorgu dizesini korur
    headers.location = loc.href;
  }
  if (!r.file) return { status: r.status, headers, body: '' };
  headers['content-type'] ??= types[extname(r.file)] || 'application/octet-stream';
  return { status: r.status, headers, body: readFileSync(join(dist, r.file), 'utf8') };
};
const http = await checkSite({ get, apex: canonicalHost });
for (const e of http.errors) errors.push(`http: ${e}`);
console.log(`check-dist: ${http.passed.length} HTTP kontrolü geçti (vercel.json yerel taklit)`);

for (const w of warnings) console.warn('uyarı:', w);
if (errors.length) {
  for (const e of errors) console.error('HATA:', e);
  process.exit(1);
}
console.log('check-dist: tüm kontroller geçti');
