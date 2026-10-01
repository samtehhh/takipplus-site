/**
 * Uygulama ekranları: src/assets/app/<ad>.webp, scripts/prepare-screens.mjs ile üretilir.
 *
 * p-*: kurucunun kendi hesabıyla (Samet) çekilmiş telefon ekranları, olduğu gibi (720×1600).
 * t-*: iPad ekranları (768×1024 pt, 2x; 1536×2048).
 * v-*: tur videolarının (public/videos/tur-*.mp4) ilk karesi; video oynayana kadar kapak.
 * s-*: mağaza görselleri, magaza-v3 (App Store iPhone 1290×2796, iPad 2064×2752), olduğu gibi.
 *
 * Cihaz çerçevesi sahte durum çubuğu ya da Dynamic Island çizmez: ekran görüntüleri tam görünür.
 * Kural: başka kullanıcıların adı ya da kullanıcı adı (@…) görünen ekran eklenmez
 * (sıralama ekranları bu yüzden kullanılmıyor).
 */
export const PHONE = { w: 720, h: 1600 } as const;
export const TABLET = { w: 1536, h: 2048 } as const;
export const STORE = {
  iphone: { w: 1290, h: 2796 },
  ipad: { w: 2064, h: 2752 },
} as const;

export const screens = {
  'p-home-sayac': { alt: 'Takip+ YKS ana sayfası: YKS 2027’ye kalan süre, hedef Boğaziçi Endüstri Mühendisliği ve Günün Odağı kartları' },
  'p-home-bugun': { alt: 'Bugün sekmesi: son 30 günün aktivite haritası, Günün Odağı ve Bugünün Programı' },
  'p-home-calisma': { alt: 'Çalışma sekmesi: Pomodoro, sayaç ve geri sayım kartları, çalışma sayacı ve optik özetleri' },
  'p-konular': { alt: 'TYT Konuları: derslere göre ilerleme yüzdesi ve konu durumları' },
  'p-konu-durum': { alt: 'TYT Geometri konuları: bitti, tekrar lazım ve başlanmadı durumları' },
  'p-tekrar-planla': { alt: 'Tekrar Planla: sözel tekrar için Ebbinghaus, hafta sonu ya da özel tekrar sistemi' },
  'p-konu-takvimi': { alt: 'Konu Takvimi: hangi konunun hangi gün çalışıldığını gösteren takvim' },
  'p-pomodoro': { alt: 'Çalışma Asistanı: 25 dakikalık Pomodoro sayacı' },
  'p-optik': { alt: 'Optik Çözüm: ekrandaki optik formda A’dan E’ye şık işaretleme' },
  'p-performans': { alt: 'Performans Analizi: en düşük 59, en son ve en yüksek 97,75 net, ilerleme grafiği' },
  'p-net-analizi': { alt: 'Performans Analizi: net ilerleme grafiği ve ders ders net analizi' },
  'p-ders-turkce': { alt: 'TYT Türkçe: ortalama, en yüksek ve son net, deneme grafiği' },
  'p-deneme-gecmisi': { alt: 'Deneme Geçmişi: 20 genel deneme, yayınlara göre TYT ve AYT netleri' },
  'p-yap-liste': { alt: 'Yapamadıklarım: derslere göre soruların fotoğrafları, hata sebepleri ve tekrar durumları' },
  'p-yap-analiz': { alt: 'Yapamadıklarım analizi: yüzde 37 dikkat, yüzde 45 bilgi, yüzde 16 strateji hatası ve en zayıf konular' },
  'p-yap-detay': { alt: 'Yapamadıklarım soru ayrıntısı: işlem hatası, koç önerisi ve tekrar ilerlemesi' },
  'p-hedef-detay': { alt: 'Hedef Detayı: Boğaziçi Üniversitesi Endüstri Mühendisliği, taban puan 534.828, tahmini sıralama 2.197' },
  'p-uni-liste': { alt: 'Bölüm ve üniversite seçimi: başarı sıralaması ve taban puanlarıyla liste' },
  'p-net-sihirbazi': { alt: 'Net Sihirbazı: puan ve sıralama hesabı, hedefe 18.180 sıra kaldı' },
  'p-gunluk-takvim': { alt: 'Günlük Takvim: ay görünümü ve günün çalışma, soru, video, konu halkaları' },
  'p-plan-hedefler': { alt: 'Plan Takvimi: günlük çalışma süresi, soru, video ve konu hedefleri' },
  'p-plan-takvimi': { alt: 'Plan Takvimi: planlanan aktiviteler ve soru tekrarları' },
  'p-sosyal': { alt: 'Sosyal merkez: arkadaşlar, düellolar, Global Sohbet, Soru Paylaşımı, klanlar ve sıralamalar' },
  't-home-sayac': { alt: 'Takip+ YKS iPad’de: YKS 2027 sayacı, sekmeler ve Günün Odağı geniş ekranda' },
  't-performans': { alt: 'iPad’de Performans Analizi: en düşük, en son, en yüksek ve ortalama net kartları' },
  't-konular': { alt: 'iPad’de TYT Konuları: konu durumları geniş listede' },
  't-plan': { alt: 'iPad’de Plan Takvimi: günlük hedefler ve planlanan aktiviteler' },
  't-yap': { alt: 'iPad’de Yapamadıklarım: derslere göre sorular yan yana' },
  't-home-harita': { alt: 'Takip+ YKS iPad’de: son 30 günün aktivite haritası, sekmeler ve Günün Odağı' },
  'v-bugun': { alt: 'Bugün sekmesi: YKS 2027 sayacı, Günün Odağı ve Bugünün Programı' },
  'v-konular': { alt: 'TYT Konuları: konu durumunu güncelleme ve tekrar planlama' },
  'v-calisma': { alt: 'Çalışma sekmesi: Pomodoro sayacını başlatma' },
  'v-denemeler': { alt: 'Deneme takibi: en düşük, en son ve en yüksek net, ilerleme grafiği ve deneme ayrıntısı' },
  'v-hedef': { alt: 'Hedef belirleme: bölüm ve üniversite seçimi, taban puan ve tahmini netler' },
  'v-planlar': { alt: 'Plan Takvimi: günlük hedefler ve planlanan aktiviteler' },
} as const;

export type ScreenName = keyof typeof screens;

/** Mağaza görselleri: başlık metni görselin içinde; alt metin bu başlığı taşır. */
export const storeShots = {
  iphone: [
    'Tüm YKS hazırlığın tek uygulamada.',
    'Her deneme, yarının planı.',
    'Telefonun optik forma dönüşsün.',
    'Hedefine kaç sıra kaldı?',
    'Her yanlışın bir dersi var.',
    'Odaklan. Kaçamak yok.',
    'Ne çalışacağını düşünme, uygula.',
    'Arkadaşına düello at.',
    'Müfredatın bir bakışta.',
    'Saymakla bitmez.',
  ],
  ipad: [
    'Tüm YKS hazırlığın tek uygulamada.',
    'Her deneme, yarının planı.',
    'Tabletin optik forma dönüşsün.',
    'Hedefine kaç sıra kaldı?',
    'Her yanlışın bir dersi var.',
    'Odaklan. Kaçamak yok.',
    'Ne çalışacağını düşünme, uygula.',
    'Arkadaşına düello at.',
    'Müfredatın bir bakışta.',
    'Saymakla bitmez.',
  ],
} as const;
