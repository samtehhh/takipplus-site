// Vercel Serverless Function — bekleme listesi kaydı (Brevo).
// Ortam değişkenleri: BREVO_API_KEY, BREVO_LIST_ID, isteğe bağlı BREVO_DOI_TEMPLATE_ID
// ve BREVO_DOI_REDIRECT_URL. Anahtarlar asla istemciye gönderilmez.
//
// JSON isteğe JSON yanıt döner (site betiği). JS kapalıyken gelen klasik form
// gönderimini de kabul eder ve teşekkür sayfasına yönlendirir.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_PRODUCTS = new Set(['yks', 'genel']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Yalnızca POST kabul edilir.' });
  }

  const isJson = String(req.headers['content-type'] || '').includes('application/json');
  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const reply = (status, message, extra = {}) => {
    if (isJson) return res.status(status).json({ message, ...extra });
    const target = status < 300 ? '/erken-erisim/tesekkurler' : `/erken-erisim/tesekkurler?durum=hata`;
    res.setHeader('Location', target);
    return res.status(303).end();
  };

  // Bot tuzağı doluysa başarı gibi davran, kaydetme.
  if (body.company) return reply(200, 'ok');

  const email = String(body.email || '').trim().toLowerCase();
  const consent = body.consent === true || body.consent === 'yes' || body.consent === 'on';
  const product = ALLOWED_PRODUCTS.has(body.product) ? body.product : 'genel';
  const source = String(body.source || '').slice(0, 80);

  if (!EMAIL_RE.test(email) || email.length > 254) return reply(400, 'Bu e-posta adresi geçerli görünmüyor.');
  if (!consent) return reply(400, 'Aydınlatma metnini onaylaman gerekiyor.');

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !listId) {
    console.error('waitlist: BREVO_API_KEY veya BREVO_LIST_ID tanımlı değil');
    return reply(503, 'Kayıt şu an tamamlanamadı.');
  }

  const attributes = {
    KAYNAK: source,
    URUN: product,
    ONAY_TARIHI: new Date().toISOString(),
    ONAY_METNI: 'kvkk-aydinlatma#bekleme-listesi',
  };

  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  const doubleOptIn = Boolean(templateId);
  const url = doubleOptIn
    ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
    : 'https://api.brevo.com/v3/contacts';
  const payload = doubleOptIn
    ? {
        email,
        includeListIds: [listId],
        templateId,
        redirectionUrl: process.env.BREVO_DOI_REDIRECT_URL || 'https://takipplus.com.tr/erken-erisim/onaylandi',
        attributes,
      }
    : { email, listIds: [listId], updateEnabled: true, attributes };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    // 201 oluşturuldu, 204 güncellendi; "duplicate_parameter" zaten listede demek
    if (r.ok) return reply(200, 'ok', { doubleOptIn });
    const err = await r.json().catch(() => ({}));
    if (err.code === 'duplicate_parameter') return reply(200, 'ok', { doubleOptIn: false });
    console.error('waitlist: brevo', r.status, err.code);
    return reply(502, 'Kayıt şu an tamamlanamadı.');
  } catch (e) {
    console.error('waitlist: ağ hatası', e?.message);
    return reply(502, 'Kayıt şu an tamamlanamadı.');
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return Object.fromEntries(new URLSearchParams(s));
  }
}
