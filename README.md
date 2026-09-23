# takipplus.com.tr

Takip+ markasının sitesi. Astro ile üretilen statik bir site; Vercel'de yayınlanır. Marka ana sayfası (`/`),
ürün sayfaları (`/yks`), kurumsal ve yasal sayfalar, bekleme listesi formu ve basın kiti içerir.

Marka kuralları için: [BRAND.md](BRAND.md).

## Neden Astro

Birden fazla sayfa, ürün şablonu ve ortak header/footer gerekiyor; içerik ise tamamen statik. Astro, bileşen
yazıp çıktıyı **sıfır JS'li düz HTML** olarak üretiyor. Sitede tek bir küçük istemci betiği var
(`src/scripts/site.ts`, ≈ 2,5 KB): menü, sabit CTA, form gönderimi, ölçüm ve görünme animasyonları. Betik
çalışmazsa içerik yine eksiksiz görünür.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/ + kontroller
npm run preview    # derlenmiş siteyi http://localhost:4322'de sunar (--port 4322)
```

Node 22.12 veya üstü gerekir.

`npm run build` sırasında:

1. `scripts/brand-assets.mjs`: logo varyantları, favicon seti, uygulama ikonları (`public/brand`, `public/icons`).
2. `scripts/og-images.mjs`: her sayfa için 1200×630 OG görseli (`public/og`).
3. `astro build`: sayfalar, sitemap, `robots.txt`, `.well-known` dosyaları.
4. `scripts/check-dist.mjs`: kırık iç link/varlık, eksik çapa, sayfa başına tek H1, başlık ≤ 60 ve açıklama ≤ 155
   karakter, canonical/OG, satır içi betik (CSP), eski URL yönlendirmeleri ve ana sayfa ağırlığı (< 500 KB).
   Bir hata varsa derleme başarısız olur.

## Yayına alma (Vercel)

Proje zaten Vercel'de. `vercel.json` framework, derleme komutu, çıktı klasörü, 301 yönlendirmeleri, güvenlik
başlıkları ve önbellek kurallarını içerir. `main` dalına push yeterli.

1. **Ortam değişkenleri** (Vercel › Project › Settings › Environment Variables), `.env.example`'a bak:
   `BREVO_API_KEY`, `BREVO_LIST_ID`, isteğe bağlı `BREVO_DOI_TEMPLATE_ID`, `BREVO_DOI_REDIRECT_URL`.
2. **Web Analytics'i aç** (Vercel › Project › Analytics › Enable). Açılmazsa `/_vercel/insights/script.js`
   404 döner ve konsolda hata görünür.
3. Deploy'dan sonra şu adresleri mutlaka dene (uygulama Premium ekranından bunları açıyor):

   ```bash
   curl -sI https://takipplus.com.tr/gizlilik-politikasi.html
   ```

   ```bash
   curl -sI https://takipplus.com.tr/kullanim-sartlari.html
   ```

   İlki `301 → /gizlilik`, ikincisi `301 → /kullanim-sartlari` vermeli ve hedefler `200` dönmeli.
   Uygulamanın bir sonraki sürümünde linkleri doğrudan `/gizlilik` ve `/kullanim-sartlari` yapmak iyi olur;
   yönlendirmeler yine de kalıcı olarak durmalı.

### Yönlendirmeler

| Eski | Yeni |
|---|---|
| `/index.html` | `/` |
| `/gizlilik-politikasi.html`, `/gizlilik-politikasi` | `/gizlilik` |
| `/kullanim-sartlari.html` | `/kullanim-sartlari` |
| `/kvkk`, `/hakkinda`, `/basin` | `/kvkk-aydinlatma`, `/hakkimizda`, `/marka` |

`cleanUrls` açık: `.html` uzantısı görünmez. `/sitemap.xml`, `sitemap-index.xml`'e yeniden yazılır.

## Yapı

```
assets/logo.png            uygulama ikonu (kaynak)
assets/screens/            uygulama ekran görüntüleri (site sahibi ekleyecek, bkz. README orada)
api/waitlist.js            Vercel Serverless Function: bekleme listesi → Brevo
src/config/site.ts         iletişim, e-posta, sosyal medya, analiz, sosyal kanıt, Premium fiyatları
src/data/products.ts       ürün listesi, released bayrağı, mağaza linkleri, paket adları
src/data/product-content/  her ürünün sayfa metinleri (yks.ts)
src/data/screens.ts        beklenen ekran görüntüleri ve alt metinleri
src/styles/tokens.css      tüm tasarım token'ları (tek kaynak)
src/components/            Header, Footer, Button, WaitlistForm, Faq, DeviceFrame, StoreButtons, PlanTable, Carousel, mockups/
src/layouts/               Base (SEO, OG, JSON-LD), Legal (yasal metin şablonu)
src/pages/                 sayfalar; [product].astro ürün şablonu; rehber/ yazı şablonu
scripts/                   derleme betikleri, font alt küme betiği, QA betikleri
```

## Yeni ürün ekleme

1. `src/data/products.ts` listesine bir kayıt ekle (`name`, `slug`, `accent`, `accentDeep`, `status`,
   `tagline`, `released`, mağaza linkleri, paket adları).
2. `src/data/product-content/<slug>.ts` dosyasını `yks.ts`'i örnek alarak oluştur.
3. `scripts/og-images.mjs` içindeki `pages` nesnesine `<slug>` için bir satır ekle.
4. Ürüne özel mockup gerekiyorsa `src/components/mockups/` altına ekleyip `[product].astro` içindeki `mocks`
   eşlemesine bağla.

`/<slug>` sayfası, header/footer linkleri, ana sayfadaki ürün kartı ve sitemap kaydı otomatik oluşur.
`status: 'planned'` olan ürünler hiçbir yerde görünmez.

## Yayın günü: `released` bayrağı

`src/data/products.ts` içinde ilgili üründe:

```ts
released: true,
stores: {
  googlePlayUrl: 'https://play.google.com/store/apps/details?id=<paket>',
  appStoreUrl: 'https://apps.apple.com/tr/app/<ad>/id<numara>',
  appStoreId: '<numara>',   // iOS Smart App Banner için
},
ids: { androidPackage: '<paket>', androidSha256: ['<Play App Signing SHA-256>'], appleTeamId: '<TEAMID>', ... }
```

Bununla birlikte:

- "Erken erişime katıl" butonları resmi Google Play ve App Store rozetlerine dönüşür. Rozetleri resmi
  kaynaklardan indirip **değiştirmeden** şu adlarla koy: `public/badges/google-play-tr.png`
  ([Google Play rozetleri](https://play.google.com/intl/en_us/badges/)) ve `public/badges/app-store-tr.svg`
  ([Apple Marketing Tools](https://tools.applemarketingtools.com/)). Rozet yüksekliği 53 px, çevresinde boşluk var.
- Kullanıcının cihazına göre ilgili mağaza öne alınır; diğeri görünür kalır.
- `appStoreId` doluysa iOS Safari'de Smart App Banner çıkar.
- `/.well-known/assetlinks.json` ve `/.well-known/apple-app-site-association` paket bilgileriyle dolar
  (App Links / Universal Links). Şu an boş listeler dönüyor.

Premium fiyatlarını göstermek için `src/config/site.ts` içinde `pricing.pricingVisible = true` yap. Fiyatlar,
Sınava Kadar hesabı (aylık × 0,5546 × kalan ay) ve otomatik yenileme/iptal notu birlikte görünür.

## Bekleme listesi formu

`WaitlistForm` bileşeni `/api/waitlist`'e gönderir. Sadece e-posta, işaretsiz KVKK onay kutusu (aydınlatma
metnine link), bot tuzağı (gizli `company` alanı), alan altı hata mesajları, başarı/hata durumları. JS kapalıysa
form yine çalışır ve `/erken-erisim/tesekkurler` sayfasına yönlenir.

**Neden Brevo:** Liste yönetimi, abonelikten çıkma bağlantısı ve **çift onay (double opt-in)** hazır geliyor;
KVKK ve 6563 sayılı Kanun açısından onayın kaydı tutuluyor, yayın günü aynı listeye kampanya e-postası
atılabiliyor. AB'de barındırılan veri, ücretsiz katmanı yeterli, bağımlılık yok (`fetch` ile tek istek).
Firebase de olurdu ama sunucu tarafında servis hesabı anahtarı ve ayrı bir e-posta gönderim çözümü gerekirdi;
Resend ise gönderimde güçlü, liste ve onay yönetiminde daha zayıf. Anahtarlar yalnızca ortam değişkeninde.

`BREVO_DOI_TEMPLATE_ID` tanımlanırsa kişiye onay e-postası gider, onaylayınca `/erken-erisim/onaylandi`'ya döner.
Brevo'da kişi özelliği olarak `KAYNAK`, `URUN`, `ONAY_TARIHI`, `ONAY_METNI` alanlarını oluştur.

## Ölçüm

Çerez kullanmayan Vercel Web Analytics (izin banner'ı gerekmez). Buton ve form olayları `data-track`
öznitelikleriyle gönderilir: `cta_hero`, `cta_header`, `cta_menu`, `cta_sticky`, `cta_early_access`,
`waitlist_submit`, `waitlist_signup`, `waitlist_error`, `store_google_play`, `store_app_store`.
Vercel'de özel olaylar Pro planda raporlanır; Umami veya Plausible'a geçmek için `site.analytics.provider`
değerini değiştir (Plausible için CSP'ye `plausible.io` eklenmeli).

## Ekran görüntüleri

`assets/screens/<ad>.png` (1290×2796, koyu tema). Liste ve çekim notları `assets/screens/README.md`'de. Dosya
eklenince `DeviceFrame` AVIF + WebP, 1x/2x/3x `srcset` üretir; `bugun.png` varsa "Bugün" bölümünde telefon
çerçevesi çıkar, en az 3 ekran varsa ürün sayfasına ekran galerisi eklenir. Olmayan ekranlar yayında hiç
gösterilmez (geliştirme sunucusunda yer tutucu ve dosya adı görünür).

## Fontlar

`src/assets/fonts/` altındaki dosyalar `npm run fonts` (Python: `pip install fonttools brotli`) ile üretilir ve
depoda tutulur. Font sürümü güncellenmediği sürece tekrar çalıştırmaya gerek yok.

## QA betikleri

```bash
npm run preview -- --port 4322
```

```bash
npm run qa:shots
```

```bash
npm run qa:behavior
```

`qa:shots` her sayfayı 320–1920 px genişliklerde tam sayfa çeker (`.qa/`), yatay taşma, 44 px altı dokunma
hedefi ve H1 sayısını raporlar; yatay mod için sonuna `--landscape` ekle. `qa:behavior` JS kapalı görünürlük,
mobil menü (odak, ESC, kaydırma kilidi), sabit CTA ve form doğrulamasını test eder. Windows Git Bash'te `/` ile
başlayan argümanlar için `MSYS_NO_PATHCONV=1` kullan.

## Rehber (blog) yapısı

`src/content/rehber/*.md` altına yazı eklenince `/rehber` ve `/rehber/<yazı>` sayfaları üretilir. Şablon:
`src/content/rehber/_sablon.md`. Yazı yokken hiçbir sayfa oluşmaz.

---

## Kabul kriterleri: ölçüm sonuçları (24 Eylül 2026, yerel derleme)

**Lighthouse 13, mobil, varsayılan ayar (yavaş 4G + orta seviye cihaz simülasyonu).** Yerel sunucu sıkıştırma
yapmıyor; Vercel'de Brotli ile sonuçlar biraz daha iyi olur.

| Sayfa | Performans | Erişilebilirlik | En İyi Uyg. | SEO | FCP | LCP | CLS | TBT | Aktarım |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1,0 sn | 1,5 sn | 0 | 0 ms | 77 KB |
| `/yks` | 100 | 100 | 100 | 100 | 1,4 sn | 1,7 sn | 0 | 0 ms | 114 KB |
| `/hakkimizda` | 100 | 100 | 100 | 100 | 0,9 sn | 1,5 sn | 0 | 0 ms | 72 KB |
| `/marka` | 100 | 100 | 100 | 100 | 1,2 sn | 1,7 sn | 0 | 0 ms | 111 KB |
| `/iletisim` | 100 | 100 | 100 | 100 | 0,9 sn | 1,5 sn | 0 | 0 ms | 72 KB |
| `/hesap-silme` | 100 | 100 | 100 | 100 | 0,9 sn | 1,5 sn | 0 | 0 ms | 74 KB |
| `/gizlilik` | 100 | 100 | 100 | 100 | 0,9 sn | 1,5 sn | 0 | 0 ms | 76 KB |
| `/kullanim-sartlari` | 100 | 100 | 100 | 100 | 0,9 sn | 1,5 sn | 0 | 0 ms | 75 KB |
| `/kvkk-aydinlatma` | 100 | 100 | 100 | 100 | 0,9 sn | 1,5 sn | 0 | 0 ms | 75 KB |

Yerel ölçümde Vercel Analytics betiği boş bir dosyayla taklit edildi; canlıda Web Analytics açık değilse bu
betik 404 verir ve "En İyi Uygulamalar" 96'ya düşer.

- **INP:** sayfada ana iş parçacığını meşgul eden betik yok (TBT 0 ms); gerçek INP verisi yayından sonra Vercel
  Speed Insights / CrUX'tan okunmalı.
- **Ana sayfa ilk yükleme:** ≈ 112 KB sıkıştırmasız (HTML + CSS + JS + preload fontlar). Limit 500 KB.
- **Link kontrolü:** `check-dist` 12 sayfada kırık iç link, varlık veya çapa bulmadı. Kontrolün gerçekten hata
  yakaladığı, bilerek bozulmuş bir test sayfasıyla doğrulandı.
- **Genişlikler:** 320, 360, 390, 430, 768, 1024, 1440, 1920 px'te 10 sayfanın hepsinde yatay kaydırma yok, 44 px
  altında dokunma hedefi yok, her sayfada tek H1. Yatay mod (667×375, 800×360, 852×393, 932×430) de temiz.
- **Davranış:** JS kapalıyken gizli içerik yok; menü odak alıyor, ESC ile kapanıyor, arka plan kaymıyor; sabit
  CTA hero sonrası çıkıyor ve form görününce gizleniyor; e-posta alanı 16 px; KVKK kutusu işaretsiz.
- **Test edilemeyenler:** gerçek iOS Safari/Android Chrome cihazları (klavye, adres çubuğu, çentik), OG
  önizlemelerinin WhatsApp/X/LinkedIn'de görünümü ve canlı yönlendirmeler. Bunlar deploy'dan sonra yapılmalı:
  [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (WhatsApp aynı etiketleri okur),
  [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), X'te bağlantıyı taslak gönderiye yapıştır.

---

## Site sahibinden gelmesi gerekenler

| # | Ne | Nereye |
|---|---|---|
| 1 | **Premium/ücretsiz kapsamının teyidi.** Site artık uygulamadaki `PremiumPricing` tablosunu izliyor: ücretsizde yalnızca Sosyal ve Hedef Belirleme. Eski SSS'deki "konu ve deneme takibi ücretsiz" ifadesi kaldırıldı. Doğru olan bu mu? | `src/data/product-content/yks.ts` (`plans`, `faq`) |
| 2 | 15 ekran görüntüsü, 1290×2796, koyu tema, PNG | `assets/screens/` |
| 3 | Alan adına ait e-posta (`iletisim@takipplus.com.tr`) kurulunca `useDomainEmail: true` | `src/config/site.ts` |
| 4 | Brevo API anahtarı, liste kimliği, (isteğe bağlı) çift onay şablonu | Vercel ortam değişkenleri |
| 5 | KVKK veri sorumlusu posta adresi | `site.contact.postalAddress` |
| 6 | **Hukuki inceleme:** Gizlilik, KVKK Aydınlatma, Kullanım Şartları, Hesap silme taslak; sayfalarda "Hukuki inceleme bekliyor" notu var. İnceleme bitince `Legal` bileşenine `draft={false}` ver. | `src/pages/*.astro` |
| 7 | Hesap silme sürelerinin onayı (30 gün silme, yedeklerde 30 gün, destek e-postaları ve kötüye kullanım kayıtları 1 yıl) ve silinen kullanıcı içeriğinin "Silinmiş kullanıcı" olarak anonimleştirilmesinin backend'de gerçekten yapılması | `src/pages/hesap-silme.astro` |
| 8 | "Bize Bildir" e-postalarını ileten e-posta servisinin adı | `src/pages/gizlilik.astro` (sarı yer tutucu) |
| 9 | Gizlilik Politikası'ndaki görünürlük tablosunun uygulamayla doğrulanması (hikâyeleri kim görüyor, netler/hedef profilde kime görünüyor) | `src/pages/gizlilik.astro` §3 |
| 10 | Sosyal medya hesapları | `site.social` |
| 11 | Premium fiyatlarının kesinleşmesi (şu an 49,99 ₺ / 149,99 ₺, gizli) | `pricing` |
| 12 | Android paket adı (`com.example.flutter_application_1` Play Store'a yüklenemez), Play App Signing SHA-256, Apple Team ID, mağaza linkleri | `src/data/products.ts` |
| 13 | Kuruluş hikâyesi: `/hakkimizda` şimdilik uydurma anekdot içermeyen, kısa ve genel bir metin. Kendi anlatımınla kişiselleştir. Kuruluş yılı 2026 olarak varsayıldı. | `src/pages/hakkimizda.astro`, `site.foundingYear` |
| 14 | Asgari kullanım yaşı kararı (hukukçuyla): metinlerde yalnızca "18 yaş altı veli bilgisi dahilinde" yazıyor | yasal sayfalar |
| 15 | Gerçek ve doğrulanabilir kullanıcı yorumları (varsa) | `site.socialProof` (şu an gizli) |
| 16 | Resmi mağaza rozetleri (yayın günü) | `public/badges/` |

### Uygulamada düzeltilmesi önerilenler

- Premium ekranındaki tabloda **"Kulüpler"** yazıyor, doğrusu **"Klanlar"**; **"Optik Tarama ve Otomatik Puan
  Hesaplama"** yazıyor, doğrusu **"Optik Çözüm ve puan hesaplama"** (kamerayla tarama yok). Sitede doğru adlar
  kullanıldı; uygulama da güncellenmeli ki ikisi birebir aynı olsun (`premium_planlar_screen.dart`).
- Premium plan adlarından "David Goggins" gerçek bir kişinin adı; değiştirilmesi önerilir (sitede kullanılmadı).
- Buton gradyanı ve küçük mor metin tonu için kontrast önerisi: [BRAND.md §3](BRAND.md#rafine-edilen-iki-nokta-uygulama-için-de-öneri).
- Uygulamaya yapay zekâ destekli bir özellik eklenirse Gizlilik Politikası ve KVKK metni güncellenmeli.
- Uygulama içinde hesap silme seçeneği yok; Google Play ve App Store (5.1.1(v)) uygulama içinden hesap silme
  başlatmayı bekliyor. `/hesap-silme` web yolu Play'in istediği sayfayı karşılıyor, ama uygulamaya da bir
  "Hesabımı sil" akışı eklenmeli.

## Tasarım yönü ve varsayımlar

- **Marka özü:** "Kendi ilerlemeni sen yönet." Değerler: netlik, disiplin, topluluk, sahiplik.
- **Palet ve tipografi:** uygulamanın token'ları birebir; yalnızca kontrast için iki ton rafine edildi.
- **İmza detaylar:** Günün Odağı dörtlüsü (saat/soru/video/konu renkleri), 30 günlük aktivite haritası,
  logodaki "+" işaretinin yapısal kullanımı.
- **Sayfa haritası:** `/`, `/yks`, `/hakkimizda`, `/marka`, `/iletisim`, `/hesap-silme`, `/gizlilik`,
  `/kullanim-sartlari`, `/kvkk-aydinlatma`, `404`, (`/rehber` yazı eklenince).
- **Açık tema** yapılmadı; önce koyu tema kusursuzlaştırıldı. Token yapısı açık temaya hazır.
- Tasarım notu kodlamadan önce ayrıca onaylatılmadı; brief'teki yönlendirmeler esas alındı.
