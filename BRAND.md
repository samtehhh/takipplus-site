# Takip+ marka rehberi

Bu rehber sitenin ve uygulamanın aynı dünyaya ait görünmesi için tek kaynaktır. Değerler uygulamanın
`lib/theme.dart` dosyasından alındı; sitedeki karşılıkları `src/styles/tokens.css` içinde.

## 1. Marka özü

**Vaat:** Kendi ilerlemeni sen yönet.

**Mimari:** Marka evi (branded house). Takip+ ana markadır; ürünler "Takip+ <Sınav>" biçiminde adlandırılır
(Takip+ YKS; ileride örneğin Takip+ KPSS, Takip+ LGS). Her ürünün kendi vurgu rengi olur, geri kalan her şey
ortaktır.

**Değerler**

| Değer | Ne demek |
|---|---|
| Netlik | Öğrenci nerede olduğunu ve hedefe ne kadar kaldığını tahmin etmez, görür. |
| Disiplin | Motivasyon gelip gider; küçük, her gün tekrarlanan adımlar kalır. |
| Topluluk | Aynı yolda yürüyenlerle yarışmak ve yardımlaşmak işi kolaylaştırır. |
| Sahiplik | Plan, veri ve kararlar öğrencinindir. Uygulama sadece araçtır. |

**Ses tonu:** Samimi, motive edici, abartısız. Öğrenciyle "sen" diye konuşur. Kısa cümleler, etken çatı.

- Yapmadığımız şeyi vaat etmeyiz ("net artışı garanti" yok).
- Tahmine tahmin, örneğe örnek deriz; ekran görselleri örnek veriyle çekilir ve sayfada bunu söyleyen bir not bulunur.
- Tanıtım dili ve ünlem yığını yok. Emoji çok az ve yalnızca uygulama içi bağlamda.
- Terimler uygulamayla birebir: **Klan** (kulüp değil), **Optik Çözüm** (optik tarama değil), **Hedef&Net**,
  **Yapamadıklarım**, **Günün Odağı**, **Net Sihirbazı**, **Bize Bildir**.

**Kısa marka metni (basın için):**
> Takip+, sınava hazırlanan öğrenciler için çalışma ve takip uygulamaları geliştiren bağımsız bir Türk
> girişimidir. İlk ürünü Takip+ YKS; konu takibi, deneme ve net analizi, Optik Çözüm, hedef belirleme,
> çalışma planı ve sosyal özellikleri tek uygulamada toplar.

## 2. Logo

Kaynak: `assets/brand/kit/`, **Takip+ marka kiti v1.0 (Eylül 2026)** dosyaları, kitten olduğu gibi kopyalandı.
Logolar yeniden çizilmez, renklendirilmez; `scripts/brand-assets.mjs` derleme sırasında favicon setini ve PWA
ikonlarını yerine koyar, indirme dosyalarını `public/brand/kit/` altına kopyalar ve tek tıkla indirilen
`public/brand/takipplus-marka-kiti.zip` dosyasını paketler. Kitin tamamı (mağaza ikonları, Android `res/`,
sosyal medya, kılavuz PDF) projede değil, kit klasöründe durur.

| Klasör | İçerik |
|---|---|
| `kit/yks/` | Takip+ YKS (mor): SVG sembol (renkli, açık zemin, beyaz, lacivert, düz karo), yatay logo SVG/PNG, ışıltılı sembol ve uygulama ikonu PNG |
| `kit/yks/web/` | Favicon (.ico, .svg, 16/32/48), apple-touch-icon, 192/512 ve maskable ikon, mask-icon |
| `kit/ana/` | Ürün adı olmadan Takip+ yatay logo ve yazı logo |
| `kit/lgs/`, `kit/kpss/` | Yakında gelecek ürünlerin sembol ve yatay logoları (mavi, turuncu) |

**Sürümler:** Işıltılı (parlamalı) sürüm yalnızca koyu zeminde ve 64 px ve üzerinde: uygulama ikonu, mağaza,
afiş. 64 px altında ve açık zeminde aynı geometrideki düz SVG sürümü kullanılır (favicon, site header/footer,
OG görsellerindeki küçük logo). Açık zeminde artı lacivert (`#0F172A`) olur. Yatay logo en az 96 px genişlik.

**Ürün ailesi:** T+ geometrisi bütün ürünlerde aynı; yalnızca T'nin gradyanı değişir (YKS mor, LGS mavi, KPSS
turuncu). Artı her zaman beyaz. Sitede ağırlık Takip+ YKS'de; LGS ve KPSS `/marka` sayfasında yalnızca küçük
"Yakında" kartlarıyla görünür.

