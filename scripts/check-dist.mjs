// Derleme sonrası kontroller: kırık iç link/varlık, eksik çapa, sayfa başına
// tek H1, başlık/açıklama uzunlukları, canonical/OG, CSP'yi bozacak satır içi
// betik ve eski URL yönlendirmeleri. Hata varsa derleme başarısız olur.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
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

for (const [url, html] of pages) {
  const where = url;
  const isNoindex = /name="robots" content="noindex/.test(html);
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
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
  const t = title.replace(/&amp;/g, '&');
  if (!t || t.length > 60) (isNoindex ? warnings : errors).push(`${where}: title ${t.length} karakter "${t}"`);
  if (!desc || desc.length > 155) (isNoindex ? warnings : errors).push(`${where}: description ${desc.length} karakter`);
  if (!/rel="canonical"/.test(html)) errors.push(`${where}: canonical yok`);
  const og = html.match(/property="og:image" content="https:\/\/[^/]+([^"]+)"/)?.[1];
  if (!og || !resolve(og)) errors.push(`${where}: og:image dosyası yok (${og})`);
  // CSP: satır içi çalıştırılabilir betik olmamalı
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/g)) errors.push(`${where}: satır içi betik CSP'ye takılır → ${m[0]}`);
  if (/\son[a-z]+="/.test(html)) errors.push(`${where}: satır içi olay işleyici (onclick vb.)`);
}

// Eski URL'ler ve uygulamanın açtığı adresler
for (const legacy of ['/index.html', '/gizlilik-politikasi.html', '/kullanim-sartlari.html']) {
  const r = vercel.redirects.find((x) => x.source === legacy);
  if (!r) errors.push(`vercel.json: ${legacy} için yönlendirme yok`);
  else if (r.statusCode !== 301) errors.push(`vercel.json: ${legacy} yönlendirmesi 301 değil`);
  else if (!resolve(r.destination)) errors.push(`vercel.json: ${legacy} → ${r.destination} hedefi yok`);
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

for (const w of warnings) console.warn('uyarı:', w);
if (errors.length) {
  for (const e of errors) console.error('HATA:', e);
  process.exit(1);
}
console.log('check-dist: tüm kontroller geçti');
