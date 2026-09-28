// CSP ihlal raporlarını toplar (vercel.json → report-uri /api/csp-report).
// Raporlar yalnızca Vercel fonksiyon loglarına yazılır: Vercel › Project ›
// Logs, "csp-report" ile filtrele. Kişisel veri tutulmaz; sayfa adresinden
// sorgu dizesi atılır, IP loglanmaz.
//
// Web API imzası (Request → Response): tarayıcılar raporu
// `application/csp-report` türüyle gönderir, gövde ham metin olarak okunur.
const MAX_BYTES = 8 * 1024;

const clip = (v) => String(v ?? '').slice(0, 200);
const pathOf = (u) => {
  try {
    return new URL(u).pathname;
  } catch {
    return '?';
  }
};

export async function POST(request) {
  const done = (status) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) return done(413);

  let body;
  try {
    body = JSON.parse((await request.text()).slice(0, MAX_BYTES));
  } catch {
    return done(400);
  }
  // Eski biçim: { "csp-report": {...} }; Reporting API: [{ type, body }]
  const reports = Array.isArray(body) ? body.map((r) => r?.body) : [body?.['csp-report']];
  for (const r of reports.slice(0, 5)) {
    if (!r || typeof r !== 'object') continue;
    console.log(
      'csp-report',
      JSON.stringify({
        mode: clip(r.disposition || 'enforce'),
        directive: clip(r['effective-directive'] || r.effectiveDirective || r['violated-directive']),
        blocked: clip(r['blocked-uri'] || r.blockedURL),
        page: pathOf(r['document-uri'] || r.documentURL),
        source: clip(r['source-file'] || r.sourceFile),
        sample: clip(r['script-sample'] || r.sample),
      }),
    );
  }
  return done(204);
}
