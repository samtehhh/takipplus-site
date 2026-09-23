/**
 * Uygulama ekran görüntüleri. Dosyalar: assets/screens/<ad>.png
 * Beklenen: 1290×2796 piksel, koyu tema, PNG. Dosya eklenince site bir
 * sonraki derlemede yer tutucunun yerine gerçek görüntüyü (AVIF/WebP,
 * 1x/2x/3x) koyar.
 */
export const SCREEN_W = 1290;
export const SCREEN_H = 2796;

export const screens = {
  bugun: { label: 'Bugün', alt: 'Takip+ YKS Bugün ekranı: günün rutinleri, tekrar zamanı gelen sorular ve hedef ilerlemesi' },
  konular: { label: 'Konular', alt: 'Konular ekranı: TYT ve AYT ders ve konu listesi, konu durumları' },
  'calisma-sayac': { label: 'Çalışma sayacı', alt: 'Çalışma sayacı: Pomodoro, kronometre ve geri sayım' },
  'optik-cozum': { label: 'Optik Çözüm', alt: 'Optik Çözüm: dijital optik form üzerinde soru işaretleme ve soru süresi' },
  'optik-rapor': { label: 'Optik raporu', alt: 'Optik Çözüm analiz raporu: soru başına süre ve sonuçlar' },
  'deneme-analiz': { label: 'Deneme analizi', alt: 'Deneme analiz panosu: net grafikleri ve deneme geçmişi' },
  yapamadiklarim: { label: 'Yapamadıklarım', alt: 'Yapamadıklarım: fotoğrafı eklenmiş sorular ve aralıklı tekrar takvimi' },
  'hedef-net': { label: 'Hedef&Net', alt: 'Hedef&Net: üniversite ve bölüm arama, hedef seçimi' },
  'net-sihirbazi': { label: 'Net Sihirbazı', alt: 'Net Sihirbazı: net, puan ve sıralama hesabı' },
  planlar: { label: 'Planlar', alt: 'Planlar: günlük takvim ve plan takvimi' },
  'sosyal-merkez': { label: 'Sosyal merkez', alt: 'Sosyal merkez: arkadaşlar, düellolar, klanlar ve sıralamalar' },
  duello: { label: 'Düello', alt: 'Pomodoro düellosu ekranı' },
  siralamalar: { label: 'Sıralamalar', alt: 'Haftalık çalışma süresine göre sıralamalar' },
  basarimlar: { label: 'Başarımlar', alt: 'Başarımlar ekranı' },
  'widget-android': { label: 'Android widget', alt: 'Android ana ekranında TYT, AYT ve YDT geri sayım widget’ı' },
} as const;

export type ScreenName = keyof typeof screens;