**Wordmark:** uygulamadaki `TakipPlusWordmark` ile aynı: Outfit 800, harf aralığı −0.2 (≈ −0.0125em).
Yatay logodaki ürün adı Outfit 500, ürün renginde. Giriş ekranındaki büyük başlıkta açık mor–beyaz gradyan
(`#E2D4FF → #FFFFFF → #D6C5FF`) kullanılır.

Kurallar: çevrede en az "+" yüksekliği kadar boşluk; renk ve oran değiştirilmez, döndürülmez; artı
renklendirilmez. Parlama yalnızca hazır "ışıltılı" dosyalarda vardır, düz sürüme sonradan gölge, parlama ya da
kontur eklenmez. Uygulama ikonu ikinci bir çerçevenin içine konmaz. Yazım her zaman **Takip+** (artı bitişik).

## 3. Renk

| Token | Hex | Rol |
|---|---|---|
| `--violet-500` | `#8B5CF6` | Birincil (Electric Violet), Takip+ YKS UI vurgusu |
| `--violet-700` | `#6D28D9` | Birincil gradyan sonu |
| `--teal-400` | `#2DD4BF` | Veri rengi (grafik, Günün Odağı: Soru); marka rengi değil |
| `--emerald-500` | `#10B981` | Başarı |
| `--amber-500` | `#F59E0B` | Uyarı |
| `--red-500` | `#EF4444` | Hata |
| `--ink-900` | `#0F172A` | Arka plan |
| `--ink-850` | `#141C2E` | Yüzey |
| `--ink-750 → --ink-800` | `#232B44 → #1A2036` | Kart gradyanı |
| `--white` | `#F8FAFC` | Metin |
| `--slate-400` | `#94A3B8` | İkincil metin |
| `--ink-950` | `#0B0B10` | Uygulama ikonu ve açılış ekranı zemini (kit v1.0; eskiden `#0A0A1A`) |

**Site zemini (tasarım v2, Ekim 2026):** mağaza görselleriyle aynı dünya. Lacivert zemin yerini mor tonlu geceye
bıraktı; eski `--ink-*` adları bu aileye bağlı, iç sayfalar da aynı zemini kullanır.

