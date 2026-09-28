// dist/ klasörünü vercel.json kurallarıyla sunan yerel sunucu: yönlendirmeler,
// yeniden yazmalar, güvenlik başlıkları (CSP dahil) ve gerçek 404. QA betikleri,
// Lighthouse ve `npm run test:routes` bununla çalışır.
// Kullanım: node scripts/serve.mjs [port] [dist-klasörü]   (varsayılan 4322, ./dist)
// Farklı bir alan adını taklit etmek için isteğe `Host` başlığı ekle.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRoutes, resolve } from './lib/vercel-routing.mjs';

const port = Number(process.argv[2] || process.env.PORT || 4322);
const dist = process.argv[3] || fileURLToPath(new URL('../dist/', import.meta.url));
// VERCEL_JSON ortam değişkeniyle başka bir kural dosyası denenebilir
const routes = loadRoutes(process.env.VERCEL_JSON || new URL('../vercel.json', import.meta.url));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/vnd.microsoft.icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.zip': 'application/zip',
};

const fileFor = (p) => join(dist, decodeURIComponent(p));
const exists = (p) => {
  const f = fileFor(p);
  return existsSync(f) && statSync(f).isFile();
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const host = (req.headers.host || 'localhost').split(':')[0].toLowerCase();

  // Vercel'in çalışma zamanı uçları yerelde yok
  if (url.pathname.startsWith('/_vercel/')) {
    res.writeHead(200, { 'Content-Type': 'text/javascript' }).end('');
    return;
  }

  const r = resolve(routes, { host, path: url.pathname, exists });
  const headers = { ...r.headers };
  if (r.status >= 300 && r.status < 400) {
    res.writeHead(r.status, headers).end();
    return;
  }
  const file = fileFor(r.file);
  if (!headers['Content-Type']) headers['Content-Type'] = types[extname(file)] || 'application/octet-stream';
  // Vercel gibi metin yanıtlarını sıkıştır (Lighthouse ölçümleri canlıya yakın olsun)
  let body = readFileSync(file);
  const accept = String(req.headers['accept-encoding'] || '');
  if (/^(text\/|application\/(json|xml|manifest)|image\/svg)/.test(headers['Content-Type'])) {
    if (/\bbr\b/.test(accept)) {
      body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } });
      headers['Content-Encoding'] = 'br';
    } else if (/\bgzip\b/.test(accept)) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
    headers['Vary'] = 'Accept-Encoding';
  }
  headers['Content-Length'] = body.length;
  res.writeHead(r.status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(port, () => console.log(`dist → http://localhost:${port} (vercel.json kurallarıyla)`));
