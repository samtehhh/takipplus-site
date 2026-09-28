// Sitemap `lastmod` değerleri: her sayfanın içeriğini üreten kaynak dosyaların
// son commit tarihi (git). Tarih bilinemiyorsa o sayfaya lastmod yazılmaz;
// yanlış bir tarih, hiç tarih olmamasından daha kötüdür (Google güvenmeyi bırakır).
//
// Çıktı: src/data/generated/lastmod.json  { "/yks": "2026-09-28T01:02:03+03:00", ... }
// prebuild içinde çalışır; astro.config.mjs sitemap'e bu dosyadan tarih ekler.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let available = true;
try {
  git('rev-parse', '--git-dir');
} catch {
  available = false;
}

// Vercel ve CI sığ klon yapar; geçmiş eksikse tamamlamayı dene.
if (available && git('rev-parse', '--is-shallow-repository') === 'true') {
  try {
    execFileSync('git', ['fetch', '--unshallow', '--quiet'], { cwd: root, stdio: 'ignore', timeout: 60_000 });
  } catch {
    /* ağ ya da uzak depo yoksa sığ geçmişle devam */
  }
}

// Sığ klonun sınır commit'i, o ana kadarki bütün dosyaları "eklemiş" görünür.
// Böyle bir tarih gerçek değişiklik tarihi değildir, kullanılmaz.
const shallowFile = available ? git('rev-parse', '--git-path', 'shallow') : '';
const boundary = new Set(shallowFile && existsSync(`${root}/${shallowFile}`) ? readFileSync(`${root}/${shallowFile}`, 'utf8').split('\n').filter(Boolean) : []);

function lastChange(files) {
  if (!available) return null;
  const out = git('log', '-1', '--format=%H %cI', '--', ...files);
  if (!out) return null;
  const [sha, date] = out.split(' ');
  return boundary.has(sha) ? null : date;
}

const pages = {};
const pageDir = 'src/pages';
for (const f of readdirSync(`${root}/${pageDir}`)) {
  if (!f.endsWith('.astro') || f.startsWith('[') || f === '404.astro') continue;
  const route = f === 'index.astro' ? '/' : `/${f.replace(/\.astro$/, '')}`;
  pages[route] = [`${pageDir}/${f}`];
}
// Ürün sayfaları: src/data/product-content/<slug>.ts başına bir sayfa
for (const f of readdirSync(`${root}/src/data/product-content`)) {
  const slug = f.replace(/\.ts$/, '');
  pages[`/${slug}`] = [
    'src/pages/[product].astro',
    `src/data/product-content/${f}`,
    'src/data/products.ts',
    'src/components/mockups',
  ];
}

const result = {};
for (const [route, files] of Object.entries(pages)) {
  const d = lastChange(files);
  if (d) result[route] = d;
}

// Rehber yazıları: tarih yazının kendi ön bilgisinden (updated, yoksa published)
const rehberDir = `${root}/src/content/rehber`;
const postDates = [];
if (existsSync(rehberDir)) {
  for (const f of readdirSync(rehberDir).filter((x) => x.endsWith('.md') && !x.startsWith('_'))) {
    const fm = readFileSync(`${rehberDir}/${f}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const field = (k) => fm.match(new RegExp(String.raw`^${k}:\s*['"]?([^'"\r\n]+)`, 'm'))?.[1];
    if (field('draft') === 'true') continue;
    const date = field('updated') || field('published');
    if (!date || Number.isNaN(Date.parse(date))) continue;
    const iso = new Date(date).toISOString();
    result[`/rehber/${f.replace(/\.md$/, '')}`] = iso;
    postDates.push(iso);
  }
  if (postDates.length) result['/rehber'] = postDates.sort().at(-1);
}

mkdirSync(`${root}/src/data/generated`, { recursive: true });
writeFileSync(`${root}/src/data/generated/lastmod.json`, JSON.stringify(result, null, 2) + '\n');
const missing = Object.keys(pages).filter((r) => !result[r]);
console.log(`lastmod: ${Object.keys(result).length} sayfa tarihlendi${missing.length ? `, tarihsiz: ${missing.join(', ')}` : ''}`);
