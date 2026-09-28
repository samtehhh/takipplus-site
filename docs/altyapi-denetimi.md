# Altyapı denetimi: teknik SEO, güvenlik, performans, operasyon

**Tarih:** 28 Eylül 2026 · **Kapsam:** takipplus.com.tr (Astro, Vercel) · **Tasarım:** değiştirilmedi (kanıt aşağıda)

Önce: denetim başlangıcında canlı sitenin durumu (curl, tarayıcı, DNS sorguları, depo). Sonra: değişiklikler
yayına alındıktan sonra aynı araçlarla yapılan ölçüm.

## Özet

| Kabul kriteri | Önce | Sonra |
|---|---|---|
| Canlı kabul testleri (`npm run test:live`, apex hedefiyle) | 20 geçti / **69 hata** | **136 geçti / 1 hata** (Web Analytics kapalı, senin adımın) |
| Lighthouse mobil (9 sayfa, canlı) Perf / A11y / BP / SEO | ölçülmedi (apex www'ya yönleniyordu) | **100 / 100 / 96 / 100** (BP: analiz betiği 404; açılınca 100) |
| LCP / CLS / TBT (canlı, mobil simülasyon) | – | **1,1–1,4 sn / 0 / 0 ms** |
| securityheaders.com | – (apex yönlendirme) | **A+** |
| Mozilla Observatory | A+ (120, www) | **A+ (125)** |
| SSL Labs | – | **A+** (216.198.79.1), A (76.76.21.21, eski IP: HSTS yok → DNS'ten kaldırılmalı) |
| Schema Markup Validator (`/`, `/yks`) | – | **0 hata, 0 uyarı** |
| Rich Results Test | – | Google girişi gerekiyor: senin yapman gerekenler listesinde |
| Git geçmişi gizli anahtar taraması | temiz | temiz (CI'da gitleaks her push'ta) |
| Sitemap'teki tüm adresler 200 ve kanonik | adresler www'da, `lastmod` yok | 9/9 adres 200, kanonik, gerçek `lastmod` |
| Tasarım değişmedi | – | 10 sayfa × 7 genişlik = 70 ekran görüntüsü piksel piksel aynı |

## Denetim tablosu

Öncelik: **K** kritik · **Ö** önemli · **İ** iyi olur. Durum (önce): var / eksik / hatalı.

### URL yapısı, yönlendirmeler, indekslenme

| # | Konu | Önce | Öncelik | Sonra |
|---|---|---|---|---|
| 1 | Kanonik alan adı | **hatalı**: kanonik `www`; apex → www 308 | K | `https://takipplus.com.tr`; www → apex **301, tek adım** (`vercel.json`, host koşulu) |
| 2 | Uygulamanın açtığı `/gizlilik-politikasi.html`, `/kullanim-sartlari.html` | **hatalı**: apex'ten 2 adım (308 → 301) | K | **tek adım 301** → `/gizlilik`, `/kullanim-sartlari`; hedef 200; her deploy'da test |
| 3 | `.html`'li kopyalar (`/yks.html`) | **hatalı**: 200 (kopya içerik) | K | 301 → uzantısız |
| 4 | `takipplus-site.vercel.app` | **hatalı**: 200, `noindex` yok (indekslenebilir kopya) | K | `X-Robots-Tag: noindex` (`*.vercel.app` host kuralı) |
| 5 | Önizleme deploy'ları | var: Vercel Authentication + noindex | – | ek olarak önizleme derlemelerinde `<meta robots noindex>` |
| 6 | Gerçek 404 | kısmen: olmayan sayfa 404, ama `/404` 200 | Ö | `/404` dahil hepsi 404 + markalı sayfa |
| 7 | Sondaki `/` | var: 308 → uzantısız | – | aynı |
| 8 | `cleanUrls` | `false` + yeniden yazma (gerekçesiz) | İ | gerekçe belgelendi: `true` eski adreslere 308 adımı ekliyor (Vercel derleyicisiyle doğrulandı) |
| 9 | robots.txt | `/erken-erisim/` engelli (noindex'i görünmez yapıyor) | İ | tüm site açık, yalnızca `/api/`; noindex sayfalar `X-Robots-Tag` ile |
| 10 | sitemap.xml | adresler www'da, `lastmod` yok | Ö | apex, yalnızca 200 + kanonik + indekslenebilir sayfalar, `lastmod` = içeriğin son commit tarihi (Vercel'in sığ klonu derinleştiriliyor) |

### Sayfa içi SEO ve yapılandırılmış veri

| # | Konu | Önce | Öncelik | Sonra |
|---|---|---|---|---|
| 11 | title / description / canonical / lang / OG / Twitter | var | – | canonical ve OG artık apex; derlemede uzunluk ve 1200×630 kontrolü |
| 12 | Marka varyantları ("Takip Plus", "TakipPlus") | **eksik** | Ö | ana sayfa ve `/yks` başlık/açıklaması, footer satırı, Organization ve WebSite `alternateName` |
| 13 | Anahtar ifadeler (`/yks`) | kısmen | İ | `/yks` açıklaması: YKS takip uygulaması, TYT AYT konu takibi, deneme takibi, net hesaplama, YKS çalışma programı |
| 14 | Organization | kısmen: `alternateName`, `contactPoint` yok, boş `sameAs` | Ö | eksikler eklendi; `sameAs` sosyal hesap girilince dolar |
| 15 | MobileApplication | **hatalı**: yayın öncesi `offers`/puan olmadan var → Rich Results "geçersiz öğe" | Ö | `released: true` olana kadar eklenmiyor (senin kararın) |
| 16 | FAQPage (`/yks`), BreadcrumbList (iç sayfalar) | var | – | doğrulayıcıda 0 hata |
| 17 | Article şablonu (`/rehber`) | **eksik** | İ | yazar, `datePublished`, `dateModified`, yayıncı; test yazısıyla doğrulandı |
| 18 | Yinelenen `id="icerik"` (Kullanım Şartları) | **hatalı**: "İçeriğe atla" bağlantısı 4. bölüme gidiyordu | Ö | düzeltildi; HTML doğrulaması temiz |

### Performans

| # | Konu | Önce | Sonra |
|---|---|---|---|
| 19 | Hash'li varlıklar, `immutable` önbellek, `?v=` yok | var | aynı |
| 20 | Self-host fontlar, alt küme, `swap`, preload | var | aynı |
| 21 | Brotli | var | aynı |
| 22 | Ana sayfa ilk yükleme < 500 KB | var (≈ 111 KB) | ≈ 114 KB sıkıştırmasız, canlıda 100 KB aktarım (görsellerle) |
| 23 | CSS | satır içi (CSP'de `unsafe-inline` gerektiriyordu) | harici; yerel simülasyonda LCP +0,3 sn, **canlıda LCP 1,1–1,4 sn** |

### Güvenlik

| # | Konu | Önce | Öncelik | Sonra |
|---|---|---|---|---|
| 24 | CSP | **hatalı**: `style-src 'unsafe-inline'` | Ö | `unsafe-inline` yok; önce Report-Only (canlıda 11 sayfa × 2 genişlik, yerelde 70 çekim: 0 ihlal), sonra zorunlu; `report-uri /api/csp-report` |
| 25 | HSTS (apex) | **hatalı**: apex yönlendirmesinde `includeSubDomains; preload` yok | Ö | apex 200 yanıtında tam başlık; preload başvurusu senin listende |
| 26 | Diğer başlıklar | var | – | Permissions-Policy genişletildi |
| 27 | security.txt | **eksik** | Ö | `Contact`, `Expires` (derleme + 180 gün), `Canonical` |
| 28 | `.env` / `.gitignore` / git geçmişi | temiz | – | CI'da gitleaks; GitHub secret scanning + push protection zaten açıktı |
| 29 | Dependabot | **eksik** (uyarılar kapalı) | Ö | uyarılar + güvenlik güncellemeleri açıldı; haftalık sürüm PR'ları (ilk gün 5 PR) |
| 30 | npm audit | yayına giden paketlerde 0 | – | aynı; derleme aracı `satori` → `fflate` orta seviye (yayına girmiyor) |
| 31 | CAA | **eksik** | Ö | senin listende (Vercel'in kendi CAA listesiyle) |
| 32 | DNSSEC | **eksik** (`.tr` imzalı, mümkün) | İ | senin listende |
| 33 | SPF / DMARC | **eksik**: alan adı adına sahte e-posta gönderilebilir | Ö | senin listende (şimdilik `-all` + `p=reject`) |
| 34 | Eski Vercel IP'si (76.76.21.21) | Vercel "DNS Change Recommended" diyor; SSL Labs A (HSTS görünmüyor) | Ö | senin listende: eski A kaydını kaldır |

### Backend (bekleme listesi formu)

Kapsam dışı bırakıldı: form kaldırılacak (senin kararın). Mevcut uç nokta değiştirilmedi; yalnızca alan adı yapılandırmadan
okunuyor. Brevo ortam değişkenleri tanımlı değilse form şu an gönderimde hata veriyor olabilir.

### Uygulama bağlantıları

| # | Konu | Önce | Sonra |
|---|---|---|---|
| 35 | `apple-app-site-association` | apex'ten 308 (Apple yönlendirmeyi kabul etmez) | apex'te 200, `application/json`, yönlendirmesiz; Team ID yer tutucu |
| 36 | `assetlinks.json` | apex'ten 308 | 200 JSON; paket adı ve SHA-256 yer tutucu |
| 37 | `released: true` → Smart App Banner, rozetler, şema | var (dağınık) | tek bayrak, tek dosya: `src/config/site.js` |

### Analitik, izleme, operasyon

| # | Konu | Önce | Sonra |
|---|---|---|---|
| 38 | Web Analytics | **hatalı**: betik 404 (kapalı) | senin listende (1 tık); Hobby'de özel olaylar görünmüyor, seçenekler README'de |
| 39 | Uptime / canlı izleme | eksik | GitHub Actions: her production deploy'u sonrası + günlük canlı test (başarısızsa e-posta); UptimeRobot önerisi senin listende |
| 40 | Rollback | belgelenmemiş | README → "Geri alma" |
| 41 | CI | **yoktu** | derleme + check-dist, html-validate, lychee, Lighthouse bütçeleri, npm audit, gitleaks |
| 42 | Tek config dosyası | **hatalı**: alan adı 5 yerde, yayın/mağaza bilgisi ayrı dosyada | `src/config/site.js`: Astro, betikler, testler ve Vercel fonksiyonları aynı dosyayı okuyor |

## Tasarımın değişmediğinin kanıtı

- Önceki derleme ve yeni derleme aynı yerel sunucuda (`vercel.json` kurallarıyla) 10 sayfa × 7 genişlikte (360, 390,
  768, 1024, 1100, 1280, 1440 px) tam sayfa çekildi, tembel görseller yüklendikten sonra piksel piksel karşılaştırıldı:
  **70/70 aynı**. Katı CSP zorunluyken tekrarlandı: yine 70/70 aynı, 0 CSP ihlali.
- Bilinçli tek görünür değişiklik: footer'daki telif satırı "© 2026 Takip+ **(Takip Plus)** · Samet Öndeş". Fark,
  her sayfada yalnızca son ~100 px'te; sayfa yükseklikleri değişmedi.
- Davranış testleri (JS kapalı görünürlük, mobil menü, sabit CTA, form doğrulama) katı CSP altında geçti.

## Yolda yakalanan hatalar

- `vercel.json`'daki `/:path*` kalıbı kök adresi (`/`) yakalamıyor; `www.takipplus.com.tr/` hiç yönlenmeyecekti.
  Vercel'in kendi kural derleyicisiyle çalışan yerel testler yayından önce yakaladı; `/:path(.*)` ile düzeltildi.
- Vercel son 10 commit'i klonluyor; sitemap tarihleri 6 sayfada eksik kalıyordu (yanlış tarih yazılmadı, boş kaldı).
  Derleme artık geçmişi GitHub'dan derinleştiriyor; 9/9 sayfa tarihli.
- CI'da `npm ci`, lockfile'da kök düzeyde olmayan (yalnızca wasm32'de gereken) isteğe bağlı paketler yüzünden
  düştü. CI, Vercel'in kendisi gibi `npm install` kullanıyor.

## Açık kalanlar

Kod tarafında açık iş yok. Hesap, DNS ve hukuk adımları README → [Senin yapman gerekenler](../README.md#senin-yapman-gerekenler).
