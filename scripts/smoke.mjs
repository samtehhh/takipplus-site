// Canlı sitenin kabul testleri: http→https, www→apex, eski adresler tek 301,
// olmayan sayfa gerçek 404, güvenlik başlıkları, .well-known dosyaları,
// sitemap'teki her adresin 200 ve kanonik olması, *.vercel.app noindex.
//
//   npm run test:live                 (https://takipplus.com.tr)
//   node scripts/smoke.mjs <alan-adı>
//
// Test listesi scripts/lib/site-checks.mjs içinde; aynı testler derleme
// sırasında vercel.json'un yerel taklidine karşı da çalışır.
import http from 'node:http';
import https from 'node:https';
import { canonicalHost } from '../src/config/site.js';
import { checkSite } from './lib/site-checks.mjs';

const apex = process.argv[2] || canonicalHost;

const get = (url) =>
  new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request(
      u,
      { method: 'GET', headers: { 'accept-encoding': 'br, gzip', 'user-agent': 'takipplus-smoke/1.0' }, timeout: 20_000 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', async () => {
          let buf = Buffer.concat(chunks);
          const enc = res.headers['content-encoding'];
          const zlib = await import('node:zlib');
          if (enc === 'br') buf = zlib.brotliDecompressSync(buf);
          else if (enc === 'gzip') buf = zlib.gunzipSync(buf);
          resolve({ status: res.statusCode, headers: res.headers, body: buf.toString('utf8') });
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error(`zaman aşımı: ${url}`)));
    req.on('error', reject);
    req.end();
  });

const { errors, passed } = await checkSite({ get, apex, live: true });
console.log(`smoke: ${apex} — ${passed.length} kontrol geçti, ${errors.length} hata`);
for (const e of errors) console.error('HATA:', e);
process.exit(errors.length ? 1 : 0);
