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
- Tahmine tahmin, örneğe örnek deriz; her mockup "Örnek veri" notu taşır.
- Tanıtım dili ve ünlem yığını yok. Emoji çok az ve yalnızca uygulama içi bağlamda.
- Terimler uygulamayla birebir: **Klan** (kulüp değil), **Optik Çözüm** (optik tarama değil), **Hedef&Net**,
  **Yapamadıklarım**, **Günün Odağı**, **Net Sihirbazı**, **Bize Bildir**.

**Kısa marka metni (basın için):**
> Takip+, sınava hazırlanan öğrenciler için çalışma ve takip uygulamaları geliştiren bağımsız bir Türk
> girişimidir. İlk ürünü Takip+ YKS; konu takibi, deneme ve net analizi, Optik Çözüm, hedef belirleme,
> çalışma planı ve sosyal özellikleri tek uygulamada toplar.

## 2. Logo

Kaynak geometri: `src/lib/mark.ts` (uygulama ikonunun vektör hâli). Tüm dosyalar `npm run build` sırasında
`scripts/brand-assets.mjs` ile üretilir ve `/marka` sayfasından indirilebilir.

| Dosya | Kullanım |
|---|---|
| `takipplus-symbol.svg` / `-512.png` / `-1024.png` | Sembol (uygulama ikonu biçimi), her zeminde |
| `takipplus-horizontal-on-dark.svg` / `.png` | Koyu zeminde yatay logo |
| `takipplus-horizontal-on-light.svg` / `.png` | Açık zeminde yatay logo |
| `takipplus-mark-on-dark.svg`, `-on-light.svg` | Karo olmadan T+ işareti |
| `takipplus-wordmark-on-dark.svg`, `-on-light.svg` | Yazı logo (yola dönüştürülmüş, font gerektirmez) |
| `takipplus-app-icon.png` | Orijinal raster uygulama ikonu (512 px, optimize) |

Kurallar: çevrede en az "+" yüksekliği kadar boşluk; yatay logo en az 96 px, sembol en az 24 px; renk, oran
ve harf aralığı değiştirilmez; gölge, parlama, kontur eklenmez. Yazım her zaman **Takip+** (artı bitişik).

Wordmark: Outfit 800, harf aralığı −0.2 (Flutter) ≈ −0.0125em.

## 3. Renk

| Token | Hex | Rol |
|---|---|---|
| `--violet-500` | `#8B5CF6` | Birincil (Electric Violet), Takip+ YKS vurgusu |
| `--violet-700` | `#6D28D9` | Birincil gradyan sonu |
| `--teal-400` | `#2DD4BF` | İkincil |
| `--emerald-500` | `#10B981` | Başarı |
| `--amber-500` | `#F59E0B` | Uyarı |
| `--red-500` | `#EF4444` | Hata |
| `--ink-900` | `#0F172A` | Arka plan |
| `--ink-850` | `#141C2E` | Yüzey |
| `--ink-750 → --ink-800` | `#232B44 → #1A2036` | Kart gradyanı |
| `--white` | `#F8FAFC` | Metin |
| `--slate-400` | `#94A3B8` | İkincil metin |
| `--ink-950` | `#0A0A1A` | Uygulama ikonu zemini |

**Günün Odağı dörtlüsü:** Saat = violet, Soru = turkuaz, Video = amber, Konu = kırmızı. Uygulamadaki hedef
kartlarıyla aynı; sitedeki mockup'lar ve OG görselleri bu dörtlüyü markanın veri dili olarak kullanır.

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
| Başlık, logo | Outfit | 600–800 |
| Gövde, arayüz | Inter | 400–600 |
| Rakam, süre, kod | JetBrains Mono | 400–600 |

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

1. **Günün Odağı dörtlüsü:** dört renkli hedef kartı; ilerleme çubukları görünür olunca dolar.
2. **Aktivite haritası:** 30 günlük ısı haritası (Yok/Az/Orta/Çok); ana sayfada hücreler sırayla yanar.
3. **Artı işareti:** logodaki "+" bölüm etiketlerinde ve liste işaretlerinde yapısal bir öğe olarak.

## 8. Görsel içerik kuralları

- Uydurma ekran tasarlanmaz. Gerçek ekran görüntüleri gelene kadar yalnızca uygulamadaki yapıyı izleyen küçük
  mockup kartları kullanılır ve hepsi "Örnek veri" notu taşır.
- Üniversite logosu, stok fotoğraf, gerçek kişi adı (ör. premium plan adlarındaki kişi) ve başarım adlarındaki
  film isimleri/görselleri kullanılmaz.
- Sıralama/puan rakamları her zaman "örnek" ya da "tahmin" olarak etiketlenir; kaynak: uygulamaya gömülü,
  YÖK Atlas kaynaklı veri seti.
