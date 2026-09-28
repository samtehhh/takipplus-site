// vercel.json'u Vercel'in kendi dönüştürücüsüyle (@vercel/routing-utils) rota
// tablosuna çevirip bir isteği bu tabloya göre çözer. Yerel sunucu
// (scripts/serve.mjs) ve yayın öncesi yönlendirme/başlık testleri bunu kullanır.
//
// Taklit edilen davranış: sıralı rotalar, `continue` ile biriken başlıklar,
// `has`/`missing` (host), 3xx yönlendirmeler, `handle: filesystem`, `check`
// ile yeniden yazma ve eşleşme yoksa 404.html. Taklit edilmeyen: Vercel'in alan
// adı düzeyindeki yönlendirmeleri ve http→https yükseltmesi (bunlar yalnızca
// canlıda test edilebilir).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getTransformedRoutes } = require('@vercel/routing-utils');

export function loadRoutes(vercelJsonUrl) {
  const cfg = JSON.parse(readFileSync(vercelJsonUrl, 'utf8'));
  const { routes, error } = getTransformedRoutes({
    cleanUrls: cfg.cleanUrls,
    trailingSlash: cfg.trailingSlash,
    redirects: cfg.redirects,
    rewrites: cfg.rewrites,
    headers: cfg.headers,
  });
  if (error) throw new Error(`vercel.json dönüştürülemedi: ${error.message}`);
  return routes;
}

// Next.js/Vercel `has` eşleşmesi: değer, başı ve sonu sabitlenmiş bir regex.
function conditionsPass(route, host) {
  const test = (c) => c.type === 'host' && new RegExp(`^${c.value}$`).test(host);
  if (route.has && !route.has.every(test)) return false;
  if (route.missing && route.missing.some(test)) return false;
  return true;
}

const fill = (template, m) =>
  template.replace(/\$(\d+)/g, (_, i) => m[Number(i)] ?? '').replace(/\$([a-zA-Z_]\w*)/g, (_, n) => m.groups?.[n] ?? '');

/**
 * @param {object[]} routes  loadRoutes() çıktısı
 * @param {{ host: string, path: string, exists: (path: string) => boolean }} req
 * @returns {{ status: number, headers: Record<string,string>, file?: string }}
 */
export function resolve(routes, { host, path, exists }) {
  const headers = {};
  let current = path;
  let phase = 'pre';
  for (const route of routes) {
    if (route.handle === 'filesystem') {
      const file = fsLookup(current, exists);
      if (file) return { status: 200, headers, file };
      phase = 'post';
      continue;
    }
    if (route.handle) continue;
    if (!conditionsPass(route, host)) continue;
    const m = new RegExp(route.src, 'i').exec(current);
    if (!m) continue;
    if (route.headers) {
      for (const [k, v] of Object.entries(route.headers)) headers[k] = fill(v, m);
    }
    if (route.status && route.status >= 300 && route.status < 400) {
      return { status: route.status, headers };
    }
    if (route.dest) {
      current = fill(route.dest, m);
      if (phase === 'post' && route.check) {
        const file = fsLookup(current, exists);
        if (file) return { status: 200, headers, file };
      }
    }
    if (!route.continue && !route.dest) break;
  }
  const file = phase === 'pre' && fsLookup(current, exists);
  if (file) return { status: 200, headers, file };
  return { status: 404, headers, file: '/404.html' };
}

// Vercel dizin isteklerinde index.html sunar ("/" → "/index.html").
const fsLookup = (p, exists) => (p.endsWith('/') ? (exists(`${p}index.html`) ? `${p}index.html` : null) : exists(p) ? p : null);
