/**
 * Uygulama ekran görüntüleri: src/assets/app/<ad>.webp
 * Kaynak: uygulamanın örnek veriyle çekilmiş ham ekranları
 * (Claude outputs/takipplus/magaza-final/ham-ekranlar). Telefon 1080×2400,
 * tablet 2064×2752. Derlemede AVIF + WebP, birden çok genişlik üretilir.
 *
 * Kural: gerçek kullanıcı adı, profil fotoğrafı ya da mesaj görünen ekran
 * eklenmez (ör. sıralama ekranındaki gerçek kullanıcı adları).
 */
export const PHONE = { w: 1080, h: 2400 } as const;
export const TABLET = { w: 2064, h: 2752 } as const;

export const screens = {
  'home-harita': { label: 'Ana sayfa', alt: 'Takip+ YKS ana sayfası: son 30 günün aktivite haritası, sekmeler ve Günün Odağı' },
  'home-program': { label: 'Bugün', alt: 'Bugün sekmesi: Günün Odağı hedef kartları ve saatleriyle Bugünün Programı' },
  'konular-tab': { label: 'Konular', alt: 'Konular sekmesi: TYT ve AYT konu takibi, konu takvimi' },
  'optik-kurulum': { label: 'Çalışma', alt: 'Optik Çözüm kurulumu: oturum tipi, alan, ders, soru sayısı ve zorluk seçimi' },
  optik: { label: 'Optik Çözüm', alt: 'Optik Çözüm: ekrandaki optik formda A’dan E’ye şık işaretleme ve soru süresi' },
  'perf-tyt': { label: 'Performans Analizi', alt: 'Performans Analizi: en düşük, son ve en yüksek net, ilerleme grafiği' },
  'perf-tyt-net': { label: 'Denemeler', alt: 'Net Analizi: derslere göre hedef, ortalama ve son net tablosu' },
  'hedefnet-tab': { label: 'Hedef&Net', alt: 'Hedef&Net sekmesi: sınava kalan süre, hedef üniversite ve Net Sihirbazı' },
  'hedef-arama-2': { label: 'Bölüm/Üniversite Seç', alt: 'Bölüm ve üniversite arama: başarı sıralaması ve taban puanlarıyla liste' },
  plan: { label: 'Planlar', alt: 'Plan Takvimi: günlük saat, soru, video ve konu hedefleri, planlanan aktiviteler' },
  'yap-detay': { label: 'Yapamadıklarım', alt: 'Yapamadıklarım: fotoğrafı eklenmiş soru, hata sebebi ve tekrar ilerlemesi' },
  'yap-liste': { label: 'Yapamadıklarım listesi', alt: 'Yapamadıklarım listesi: derslere göre gruplanmış sorular ve tekrar durumları' },
  pomodoro: { label: 'Çalışma Asistanı', alt: 'Çalışma Asistanı: 25 dakikalık Pomodoro sayacı' },
  sosyal: { label: 'Sosyal', alt: 'Sosyal merkez: arkadaşlar, düellolar, Global Sohbet, Soru Paylaşımı, klanlar ve sıralamalar' },
  'tablet-home': { label: 'Tablet ana sayfa', alt: 'Takip+ YKS tablette: aktivite haritası ve Günün Odağı geniş ekranda' },
} as const;

export type ScreenName = keyof typeof screens;
