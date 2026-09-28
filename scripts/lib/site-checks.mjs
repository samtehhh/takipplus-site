// HTTP düzeyindeki kabul testleri: yönlendirmeler, durum kodları, güvenlik
// başlıkları, .well-known dosyaları, robots/sitemap ve kanonik etiketler.
//
// Aynı testler iki yerde çalışır:
//   - scripts/check-dist.mjs: derleme sonrası, vercel.json kurallarının yerel
//     taklidine karşı (yayından önce hata yakalamak için)
//   - scripts/smoke.mjs: canlı siteye karşı (deploy sonrası, CI ve elle)
//
// `get(url)` yönlendirmeyi takip etmeden { status, headers, body } döndürür;
// başlık adları küçük harf.

// preview: Vercel önizleme derlemesi (VERCEL_ENV=preview). Sayfalar bilerek
// noindex taşır; kanonik yine production adresidir.
export async function checkSite({ get, apex, live = false, preview = false }) {
  const errors = [];
  const passed = [];
  const origin = `https://${apex}`;
  const ok = (cond, msg) => (cond ? passed.push(msg) : errors.push(msg));

  const follow = async (url, max = 5) => {
    const hops = [];
    let current = url;
    for (let i = 0; i <= max; i++) {
      const r = await get(current);
      if (r.status >= 300 && r.status < 400 && r.headers.location) {
        const next = new URL(r.headers.location, current).href;
        hops.push({ from: current, status: r.status, to: next });
        current = next;
        continue;
      }
      return { final: current, res: r, hops };
    }
    return { final: current, res: { status: 0, headers: {} }, hops, loop: true };
  };

  // Tek adımlık kalıcı yönlendirme: from → (status) → to, hedef 200
  const expectRedirect = async (from, to, status = 301) => {
    const { res, hops, final, loop } = await follow(from);
    const desc = `${from} → ${to}`;
    if (loop) return errors.push(`${desc}: yönlendirme döngüsü`);
    ok(hops.length === 1, `${desc}: ${hops.length} adım (${hops.map((h) => `${h.status} ${h.to}`).join(' → ') || 'yönlendirme yok'})`);
    if (hops.length) ok(hops[0].status === status, `${desc}: durum ${hops[0].status}, beklenen ${status}`);
    ok(final === to, `${desc}: son adres ${final}`);
    ok(res.status === 200, `${desc}: hedef ${res.status} döndü`);
  };

  // 1) Ana sayfa ve güvenlik başlıkları
  const home = await get(`${origin}/`);
  ok(home.status === 200, `/ ${home.status} döndü`);
  const h = home.headers;
  const hsts = h['strict-transport-security'] || '';
  ok(/max-age=(\d+)/.test(hsts) && Number(hsts.match(/max-age=(\d+)/)[1]) >= 31536000 && /includeSubDomains/i.test(hsts) && /preload/i.test(hsts), `HSTS: "${hsts}"`);
  const csp = h['content-security-policy'] || '';
  for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) {
    ok(csp.includes(d), `CSP "${d}" içermeli`);
  }
  const scriptSrc = csp.match(/script-src([^;]*)/)?.[1] ?? '';
  ok(!/'unsafe-inline'|'unsafe-eval'/.test(scriptSrc), `CSP script-src 'unsafe-*' içermemeli: "${scriptSrc.trim()}"`);
  ok(!/'unsafe-inline'/.test(csp), `CSP hiçbir yerde 'unsafe-inline' içermemeli`);
  ok(h['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options: nosniff');
  ok(h['referrer-policy'] === 'strict-origin-when-cross-origin', `Referrer-Policy: ${h['referrer-policy']}`);
  ok(/camera=\(\)/.test(h['permissions-policy'] || ''), 'Permissions-Policy kamera kapalı');
  ok(h['cross-origin-opener-policy'] === 'same-origin', 'Cross-Origin-Opener-Policy: same-origin');
  ok(!/noindex/i.test(h['x-robots-tag'] || ''), `production X-Robots-Tag noindex olmamalı (${h['x-robots-tag'] || 'yok'})`);

  // Önbellek: hash'li varlıklar bir yıl, HTML yeniden doğrulamalı
  const asset = home.body?.match(/(?:href|src)="(\/_assets\/[^"]+)"/)?.[1];
  if (asset) {
    const a = await get(`${origin}${asset}`);
    ok(a.status === 200 && /max-age=31536000/.test(a.headers['cache-control'] || '') && /immutable/.test(a.headers['cache-control'] || ''), `${asset} önbellek: ${a.headers['cache-control']}`);
  } else errors.push('ana sayfada /_assets/ varlığı bulunamadı');
  if (live) ok(/max-age=0|no-cache|must-revalidate/.test(h['cache-control'] || ''), `HTML önbellek: ${h['cache-control']}`);

  // 2) Sitemap: yalnızca 200 dönen, kendine kanonik, indekslenebilir sayfalar
  const smx = await follow(`${origin}/sitemap.xml`);
  ok(smx.res.status === 200 && smx.hops.length === 0, `/sitemap.xml ${smx.res.status}, ${smx.hops.length} yönlendirme`);
  const childMaps = [...(smx.res.body || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const m of childMaps) {
    const r = await get(m.replace(/^https:\/\/[^/]+/, origin));
    ok(r.status === 200, `${m} ${r.status}`);
    for (const u of (r.body || '').matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)) urls.push({ loc: u[1], lastmod: u[2] });
  }
  ok(urls.length > 0, `sitemap'te ${urls.length} adres`);
  for (const { loc, lastmod } of urls) {
    ok(new URL(loc).host === apex, `sitemap adresi kanonik alan adında değil: ${loc}`);
    const r = await get(loc.replace(/^https:\/\/[^/]+/, origin));
    ok(r.status === 200, `sitemap ${loc}: ${r.status}`);
    const canon = r.body?.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    ok(canon === loc, `sitemap ${loc}: canonical ${canon}`);
    const noindex = /<meta name="robots" content="noindex/.test(r.body || '') || /noindex/i.test(r.headers['x-robots-tag'] || '');
    if (preview) ok(noindex, `önizleme ${loc}: noindex olmalı`);
    else ok(!noindex, `sitemap ${loc}: noindex olmamalı`);
    if (lastmod) ok(!Number.isNaN(Date.parse(lastmod)) && Date.parse(lastmod) <= Date.now() + 864e5, `sitemap ${loc}: lastmod geçersiz ${lastmod}`);
  }

  // 3) Uygulamanın açtığı ve eski adresler: tek adımda 301
  const legacy = {
    '/gizlilik-politikasi.html': '/gizlilik',
    '/kullanim-sartlari.html': '/kullanim-sartlari',
    '/index.html': '/',
    '/gizlilik-politikasi': '/gizlilik',
    '/kvkk': '/kvkk-aydinlatma',
    '/hakkinda': '/hakkimizda',
    '/basin': '/marka',
  };
  for (const [from, to] of Object.entries(legacy)) await expectRedirect(`${origin}${from}`, `${origin}${to}`);
  // www → apex (eski adresler dahil tek adım)
  await expectRedirect(`https://www.${apex}/`, `${origin}/`);
  await expectRedirect(`https://www.${apex}/yks?kaynak=test`, `${origin}/yks?kaynak=test`);
  await expectRedirect(`https://www.${apex}/gizlilik-politikasi.html`, `${origin}/gizlilik`);
  // .html uzantısı ve sondaki /
  await expectRedirect(`${origin}/yks.html`, `${origin}/yks`);
  await expectRedirect(`${origin}/yks/`, `${origin}/yks`, 308);

  // 4) Gerçek 404
  for (const p of ['/bu-sayfa-yok-7f3a', '/404', '/yks/olmayan', '/rehber-yok']) {
    const r = await get(`${origin}${p}`);
    ok(r.status === 404, `${p}: ${r.status} döndü, 404 bekleniyordu`);
    ok(/Sayfa bulunamadı/.test(r.body || ''), `${p}: markalı 404 sayfası`);
  }

  // 5) .well-known: yönlendirmesiz 200 ve JSON
  for (const p of ['/.well-known/apple-app-site-association', '/.well-known/assetlinks.json']) {
    const r = await get(`${origin}${p}`);
    ok(r.status === 200, `${p}: ${r.status}`);
    ok(/^application\/json/.test(r.headers['content-type'] || ''), `${p}: Content-Type ${r.headers['content-type']}`);
    let parsed = null;
    try {
      parsed = JSON.parse(r.body);
    } catch {
      /* aşağıda raporlanır */
    }
    ok(parsed !== null, `${p}: geçerli JSON`);
  }
  const sec = await get(`${origin}/.well-known/security.txt`);
  ok(sec.status === 200 && /^text\/plain/.test(sec.headers['content-type'] || ''), `security.txt: ${sec.status} ${sec.headers['content-type']}`);
  ok(/^Contact: mailto:/m.test(sec.body || ''), 'security.txt Contact');
  const exp = Date.parse(sec.body?.match(/^Expires: (.+)$/m)?.[1]);
  ok(exp > Date.now() + 30 * 864e5 && exp < Date.now() + 366 * 864e5, `security.txt Expires 30 gün–1 yıl arasında olmalı (${sec.body?.match(/^Expires: (.+)$/m)?.[1]})`);

  // 6) robots.txt
  const robots = await get(`${origin}/robots.txt`);
  ok(robots.status === 200, `robots.txt ${robots.status}`);
  ok((robots.body || '').includes(`Sitemap: ${origin}/sitemap-index.xml`), 'robots.txt sitemap satırı');
  ok(!/^Disallow:\s*\/\s*$/m.test(robots.body || '') && !/Disallow:\s*\/\.well-known/.test(robots.body || ''), 'robots.txt siteyi ya da /.well-known/ yolunu engellememeli');

  // 7) Önizleme ve *.vercel.app adresleri indekslenmez
  const vercelApp = await get('https://takipplus-site.vercel.app/');
  ok(/noindex/i.test(vercelApp.headers['x-robots-tag'] || ''), `takipplus-site.vercel.app X-Robots-Tag: ${vercelApp.headers['x-robots-tag'] || 'yok'}`);

  // 8) Yalnızca canlıda ölçülebilenler
  if (live) {
    const enc = home.headers['content-encoding'];
    ok(enc === 'br' || enc === 'gzip', `sıkıştırma: ${enc || 'yok'}`);
    const plain = await follow(`http://${apex}/`);
    ok(plain.hops.length === 1 && plain.final === `${origin}/`, `http://${apex}/ → ${plain.hops.map((x) => `${x.status} ${x.to}`).join(' → ')}`);
    // http://www: önce aynı adreste https'e (HSTS preload şartı), sonra apex'e
    const plainWww = await follow(`http://www.${apex}/`);
    ok(plainWww.final === `${origin}/` && plainWww.hops.length <= 2, `http://www.${apex}/ → ${plainWww.hops.map((x) => `${x.status} ${x.to}`).join(' → ')}`);
    const insights = await get(`${origin}/_vercel/insights/script.js`);
    if (insights.status !== 200) errors.push(`Vercel Web Analytics betiği ${insights.status} (Vercel › Analytics › Enable)`);
  }

  return { errors, passed };
}