| Token | Hex | Rol |
|---|---|---|
| `--uv-700 → --uv-900` | `#2A0E8F → #1E0B6B → #12083F` | Ultraviyole gökyüzü (hero; logo T'sinin başlangıcı) |
| `--night-900` | `#0E0828` | Sayfa zemini |
| `--night-850 / -800` | `#150D38 / #1C1248` | Yüzeyler |
| `--flare-400` | `#E056FD` | Logo T'sinin ucu; yalnızca çizgi uçları ve ışık |
| `--slate-400` | `#ACA6CC` | İkincil metin (mor tonlu gri, gece zemininde 8:1) |

Ekrandan taşan uygulama kartları uygulamanın kendi lacivert yüzeyini korur (`#27304D → #1A2036`): kart, uygulamanın
bir parçası olduğu için zeminle değil ekranla aynı renktedir.

**Günün Odağı dörtlüsü:** Saat = violet, Soru = turkuaz, Video = amber, Konu = kırmızı. Uygulamadaki hedef
kartlarıyla aynı; sitedeki mockup'lar ve OG görselleri bu dörtlüyü markanın veri dili olarak kullanır.

**Logo gradyanı (Takip+ YKS):** `#2A0E8F → #7C3AED → #E056FD` (45°). LGS: `#0A1F9E → #1D6BFF → #22E1FF`,
KPSS: `#8A2100 → #F25C05 → #FFA51F`. Değerler kitteki `renkler.css` / `renkler.json` dosyalarında.

**Turkuaz neden veri rengi:** `#2DD4BF`, Takip+ LGS'nin mavi-camgöbeği tonuna çok yakın. Ana marka rengi gibi
kullanılırsa ürün rengiyle karışır; bu yüzden grafik ve göstergelerde kalır. Tek istisna **HEDEF** anlamıdır: kesik
HEDEF çizgisi, "hedefe ulaşıldı" durumu ve (mağaza görsellerindeki gibi) hero başlığının son satırı. Başka başlıkta
renkli vurgu kullanılmaz.

**Ürün vurgusu:** Her ürün `src/data/products.ts` içinde `accent` / `accentDeep` tanımlar. Ürün sayfası
`--accent` değişkenini bu renkle ezer.

**Glow:** Mor, turkuaz ve amber yumuşak radyal ışıklar uygulamanın imzasıdır. Sitede yalnızca hero ve birkaç
büyük yüzeyde, düşük opaklıkla kullanılır (`.glow`).

### Rafine edilen iki nokta (uygulama için de öneri)

1. **Birincil buton gradyanı `#7C3AED → #6D28D9`.** `#8B5CF6` üzerinde beyaz metnin kontrastı 4.2:1 ve WCAG AA
   (4.5:1) sınırının altında. Sitede buton gradyanı bir ton koyudan (`#7C3AED`, 5.7:1) başlıyor. **Öneri:**
   uygulamadaki `primaryGradient` başlangıcını da `#7C3AED` yap; görsel fark çok küçük, okunabilirlik artıyor.
2. **Koyu zeminde mor metin `#A78BFA`.** `#8B5CF6` metin olarak `#0F172A` üzerinde 4.2:1. Küçük etiket ve
   linklerde `#A78BFA` (6.5:1) kullanılıyor. **Öneri:** uygulamada küçük mor metinlerde (ör. tarih satırı,
   "AKTİVİTE HARİTASI") aynı tonu kullan.

## 4. Tipografi

| Rol | Font | Ağırlık |
|---|---|---|
| Başlık, logo, giriş cümleleri, butonlar, etiketler | Outfit | 500–800 |
| Uzun gövde metni (paragraf, SSS cevabı, yasal metin) | Inter | 400–600 |
| Rakam (sayaç, net, süre) | Outfit, tablo rakamları (`tnum`) | 700–800 |
| Kod, hex değeri (yalnızca marka sayfası) | JetBrains Mono | 400–600 |

Sitenin sesi Outfit'tir; Inter yalnızca okunması uzun metinde. İlk ekranda Inter kullanılmadığı için ön yüklenmez.

Hepsi SIL OFL. Site fontları kendi sunucusundan, yalnızca Latin + Türkçe harflerle (ğ Ğ ı İ ş Ş) ve kullanılan
ağırlık aralığıyla sunar (`scripts/subset-fonts.py`, toplam ≈ 81 KB). Ölçek `clamp()` ile akışkan; gövde
metni hiçbir zaman 16 px'in altına inmez. Başlık harf aralığı −0.025em, dev başlıklar −0.035em.

## 5. Boşluk, köşe, derinlik, hareket

- **Boşluk:** 4/8 tabanlı (`--space-1` 4 px … `--space-10` 128 px). Bölüm dikey boşluğu `clamp(4rem, …, 8rem)`.
- **Köşe:** buton ve input 16 (uygulamayla aynı), küçük kart 20, büyük kart 28 (uygulamayla aynı), cihaz 46.
- **Çizgi:** 1 / 1.5 / 2 px. Ayırıcılar `rgb(148 163 184 / .14)`.
- **Derinlik:** üç gölge seviyesi (`--shadow-1..3`), hepsi üstte 1 px iç ışık çizgisiyle.
- **Hareket:** 120 ms (dokunma), 200 ms (hover), 360 ms (açılma), 900 ms (imza). Eğri
  `cubic-bezier(.22,1,.36,1)`. Yalnızca `transform` ve `opacity`; `prefers-reduced-motion` açıksa hareket yok.

## 6. İkonografi

Tek set: 24×24 ızgarada, 1.8 px çizgili, yuvarlak uçlu, dolgusuz çizgi ikonlar (sitede satır içi SVG).
Uygulamadaki Material ikonlarla aynı çizgi karakterini taşır. Emoji ikon yerine kullanılmaz.

## 7. İmza detaylar

1. **HEDEF çizgisi:** mor→pembe parlayan ilerleme eğrisi, beyaz veri noktaları ve turkuaz kesik HEDEF çizgisi
   (mağaza görsellerinin hepsinde). Sitede hero'da yükselir, header'ın alt kenarında sayfa boyunca HEDEF'e ilerler
   (sona varınca uç turkuaza döner), finalde hedefi keser ve kesişimde logodaki artı belirir.
2. **Günün Odağı dörtlüsü:** dört renkli hedef kartı; rakamlar sıfırdan sayılır, çubuklar dolar.
3. **Kareli defter:** 22 px aralıklı nokta ızgarası; telefonların arkasında, kenarlara doğru söner.
4. **Ekrandan taşan kartlar:** gerçek ekranın üstünde, uygulamanın kendi bileşenlerinden kopyalanmış kartlar.
5. **Artı işareti:** liste işaretleri, modül hapları ve SSS'te açılınca çarpıya dönen düğme.

## 8. Görsel içerik kuralları

- Uydurma ekran tasarlanmaz. Sitede uygulamanın örnek veriyle çekilmiş gerçek ekranları kullanılır; ekrandan taşan
  kartlar yalnızca uygulamada gerçekten olan bileşenleri ve metinleri kopyalar.
- Üniversite logosu, stok fotoğraf, gerçek kişi adı (ör. premium plan adlarındaki kişi) ve başarım adlarındaki
  film isimleri/görselleri kullanılmaz.
- Sıralama/puan rakamları her zaman "örnek" ya da "tahmin" olarak etiketlenir; kaynak: uygulamaya gömülü,
  YÖK Atlas kaynaklı veri seti.
