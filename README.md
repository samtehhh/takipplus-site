# takipplus.com.tr

Takip+ markasının sitesi. Astro ile üretilen statik bir site; Vercel'de yayınlanır. Marka ana sayfası (`/`),
ürün sayfaları (`/yks`), kurumsal ve yasal sayfalar, bekleme listesi formu ve basın kiti içerir.

- Kanonik adres: **https://takipplus.com.tr** (www'suz). `www` ve `http://` tek adımda buraya gelir.
- Marka kuralları: [BRAND.md](BRAND.md)
- Altyapı denetimi (önce/sonra, ölçümler): [docs/altyapi-denetimi.md](docs/altyapi-denetimi.md)

## İçindekiler

1. [Çalıştırma](#çalıştırma)
2. [Yapılandırma: tek dosya](#yapılandırma-tek-dosya)
3. [Yayına alma ve geri alma](#yayına-alma-vercel)
4. [Yönlendirmeler ve URL kuralları](#yönlendirmeler-ve-url-kuralları)
5. [SEO: yeni sayfa, ürün ya da rehber yazısı eklerken](#seo-yeni-sayfa-ürün-ya-da-rehber-yazısı-eklerken)
6. [Güvenlik](#güvenlik)
7. [Uygulama bağlantıları (.well-known)](#uygulama-bağlantıları-well-known)
8. [Ölçüm ve izleme](#ölçüm-ve-izleme)
9. [Otomatik testler (CI)](#otomatik-testler-ci)
10. [DNS ve e-posta kayıtları](#dns-ve-e-posta-kayıtları)
11. [Aylık bakım kontrol listesi](#aylık-bakım-kontrol-listesi)
12. [Senin yapman gerekenler](#senin-yapman-gerekenler)
13. [Kapsam dışı ama önemli (uygulama tarafı)](#kapsam-dışı-ama-önemli-uygulama-tarafı)
14. [İçerik, ürün ve tasarım notları](#i̇çerik-ürün-ve-tasarım-notları)

---

## Çalıştırma

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run serve
```

`dev` geliştirme sunucusudur (http://localhost:4321, CSP yok). `serve`, derlenmiş `dist/` klasörünü
**`vercel.json` kurallarıyla** (yönlendirmeler, yeniden yazmalar, güvenlik başlıkları, CSP, gerçek 404) sunar:
http://localhost:4322. Canlıya en yakın yerel ortam budur. Node 22.12 veya üstü gerekir.

`npm run build` sırasında sırayla:

1. `scripts/lastmod.mjs`: her sayfanın kaynak dosyalarının son commit tarihini okur (sitemap `lastmod`).
2. `scripts/brand-assets.mjs`: `assets/brand/kit/` (marka kiti v1.0) dosyalarından favicon seti, PWA ikonları, basın kiti dosyaları ve `takipplus-marka-kiti.zip`.
3. `scripts/og-images.mjs`: her sayfa için 1200×630 OG görseli (`public/og`).
4. `astro build`: sayfalar, sitemap, `robots.txt`, `.well-known` dosyaları. Derlemenin sonunda
   `scripts/lib/style-attrs.mjs` satır içi `style="…"` özniteliklerini harici bir CSS dosyasına taşır (CSP için).
5. `scripts/check-dist.mjs`: sayfa içi kontroller (aşağıda) ve `vercel.json` kurallarının yerel taklidiyle HTTP
   testleri. **Bir hata varsa derleme başarısız olur ve Vercel o sürümü yayına almaz.**

Diğer komutlar:

| Komut | Ne yapar |
|---|---|
| `npm run test:live` | Canlı site kabul testleri (`scripts/smoke.mjs`): yönlendirmeler, 404, başlıklar, sitemap, `.well-known` |
| `npm run validate:html` | `dist/` HTML doğrulaması (html-validate) |
| `npm run qa:visual -- capture http://localhost:4322 .qa/once` | Tüm sayfaların 7 genişlikte tam sayfa görüntüsü + konsol/CSP ihlali raporu |
| `npm run qa:visual -- compare .qa/once .qa/sonra` | İki çekimi piksel piksel karşılaştırır; tasarımın değişmediğini kanıtlamak için |
| `npm run qa:shots` / `qa:behavior` | Yatay taşma, dokunma hedefi, menü/form davranışı (aşağıda) |
| `npm run fonts` | Font alt kümelerini yeniden üretir (Python: `pip install fonttools brotli`) |

Windows Git Bash'te `/` ile başlayan argümanlar (ör. sayfa listesi `/,/yks`) için komutun başına
`MSYS_NO_PATHCONV=1` ekle, dosya yollarını `C:\...` biçiminde ver.

## Yapılandırma: tek dosya

Bütün değişken değerler **`src/config/site.js`** içinde. Sayfalar, `astro.config.mjs`, derleme betikleri, testler ve
Vercel fonksiyonları aynı dosyayı okur; değerlerin başka yerde kopyası yok. Düz JavaScript olmasının nedeni bu:
her ortam dosyayı derleme adımı olmadan içe aktarabiliyor.

| Alan | Ne işe yarar |
|---|---|
| `site.url` | Kanonik adres. Canonical, OG, sitemap, robots, security.txt, şemalar ve testler buradan. |
| `site.alternateNames` | "Takip Plus", "TakipPlus": Organization ve WebSite şemasında `alternateName` |
| `site.contact.email` / `useDomainEmail` | Sitede, şemada ve security.txt'de görünen adres. Alan adı e-postası hazır olunca `useDomainEmail: true`. |
| `site.social` | Sosyal hesaplar (tam URL). Doluysa footer, iletişim sayfası ve Organization `sameAs`'a girer. |
| `site.analytics.provider` | `vercel` \| `umami` \| `plausible` \| `none` |
| `apps.yks.released` | **Yayın bayrağı.** `true` olunca mağaza rozetleri, Smart App Banner ve MobileApplication şeması devreye girer. |
| `apps.yks.stores` | Google Play ve App Store linkleri, App Store sayısal kimliği |
| `apps.yks.ids` | iOS bundle ID, Apple Team ID, Android paket adı, Play App Signing SHA-256 |
| `pricing.pricingVisible` | Premium fiyatlarını göster/gizle |

"YER TUTUCU" yazan değerler henüz bilinmiyor. Boş bir değer sitede hiçbir yerde kullanılmaz (ör. Team ID boşken
`apple-app-site-association` boş liste döner).

### Yayın günü

`src/config/site.js` → `apps.yks`:

```js
released: true,
stores: {
  googlePlayUrl: 'https://play.google.com/store/apps/details?id=<paket>',
  appStoreUrl: 'https://apps.apple.com/tr/app/<ad>/id<numara>',
  appStoreId: '<numara>',
},
ids: { iosBundleId: 'com.samettondes.takipplus', appleTeamId: '<TEAMID>', androidPackage: '<paket>', androidSha256: ['<SHA-256>'] },
```

Bununla birlikte otomatik olarak:

- "Erken erişime katıl" butonları resmi Google Play ve App Store rozetlerine döner. Rozetleri resmi kaynaklardan
  indirip **değiştirmeden** koy: `public/badges/google-play-tr.png` ([Google Play rozetleri](https://play.google.com/intl/en_us/badges/))
  ve `public/badges/app-store-tr.svg` ([Apple Marketing Tools](https://tools.applemarketingtools.com/)).
- Kullanıcının cihazına göre ilgili mağaza öne alınır.
- `appStoreId` doluysa iOS Safari'de Smart App Banner (`apple-itunes-app`) çıkar.
- `/yks` sayfasına `MobileApplication` şeması eklenir (`downloadUrl`, ücretsiz indirme için `offers` fiyat 0).
  `aggregateRating` hiçbir zaman elle yazılmaz; derleme kontrolü şemada puan/yorum görürse hata verir.
- `.well-known` dosyaları paket bilgileriyle dolar (App Links / Universal Links).

Yayından sonra deploy'u bekle, `npm run test:live` çalıştır ve [Rich Results Test](https://search.google.com/test/rich-results)
ile `/yks`'i kontrol et.

## Yayına alma (Vercel)

`main` dalına push = production deploy. `vercel.json` framework, derleme komutu, çıktı klasörü, yönlendirmeler,
güvenlik başlıkları ve önbellek kurallarını içerir.

**Ortam değişkenleri** (Vercel › Project › Settings › Environment Variables). Değerler yalnızca Vercel'de durur;
depoda `.env` yoktur (`.gitignore` kapsıyor), örnek dosya `.env.example`.

| Değişken | Ne işe yarar |
|---|---|
| `BREVO_API_KEY` | Bekleme listesi formu (`api/waitlist.js`) için Brevo API anahtarı |
| `BREVO_LIST_ID` | Kayıtların ekleneceği Brevo liste kimliği |
| `BREVO_DOI_TEMPLATE_ID` | Çift onay (double opt-in) e-posta şablonu. Boşsa kişi doğrudan listeye eklenir. |
| `BREVO_DOI_REDIRECT_URL` | Onay bağlantısından sonra dönülecek sayfa (varsayılan `/erken-erisim/onaylandi`) |
| `VERCEL_ENV` | Vercel'in kendisi verir. `preview` derlemelerinde sayfalara `noindex` eklenir. |

Bekleme listesi formu kaldırılacağı için form arka ucu bu çalışmada güçlendirilmedi. Form kalkana kadar yukarıdaki
değişkenler tanımlı değilse gönderimler "Kayıt şu an tamamlanamadı" hatası verir.

**Her deploy'dan sonra** (GitHub Actions bunu otomatik de yapar):

```bash
npm run test:live
```

Uygulamanın Premium ekranından açılan iki adres özellikle test edilir; ikisi de tek adımda 301 ile hedefe gider:
`/gizlilik-politikasi.html` → `/gizlilik`, `/kullanim-sartlari.html` → `/kullanim-sartlari`. Uygulamanın bir sonraki
sürümünde linkleri doğrudan yeni adreslere çevirmek iyi olur; yönlendirmeler yine de kalıcı olarak kalmalı.

### Geri alma (rollback)

Yayındaki sürüm bozulursa, kod düzeltmesini beklemeden:

1. Vercel › Project › **Deployments**.
2. Sorunsuz olduğu bilinen son production deploy'unun yanındaki `⋯` › **Instant Rollback** (Hobby planda bir önceki
   production deploy'una dönülebilir; daha eskisi için o deploy'da **Promote to Production**).
3. Alan adı saniyeler içinde eski sürüme döner. `npm run test:live` ile doğrula.
4. Instant Rollback sonrası Vercel otomatik yayını durdurur; düzeltmeyi push ettikten sonra Deployments'ta
   "Undo Rollback" / yeni deploy'u **Promote** et.

Alternatif: `git revert <commit>` ve push (yeni bir deploy üretir, ~1 dakika).

## Yönlendirmeler ve URL kuralları

- **Kanonik:** `https://takipplus.com.tr`, sonda `/` yok, `.html` uzantısı yok.
- `http://` → `https://`: Vercel yapar (308, aynı alan adında). HSTS preload listesinin şartı da budur; bu yüzden
  `http://www.` iki adımdır (`http://www` → `https://www` → `https://takipplus.com.tr`). HSTS önbelleğe girdikten
  sonra tarayıcı `http://` isteğini hiç yapmaz.
- `www` → apex: `vercel.json` içinde, host koşuluyla, **301, tek adım**, yol ve sorgu dizesi korunur.
- Eski adresler doğrudan kanonik hedefe (tek adım, 301):

| Eski | Yeni |
|---|---|
| `/index.html`, `/index` | `/` |
| `/gizlilik-politikasi.html`, `/gizlilik-politikasi` | `/gizlilik` |
| `/kullanim-sartlari.html` | `/kullanim-sartlari` |
| `/kvkk`, `/hakkinda`, `/basin` | `/kvkk-aydinlatma`, `/hakkimizda`, `/marka` |
| Diğer her `/<sayfa>.html` | `/<sayfa>` |
| `/<sayfa>/` | `/<sayfa>` (308, Vercel `trailingSlash: false`) |

- Olmayan her adres **404 durum koduyla** markalı 404 sayfasını döner (`/404` dahil).
- `/sitemap.xml` → `sitemap-index.xml` (yeniden yazma, yönlendirme değil).

**Neden `cleanUrls: false`:** Vercel'in `cleanUrls: true` seçeneği kendi 308 `.html` yönlendirmesini bizim
kurallarımızdan **önce** çalıştırıyor; `/gizlilik-politikasi.html` iki adım (308 + 301) olurdu. Bunun yerine `.html`
dosyaları `rewrites` ile uzantısız sunuluyor, `.html`'li istekler tek 301 ile temizleniyor. Bu, Vercel'in kendi
kural derleyicisiyle (`@vercel/routing-utils`) doğrulandı.

**Kuralları değiştirirken:** `npm run build` yeterli; `check-dist` `vercel.json`'u Vercel'in kendi derleyicisinden
geçirip bütün yönlendirme/404/başlık testlerini yerelde çalıştırır. Bu sayede ör. `/:path*` kalıbının kök adresi
(`/`) yakalamadığı yayından önce fark edildi.

## SEO: yeni sayfa, ürün ya da rehber yazısı eklerken

Sitemap, canonical, OG/Twitter etiketleri, breadcrumb şeması ve `lastmod` otomatik. Senin yapman gerekenler:

**Yeni sayfa** (`src/pages/<ad>.astro`):
1. `Base` bileşenine benzersiz `title` (≤ 60 karakter; " | Takip+" otomatik eklenir) ve `description` (≤ 155) ver.
2. `path="/<ad>"` ve `breadcrumbs={[{ name: '…', path: '/<ad>' }]}` ekle; tek `<h1>` kullan.
3. OG görseli için `scripts/og-images.mjs` içindeki `pages` nesnesine bir satır ekle, `ogImage="<ad>"` ver.
4. İndekslenmemesi gerekiyorsa `noindex` ver (sitemap'e girmez; `astro.config.mjs` → `noIndex` listesine de ekle).
5. Footer/header'dan link ver (`src/data/nav.ts`). `npm run build`: uzunluklar, canonical, şema ve linkler kontrol edilir.

**Yeni ürün:**
1. `src/data/products.ts` listesine görünen bilgileri (`name`, `slug`, renkler, `status`, `tagline`) ekle.
2. `src/config/site.js` → `apps.<slug>` altına yayın bayrağı, mağaza linkleri ve kimlikleri ekle; kaydı
   `products.ts`'te `...apps.<slug>` ile bağla.
3. `src/data/product-content/<slug>.ts`: `yks.ts`'i örnek al. `seo.title` içinde ürün adı ve arama ifadesi, marka
   varyantı ("Takip Plus") geçsin; SSS yazarsan FAQPage şeması otomatik oluşur.
4. `scripts/og-images.mjs` → `pages` içine `<slug>` satırı.
5. Ürüne özel mockup gerekiyorsa `src/components/mockups/` altına ekleyip `[product].astro` içindeki eşlemeye bağla.

`status: 'planned'` olan ürünler hiçbir yerde görünmez.

**Rehber yazısı:** `src/content/rehber/_sablon.md`'yi kopyala (`tyt-net-hesaplama.md` gibi). Başlık ≤ 60, açıklama ≤ 155
karakter, `published` zorunlu, güncellemede `updated` ekle. `Article` şeması (yazar, `datePublished`, `dateModified`)
ve sitemap tarihi ön bilgiden gelir. İlk yazı eklenince `/rehber` listesi de oluşur.

**Doğruluk kuralı:** Şemaya, meta etiketlerine ya da OG görsellerine uygulamada olmayan bir özellik, uydurma puan,
yorum veya kullanıcı sayısı girilmez.

## Güvenlik

### HTTP başlıkları (`vercel.json`)

| Başlık | Değer |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `img-src 'self' data:`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`, `report-uri /api/csp-report` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | kamera, mikrofon, konum, ödeme, USB, sensörler, ekran yakalama, Topics kapalı |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Frame-Options` | `DENY` (eski tarayıcılar için) |
| `X-Robots-Tag: noindex` | `*.vercel.app` adresleri ve `/erken-erisim/*` |

**CSP'de `unsafe-inline` yok.** Bunu mümkün kılan iki şey:

- CSS harici dosyalarda (`astro.config.mjs` → `inlineStylesheets: 'never'`).
- Bileşenlerdeki `style="…"` öznitelikleri derlemenin sonunda sınıfa çevrilip `/_assets/attrs.<hash>.css` dosyasına
  taşınıyor (`scripts/lib/style-attrs.mjs`). Bileşen yazarken style özniteliği kullanmaya devam edebilirsin.
  Görünüm aynı: dönüşümden önce ve sonra 10 sayfa × 7 genişlik piksel piksel karşılaştırıldı.
- Satır içi `<script>` ya da `onclick` gibi işleyiciler yasak; `check-dist` bulursa derlemeyi durdurur. JSON-LD
  (`application/ld+json`) çalıştırılmadığı için CSP'ye takılmaz.

**CSP değişikliği nasıl yapılır:** Yeni politikayı önce `Content-Security-Policy-Report-Only` başlığıyla yayına al,
sitede gezin ve `qa:visual capture` çalıştır (CSP ihlallerini raporlar), Vercel › Logs'ta `csp-report` satırlarına bak.
İhlal yoksa zorunlu başlığa taşı. Üçüncü taraf bir betik (analiz, form servisi) eklenirse alan adı `script-src` ve
`connect-src`'ye eklenmeli; `check-dist` seçili analiz sağlayıcısının CSP'de olup olmadığını denetler.

### Gizli bilgiler ve bağımlılıklar

- API anahtarları yalnızca Vercel ortam değişkenlerinde. Depoda `.env` yok; `.gitignore` `.env` ve `.env.*`'ı kapsar.
- Git geçmişi tarandı (28 Eylül 2026, 14 commit): sızmış anahtar yok. CI'da her push'ta gitleaks tüm geçmişi tarar;
  GitHub secret scanning ve push protection açık.
- `package-lock.json` depoda. CI yayına giden paketlerde `npm audit --audit-level=high` çalıştırır. Dependabot
  haftalık sürüm güncellemesi (`.github/dependabot.yml`) ve güvenlik güncellemeleri açık.
- Bilinen durum: `satori` (yalnızca derlemede OG görseli üretir) üzerinden `fflate`'te orta seviye bir bulgu var;
  yayına giden koda girmiyor. Düzeltilmiş sürüm çıkınca Dependabot PR açar.

## Uygulama bağlantıları (.well-known)

| Dosya | Kaynak | Durum |
|---|---|---|
| `/.well-known/apple-app-site-association` | `apps.*.ids.appleTeamId` + `iosBundleId` → `appIDs: ["<TEAMID>.com.samettondes.takipplus"]` | Team ID boş → `details: []` |
| `/.well-known/assetlinks.json` | `apps.*.ids.androidPackage` + `androidSha256` | Boş → `[]` |
| `/.well-known/security.txt` | `contactEmail`; `Expires` = derleme + 180 gün | Aktif |

Üçü de uzantı ve yönlendirme kurallarından etkilenmez, `200` ve doğru `Content-Type` ile döner (AASA uzantısız,
`application/json`). `npm run test:live` bunları her deploy'da test eder.

## Ölçüm ve izleme

**Analiz:** Vercel Web Analytics. Çerez kullanmaz ve ziyaretçi verisini zaten sitenin barındığı Vercel'den başka bir
yere taşımaz; bu yüzden çerez/izin banner'ı gerekmez. **İleride çerez kullanan bir araç (ör. Google Analytics, Meta
Pixel) eklenirse KVKK kapsamında açık rıza ve bir onay mekanizması zorunlu olur;** araç, onay verilmeden yüklenmemeli.

Olaylar `data-track` öznitelikleriyle gönderilir: `cta_hero`, `cta_header`, `cta_menu`, `cta_sticky`,
`cta_early_access`, `waitlist_submit`, `waitlist_signup`, `waitlist_error`, `store_google_play`, `store_app_store`.
**Hobby planda Vercel özel olayları raporlamaz** (yalnızca sayfa görüntüleme). Olayları görmek için ya Pro plana geç
ya da `site.analytics.provider = 'umami'` yapıp Umami Cloud (ücretsiz katman) kimliğini gir; bu durumda Umami'nin
alan adını `vercel.json` CSP'sinde `script-src` ve `connect-src`'ye ekle (`check-dist` eksikse uyarır).

**Canlı izleme:**
- GitHub Actions "Canlı test" iş akışı her production deploy'undan sonra ve her gün 08:17'de `scripts/smoke.mjs`'i
  çalıştırır; başarısız olursa GitHub e-posta gönderir.
- Dakikalık erişilebilirlik için UptimeRobot (ücretsiz) önerilir, bkz. [Senin yapman gerekenler](#senin-yapman-gerekenler).
- CSP ihlalleri: Vercel › Logs, `csp-report` araması.
- Core Web Vitals (gerçek kullanıcı): yayından sonra Search Console › Core Web Vitals ve PageSpeed Insights.

## Otomatik testler (CI)

`.github/workflows/ci.yml`, her push ve PR'da:

| Adım | Ne kontrol eder |
|---|---|
| `npm audit --omit=dev --audit-level=high` | Yayına giden bağımlılıklarda yüksek/kritik açık |
| `npm run build` | Derleme + `check-dist`: kırık iç link/varlık/çapa, tek H1, başlık/açıklama uzunluğu, canonical = production ve kendisi, OG 1200×630, `lang="tr"`, satır içi betik/stil yok, JSON-LD geçerli ve doğruluk kuralları, sitemap ↔ sayfalar, ana sayfa < 500 KB; `vercel.json` taklidiyle 130+ HTTP testi |
| html-validate | HTML doğrulaması (`.htmlvalidate.mjs`) |
| lychee | Kırık link (iç + dış) |
| Lighthouse CI (`lighthouserc.json`) | Mobil: Performans ≥ 95, Erişilebilirlik / En İyi Uyg. / SEO = 100, LCP ≤ 2 sn, CLS ≤ 0,05, TBT ≤ 200 ms, sayfa ≤ 500 KB |
| gitleaks | Tüm git geçmişinde gizli anahtar |

`.github/workflows/smoke.yml`: production deploy sonrası + günlük canlı testler (`scripts/smoke.mjs`): http→https,
www→apex, eski adresler tek 301, olmayan sayfa gerçek 404, güvenlik başlıkları, `.well-known` 200 + JSON,
`*.vercel.app` noindex, sitemap'teki her adres 200 + kanonik, sıkıştırma, Web Analytics betiği.

## DNS ve e-posta kayıtları

Alan adı Metunic'te, DNS de orada (`ns1/ns2.metunic.com.tr`).

| Kayıt | Ne işe yarar | Durum (28 Eylül 2026) |
|---|---|---|
| `A @ 76.76.21.21` (ve Vercel'in verdiği diğerleri), `CNAME www → …vercel-dns…` | Siteyi Vercel'e bağlar | Var |
| **CAA** | Hangi sertifika sağlayıcılarının bu alan adına sertifika verebileceğini sınırlar | Yok |
| **DNSSEC** (DS kaydı) | DNS yanıtlarının sahte olmadığını imzayla kanıtlar; `.tr` bölgesi imzalı, destekleniyor | Kapalı |
| **MX** | Gelen e-postanın hangi sunucuya gideceği | Yok (alan adı e-postası kurulmadı) |
| **SPF** (`TXT @ v=spf1 …`) | Bu alan adı adına hangi sunucuların e-posta gönderebileceği | Yok |
| **DKIM** (`TXT <seçici>._domainkey`) | Giden e-postaya imza atar; alıcı, e-postanın yolda değişmediğini ve gerçekten senden geldiğini doğrular | Yok |
| **DMARC** (`TXT _dmarc`) | SPF/DKIM'i geçemeyen e-postaya ne yapılacağını söyler ve sana rapor gönderttirir | Yok |

**CAA:** Vercel'in kendi DNS'inde yayınladığı CAA listesiyle aynı sağlayıcılar (www bu listeyi CNAME üzerinden zaten
kullanıyor). Tek sağlayıcıyla sınırlamak, Vercel sağlayıcı değiştirdiğinde sertifika yenilemesini kırar.

```
takipplus.com.tr.  CAA  0 issue "letsencrypt.org"
takipplus.com.tr.  CAA  0 issue "pki.goog"
takipplus.com.tr.  CAA  0 issue "sectigo.com"
takipplus.com.tr.  CAA  0 issue "globalsign.com"
takipplus.com.tr.  CAA  0 iodef "mailto:contact.takipplus@gmail.com"
```

**E-posta, şimdilik (alan adından hiç e-posta gönderilmiyorken):** başkalarının `@takipplus.com.tr` adına sahte e-posta
atmasını engellemek için:

```
takipplus.com.tr.         TXT  "v=spf1 -all"
_dmarc.takipplus.com.tr.  TXT  "v=DMARC1; p=reject; adkim=s; aspf=s"
```

**E-posta kurulunca (`iletisim@takipplus.com.tr`):** e-posta sağlayıcısının (Google Workspace, Zoho, Yandex vb.)
verdiği MX, SPF ve DKIM kayıtlarını gir; yukarıdaki iki kaydı değiştir:

```
takipplus.com.tr.         TXT  "v=spf1 include:<sağlayıcının SPF alanı> -all"
_dmarc.takipplus.com.tr.  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@takipplus.com.tr; adkim=s; aspf=s"
```

DMARC'ı `p=none` ile başlat, 2–4 hafta raporları izle (her şey SPF/DKIM'den geçiyorsa), sonra `p=quarantine`,
bir süre sonra `p=reject`. Form ya da duyuru e-postaları için başka bir servis (ör. Brevo) kullanılırsa onun SPF
`include`'u ve DKIM kaydı da eklenmeli, yoksa bu e-postalar DMARC'tan kalır.

## Aylık bakım kontrol listesi

- [ ] GitHub › Actions: "CI" ve "Canlı test" son çalışmaları yeşil mi?
- [ ] `npm run test:live` yerelde de geçiyor mu?
- [ ] Dependabot PR'ları: incele, CI yeşilse birleştir.
- [ ] Search Console: Kapsam/Sayfalar (indekslenmeyen sayfa, 404, yönlendirme hatası), Core Web Vitals, Geliştirmeler
      (Breadcrumb, SSS), Güvenlik sorunları, Elle işlemler.
- [ ] Vercel › Logs: `csp-report` satırları, 5xx hataları.
- [ ] `/.well-known/security.txt` `Expires` tarihi 1 aydan yakınsa yeni bir deploy yap (her deploy tarihi yeniler).
- [ ] SSL Labs ve securityheaders.com notu değişmemiş mi?
- [ ] Alan adı bitiş tarihi, otomatik yenileme ve Metunic'te transfer kilidi.
- [ ] Yasal sayfalarda değişiklik varsa `updated` tarihi ve (gerekiyorsa) hukuk onayı.

## Senin yapman gerekenler

Kodun dışında kalan, yalnızca senin hesaplarınla yapılabilecek işler. Sırası önemli olanlar numaralı.

**Alan adı ve yayın**

1. ~~Vercel › Domains: `takipplus.com.tr` Production'a bağlandı, yönlendirme kaldırıldı~~ (28 Eylül 2026, yapıldı).
   Kalıcı kural: iki alan adı da Production'a bağlı kalmalı, panelde **apex → www yönlendirmesi asla açılmamalı**;
   www→apex 301'i `vercel.json` yapıyor, ikisi birlikte döngü oluşturur.
2. **Vercel › Project › Analytics › Enable** (Web Analytics). Açılmazsa her sayfada analiz betiği 404 verir.
3. **Google Search Console:** "Alan adı" mülkü ekle (`takipplus.com.tr`), verilen `TXT` kaydını Metunic DNS'e gir,
   doğrula. Sitemaps › `https://takipplus.com.tr/sitemap-index.xml` gönder. URL Denetimi ile `/`, `/yks`,
   `/hakkimizda` için "Dizine eklenmesini iste". Eski `www` mülkün varsa kalsın; alan adı mülkü ikisini de kapsar.
4. **Bing Webmaster Tools:** "Search Console'dan içe aktar" ile tek tıkla.
5. **Rich Results Test** (Google girişi istiyor, bu yüzden otomatik yapılamadı): https://search.google.com/test/rich-results
   ile `https://takipplus.com.tr/` ve `/yks`'i test et. Beklenen: Breadcrumb ve SSS "geçerli", hata yok. (Schema Markup
   Validator'da ikisi de 0 hata, 0 uyarı.)

**DNS (Metunic paneli)**

6. **Eski Vercel IP'sini kaldır:** apex'te iki A kaydı var (`76.76.21.21` ve `216.198.79.1`). Vercel Domains ekranı
   "DNS Change Recommended" diyor; "View DNS configuration"da önerilen kaydı bırak, `76.76.21.21`'i sil. SSL Labs yeni
   IP'ye A+, eskisine A veriyor (eski uçta HSTS görünmüyor).
7. CAA kayıtları ([yukarıda](#dns-ve-e-posta-kayıtları)).
8. DNSSEC'i aç (Metunic panelinde varsa "DNSSEC" ya da destekten talep). `.tr` imzalı olduğu için mümkün.
9. Şimdilik `v=spf1 -all` ve DMARC `p=reject` kayıtları. Alan adı e-postasını kurunca MX/SPF/DKIM/DMARC `p=none` ile
   değiştir ve `src/config/site.js` → `useDomainEmail: true`.

**Hesap güvenliği**

10. İki adımlı doğrulama (tercihen uygulama ya da güvenlik anahtarı, SMS değil): Vercel, GitHub, Metunic, Google hesabı.
11. Metunic: alan adı **transfer kilidi** açık, **otomatik yenileme** açık, iletişim e-postası erişebildiğin bir adres.
12. **HSTS preload:** eski A kaydı (6. madde) kaldırılıp `npm run test:live` temiz geçtikten sonra https://hstspreload.org/ adresine
    `takipplus.com.tr` gir. Önce şunu kabul et: listeye girdikten sonra **bütün alt alan adları** (gelecekte açılacak
    `api.`, `panel.`, `mail.` dahil) yalnızca HTTPS ile çalışabilir; listeden çıkmak aylar sürer. Şu an tek alt alan
    adı `www` ve HTTPS.

**İzleme**

13. UptimeRobot (ücretsiz, 5 dk): (a) `https://takipplus.com.tr/` anahtar kelime "Kendi ilerlemeni", (b)
    `https://takipplus.com.tr/gizlilik-politikasi.html` yönlendirmeyi takip ederek anahtar kelime "Gizlilik Politikası"
    (uygulamanın açtığı adres). Bildirim: e-posta. Form kalkacağı için form uç noktası izlenmiyor.

**Uygulama ve içerik değerleri** (`src/config/site.js`)

14. Apple Team ID (developer.apple.com › Membership) → `apps.yks.ids.appleTeamId`.
15. Android paket adı (öneri `tr.com.takipplus.yks`) ve Play Console › App integrity › App signing › SHA-256 →
    `androidPackage`, `androidSha256`.
16. Sosyal medya hesap linkleri → `site.social`.

**Hukuk**

17. Bir hukukçuya teyit ettir: ileride duyuru/pazarlama e-postası gönderilecekse **İYS (İleti Yönetim Sistemi)** kaydı
    gerekip gerekmediği; kitlede 18 yaş altı kullanıcılar olduğu için rıza ve veli onayı koşulları. (Bunlar hukuki
    sonuç değil, sorulacak sorular.)

Ayrıca [İçerik, ürün ve tasarım notları](#i̇çerik-ürün-ve-tasarım-notları) altında önceki çalışmadan kalan içerik
talepleri var (ekran görüntüleri, KVKK posta adresi, hukuki inceleme vb.).

## Kapsam dışı ama önemli (uygulama tarafı)

Web sitesi işi değil, ama güvenliği ve yayın zamanlamasını doğrudan etkiliyor:

- **Uygulamanın `.env` dosyası `pubspec.yaml` içinde asset olarak pakete gömülü ve içinde bir API anahtarı var.**
  APK/IPA'yı açan herkes okuyabilir. Anahtar hemen yenilenmeli (eski anahtar iptal) ve anahtar gerektiren çağrılar
  sunucu tarafına (Cloud Functions) taşınmalı.
- **Firebase güvenlik kuralları** (Firestore ve Storage) ayrıca denetlenmeli; özellikle sohbet, hikâye ve soru
  fotoğrafı gibi kullanıcı içerikleri: kimin okuyup yazabildiği, boyut/tür sınırları, başkasının belgesini
  değiştirememe. App Check açılmalı.
- **Android paket adı** `com.example.flutter_application_1` ile Play Store'a yüklenemez; yayından önce değişmeli
  (bir kez yayınlandıktan sonra değiştirilemez).
- Uygulama içinde hesap silme akışı yok; Google Play ve App Store (5.1.1(v)) uygulama içinden başlatılabilen hesap
  silme bekliyor. `/hesap-silme` web yolu Play'in istediği sayfayı karşılıyor.

---

## İçerik, ürün ve tasarım notları

### Neden Astro

Birden fazla sayfa, ürün şablonu ve ortak header/footer gerekiyor; içerik ise tamamen statik. Astro, bileşen
yazıp çıktıyı **sıfır JS'li düz HTML** olarak üretiyor. Sitede tek bir küçük istemci betiği var
(`src/scripts/site.ts`, ≈ 2,5 KB): menü, sabit CTA, form gönderimi, ölçüm ve görünme animasyonları. Betik
çalışmazsa içerik yine eksiksiz görünür.

### Yapı

```
assets/brand/kit/           marka kiti v1.0 dosyaları (kaynak; değiştirilmez)
assets/screens/             uygulama ekran görüntüleri (site sahibi ekleyecek, bkz. README orada)
api/waitlist.js             Vercel fonksiyonu: bekleme listesi → Brevo
api/csp-report.js           Vercel fonksiyonu: CSP ihlal raporlarını loglar
src/config/site.js          TEK yapılandırma dosyası (alan adı, yayın bayrakları, kimlikler, iletişim)
src/data/products.ts        ürünlerin görünen bilgileri
src/data/product-content/   her ürünün sayfa metinleri (yks.ts)
src/data/screens.ts         beklenen ekran görüntüleri ve alt metinleri
src/styles/tokens.css       tüm tasarım token'ları (tek kaynak)
src/components/             Header, Footer, Button, WaitlistForm, Faq, DeviceFrame, StoreButtons, PlanTable, Carousel, mockups/
src/layouts/                Base (SEO, OG, JSON-LD), Legal (yasal metin şablonu)
src/lib/jsonld.ts           Organization, WebSite, BreadcrumbList, FAQPage, MobileApplication, Article şemaları
src/pages/                  sayfalar; [product].astro ürün şablonu; rehber/ yazı şablonu; .well-known/
scripts/                    derleme betikleri, kontroller (check-dist, smoke), yerel sunucu (serve), QA betikleri
scripts/lib/                vercel.json taklidi, ortak HTTP testleri, style öznitelik dönüşümü
.github/                    CI, canlı test ve Dependabot
```

### Bekleme listesi formu

`WaitlistForm` bileşeni `/api/waitlist`'e gönderir: yalnızca e-posta, işaretsiz KVKK onay kutusu, bot tuzağı, alan
altı hata mesajları. JS kapalıyken de çalışır. Arka uç Brevo (liste, abonelikten çıkma ve çift onay hazır).
**Form kaldırılacak**; kaldırılırken `api/waitlist.js`, `src/pages/erken-erisim/`, `WaitlistForm`, `.env.example`'daki
Brevo değişkenleri ve README'deki ilgili satırlar birlikte silinmeli, "Erken erişime katıl" butonlarına yeni hedef
verilmeli.

### Ekran görüntüleri

`assets/screens/<ad>.png` (1290×2796, koyu tema). Liste ve çekim notları `assets/screens/README.md`'de. Dosya
eklenince `DeviceFrame` AVIF + WebP, 1x/2x/3x `srcset` üretir; olmayan ekranlar yayında gösterilmez.

### Fontlar

Outfit, Inter ve JetBrains Mono kendi sunucumuzdan (ziyaretçi IP'si Google'a gitmez): Latin + Türkçe harfler,
kullanılan ağırlık aralığı, `woff2`, `font-display: swap`, kritik üç dosya `preload`. Dosyalar `src/assets/fonts/`
altında, `npm run fonts` ile üretilir.

### QA betikleri

`npm run serve` açıkken: `qa:shots` her sayfayı 320–1920 px'te çeker, yatay taşma, 44 px altı dokunma hedefi ve H1
sayısını raporlar (`--landscape` ile yatay mod). `qa:behavior` JS kapalı görünürlük, mobil menü, sabit CTA ve form
doğrulamasını test eder. `qa:visual` yukarıda.

### Site sahibinden gelmesi gerekenler (içerik)

| # | Ne | Nereye |
|---|---|---|
| 1 | **Premium/ücretsiz kapsamının teyidi.** Ücretsizde yalnızca Sosyal ve Hedef Belirleme. | `src/data/product-content/yks.ts` |
| 2 | 15 ekran görüntüsü, 1290×2796, koyu tema, PNG | `assets/screens/` |
| 3 | KVKK veri sorumlusu posta adresi | `site.contact.postalAddress` |
| 4 | **Hukuki inceleme:** Gizlilik, KVKK Aydınlatma, Kullanım Şartları, Hesap silme taslak. İnceleme bitince `Legal` bileşenine `draft={false}`. | `src/pages/*.astro` |
| 5 | Hesap silme sürelerinin onayı ve silinen içeriğin backend'de gerçekten anonimleştirilmesi | `src/pages/hesap-silme.astro` |
| 6 | "Bize Bildir" e-postalarını ileten servisin adı | `src/pages/gizlilik.astro` |
| 7 | Gizlilik Politikası'ndaki görünürlük tablosunun uygulamayla doğrulanması | `src/pages/gizlilik.astro` §3 |
| 8 | Premium fiyatlarının kesinleşmesi (şu an gizli) | `pricing` |
| 9 | Kuruluş hikâyesini kendi anlatımınla kişiselleştirme | `src/pages/hakkimizda.astro` |
| 10 | Asgari kullanım yaşı kararı (hukukçuyla) | yasal sayfalar |
| 11 | Gerçek ve doğrulanabilir kullanıcı yorumları (varsa) | `site.socialProof` |

### Uygulamada düzeltilmesi önerilenler

- Premium ekranındaki tabloda **"Kulüpler"** yerine **"Klanlar"**, **"Optik Tarama ve Otomatik Puan Hesaplama"**
  yerine **"Optik Çözüm ve puan hesaplama"** (kamerayla tarama yok) yazmalı (`premium_planlar_screen.dart`).
- Premium plan adlarındaki "David Goggins" gerçek bir kişinin adı; değiştirilmesi önerilir.
- Buton gradyanı ve küçük mor metin için kontrast önerisi: [BRAND.md §3](BRAND.md#rafine-edilen-iki-nokta-uygulama-için-de-öneri).
- Uygulamaya yapay zekâ destekli bir özellik eklenirse Gizlilik Politikası ve KVKK metni güncellenmeli.

### Tasarım yönü

- **Marka özü:** "Kendi ilerlemeni sen yönet." Değerler: netlik, disiplin, topluluk, sahiplik.
- **Palet ve tipografi:** uygulamanın token'ları birebir; yalnızca kontrast için iki ton rafine edildi.
- **İmza detaylar:** Günün Odağı dörtlüsü, 30 günlük aktivite haritası, logodaki "+" işaretinin yapısal kullanımı.
- **Açık tema** yapılmadı; token yapısı hazır.
