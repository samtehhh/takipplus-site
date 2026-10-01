/**
 * Takip+ YKS sayfa içeriği. Her metin uygulamanın kaynak kodundaki
 * gerçek davranışla uyumlu olmalı (bkz. README → "Ürün gerçekleri").
 * Son doğrulama: 1 Ekim 2026 (giriş yöntemleri, hesap silme, widget,
 * rehber adım sayısı, Kontrol Zamanı, Premium kapsamı).
 */
import { contactEmail } from '../../config/site';
import type { ScreenName } from '../screens';

export const seo = {
  title: 'Takip+ YKS (Takip Plus): YKS takip uygulaması',
  description:
    'YKS takip uygulaması: TYT AYT konu takibi, deneme takibi, net hesaplama, hedef üniversite, YKS çalışma programı ve Optik Çözüm tek uygulamada.',
};

export const hero = {
  status: 'Android ve iOS için geliştiriliyor',
  /** Satır satır (mağaza görseli 01 gibi). Son satır HEDEF rengiyle yazılır. */
  title: ['Tüm YKS', 'hazırlığın', 'tek uygulamada.'],
  lead: 'Konu, deneme, net ve hedef takibin tek yerde. Kendi koçluğunu yap, başarını kanıtla.',
  visualLabel:
    'Takip+ YKS ana sayfası: YKS 2027’ye 260 gün, hedef Boğaziçi Endüstri Mühendisliği. Günün Odağı: 8 saatin 4,2’si, 100 sorunun 80’i, 10 videonun 5’i ve 5 konunun 5’i tamam.',
};

export type TabIcon = 'bugun' | 'konular' | 'calisma' | 'denemeler' | 'hedef' | 'planlar' | 'sosyal';

/** Uygulamanın gerçek alt menü sırası. */
export const tour = {
  title: 'Altı sekme, bir günün akışı.',
  lead: 'Alt menüdeki sıra günün sırasını izler: bugünden başlar, konuya, çalışmaya, denemeye ve hedefe uzanır, plana döner.',
  tabs: [
    {
      id: 'bugun',
      name: 'Bugün',
      icon: 'bugun',
      screen: 'v-bugun',
      video: '/videos/tur-bugun.mp4',
      text: 'Günün Odağı, rutinlerin, tekrar zamanı gelen soruların ve plan görevlerin tek listede. Uygulamayı açınca ne yapacağını düşünmezsin, başlarsın.',
    },
    {
      id: 'konular',
      name: 'Konular',
      icon: 'konular',
      screen: 'v-konular',
      video: '/videos/tur-konular.mp4',
      text: 'TYT ve AYT’nin bütün konuları. Çalışılıyor, bitti ya da tekrar lazım diye işaretle; tekrarını Ebbinghaus, hafta sonu ya da kendi tarihinle planla.',
    },
    {
      id: 'calisma',
      name: 'Çalışma',
      icon: 'calisma',
      screen: 'v-calisma',
      video: '/videos/tur-calisma.mp4',
      text: 'Pomodoro, kronometre ve geri sayım tek dokunuşta. Optik Çözüm oturumların, rutinlerin ve haftalık ders programın da burada.',
    },
    {
      id: 'denemeler',
      name: 'Denemeler',
      icon: 'denemeler',
      screen: 'v-denemeler',
      video: '/videos/tur-denemeler.mp4',
      text: 'Genel ve branş denemelerini ders ders gir. Deneme geçmişin, netlerin, hedefe kalan farkın ve gelişim grafiğin kendiliğinden çıkar.',
    },
    {
      id: 'hedef-net',
      name: 'Hedef&Net',
      icon: 'hedef',
      screen: 'v-hedef',
      video: '/videos/tur-hedef.mp4',
      text: 'Hedef üniversiteni ve bölümünü seç; taban puanı, başarı sırasını ve gereken tahmini netleri gör. Net Sihirbazı netlerinden puanını ve sıralamanı hesaplar, hedefe kaç sıra kaldığını gösterir.',
    },
    {
      id: 'planlar',
      name: 'Planlar',
      icon: 'planlar',
      screen: 'v-planlar',
      video: '/videos/tur-planlar.mp4',
      text: 'Günlük takvim, plan takvimi, rutinler ve ders programı. Saat, soru, video ve konu hedeflerini günlere yay.',
    },
  ] as { id: string; name: string; icon: TabIcon; screen: ScreenName; video?: string; text: string }[],
};

export type ChapterVisual = 'deneme' | 'optik' | 'hedef' | 'yapamadiklarim' | 'odak' | 'sosyal' | 'konular' | 'planlar';

export const chapters: {
  id: string;
  visual: ChapterVisual;
  layout: 'split' | 'split-flip' | 'poster' | 'band' | 'pair';
  /** Uygulamada hangi sekmede (görselin altındaki etiket) */
  tab: string;
  tabIcon: TabIcon;
  title: string;
  text: string;
  points?: string[];
  note?: string;
  /** Görselin ekran okuyucu açıklaması */
  label: string;
}[] = [
  {
    id: 'deneme-analizi',
    visual: 'deneme',
    layout: 'split',
    tab: 'Denemeler sekmesinde',
    tabIcon: 'denemeler',
    title: 'Her deneme, yarının planı.',
    text: 'Netlerini ders ders gir. En düşük, en yüksek ve son netin, hata türlerin ve en zayıf konuların kendiliğinden çıkar; yanlışların tekrar listene düşer.',
    points: ['Genel ve branş denemeleri', 'Ders ders gelişim grafiği', 'Deneme ve soru takvimi'],
    label:
      'Performans Analizi ekranı. En düşük net 59, en son ve en yüksek net 97,75. Hata dağılımı: yüzde 37 dikkat, yüzde 45 bilgi, yüzde 16 strateji. En zayıf konular Fiil Çatısı, Kimyanın Temel Kanunları, Nüfus ve Yerleşme.',
  },
  {
    id: 'optik-cozum',
    visual: 'optik',
    layout: 'split-flip',
    tab: 'Çalışma sekmesinde',
    tabIcon: 'calisma',
    title: 'Telefonun optik forma dönüşsün.',
    text: 'Soruları ekrandaki optik formda işaretle. Her sorunun süresi ayrı ölçülür; doğru ama yavaş çözdüğün sorular raporda Kritik Sorular olarak karşına çıkar.',
    points: ['Soru başına süre', 'Net ve puan hesabı', 'Ayrıntılı analiz raporu'],
    note: 'Kâğıt optik formu taramaz; işaretlemeyi telefonda yaparsın.',
    label:
      'Optik Çözüm ekranı: 40 soruluk testin 31. sorusu, bu soruda 1 dakika 34 saniye. Kritik Sorular raporu: ideal süre 90 saniyeyken Sayı Problemleri 148, Fonksiyonlar 131, Olasılık 122 saniye. Sonuç 32 doğru, 7 yanlış, 30,25 net.',
  },
  {
    id: 'hedef-net',
    visual: 'hedef',
    layout: 'poster',
    tab: 'Hedef&Net sekmesinde',
    tabIcon: 'hedef',
    title: 'Hedefine kaç sıra kaldı?',
    text: 'Hedef bölümünü seç. Puanın, sıralaman ve aradaki fark YÖK Atlas verisiyle hesaplanır; Net Sihirbazı hedefe ulaşmak için gereken netleri gösterir.',
    note: 'Sıralama ve taban verileri uygulamaya gömülü, YÖK Atlas kaynaklı veri setinden gelir. Hesaplar senin netlerine göre yapılan tahminlerdir; görseldeki değerler örnektir.',
    label:
      'Bölüm ve üniversite seçimi. Hedef Boğaziçi Üniversitesi Endüstri Mühendisliği, başarı sırası 2.197. Netlerle hesaplanan tahmini sıralama 20.377; hedefe 18.180 sıra kaldı.',
  },
  {
    id: 'konu-takibi',
    visual: 'konular',
    layout: 'pair',
    tab: 'Konular sekmesinde',
    tabIcon: 'konular',
    title: 'Müfredatın bir bakışta.',
    text: 'TYT ve AYT’nin bütün konularını bitti, tekrar lazım, çalışılıyor ya da başlanmadı diye işaretle. Tekrarını Ebbinghaus, hafta sonu ya da kendi seçtiğin tarihlerle planla.',
    points: ['Ders ders ilerleme yüzdesi', 'Sözel tekrar ve soru çözümü planı', 'Konu takvimi'],
    label:
      'İki ekran: TYT Geometri konuları bitti, tekrar lazım ve başlanmadı durumlarıyla; yanında Tekrar Planla penceresi, Ebbinghaus sistemiyle 1, 7, 14 ve 30. gün tekrarları.',
  },
  {
    id: 'yapamadiklarim',
    visual: 'yapamadiklarim',
    layout: 'band',
    tab: 'Denemeler sekmesinde',
    tabIcon: 'denemeler',
    title: 'Her yanlışın bir dersi var.',
    text: 'Yapamadığın sorunun fotoğrafını çek, hata sebebini seç. Tekrar günü geldiğinde soru Günün Odağı’nda karşına çıkar.',
    label:
      'Yapamadıklarım: TYT Matematik, İşçi Emek Problemleri sorusu. Hata sebebi Konu Eksiği, not: oranı ters kurdum. Tekrar planı Ebbinghaus: bugün, 3., 7. ve 30. gün.',
  },
  {
    id: 'calisma-sayaci',
    visual: 'odak',
    layout: 'split',
    tab: 'Çalışma sekmesinde',
    tabIcon: 'calisma',
    title: 'Odaklan. Kaçamak yok.',
    text: 'Pomodoro, kronometre ya da geri sayımla çalış; süren kendiliğinden kaydedilir. Pomodoro sırasında sürpriz bir kontrol gelir: 120 saniye içinde onaylamazsan o set sayılmaz.',
    points: ['Pomodoro, kronometre, geri sayım', 'Rutinler ve doğru-yanlış girişi', 'Haftalık ders programı'],
    label:
      'Çalışma Asistanı: 25 dakikalık Pomodoro. Ekranda Kontrol Zamanı penceresi: devam etmek için 120 saniye içinde onayla.',
  },
  {
    id: 'sosyal',
    visual: 'sosyal',
    layout: 'split-flip',
    tab: 'Ana sayfadaki Sosyal’de',
    tabIcon: 'sosyal',
    title: 'Arkadaşına düello at.',
    text: 'Pomodoro ve kopya kontrollü optik düellolarına katıl, klanınla birlikte çalış, haftalık sıralamada yerini gör. Kimin neyi göreceğini Gizlilik Ayarları’ndan sen seçersin.',
    points: ['Pomodoro ve Optik düellosu', 'Klanlar ve Global Sohbet', 'Soru Paylaşımı'],
    label:
      'Sosyal merkez. 40 soruluk optik düellosunu 33 netle kazandın, rakibin 29,5 net. Haftalık bölüm sıralamasında 17 saat 5 dakikayla ikincisin.',
  },
  {
    id: 'planlar',
    visual: 'planlar',
    layout: 'pair',
    tab: 'Planlar sekmesinde',
    tabIcon: 'planlar',
    title: 'Ne çalışacağını düşünme, uygula.',
    text: 'Günlük saat, soru, video ve konu hedeflerini koy. Planladığın aktiviteler ve soru tekrarların takvime yerleşir; ders programın ve rutinlerin her sabah Günün Odağı’nda hazır olur.',
    points: ['Plan takvimi ve günlük takvim', 'Rutinler ve haftalık ders programı', 'Saat, soru, video ve konu hedefi'],
    label:
      'İki ekran: Plan Takvimi’nde planlanan aktiviteler ve soru tekrarları, yanında Günlük Takvim. Önde Bugünün Programı: dört görevden ikisi tamam.',
  },
];

/** Mağaza görselindeki "Saymakla bitmez" listesi; renk, artı işaretinin rengi. */
export const modules = {
  title: 'Saymakla bitmez.',
  lead: 'Hepsi birbirine bağlı, hepsi tek uygulamada. Telefonda da tablette de.',
  items: [
    ['Günün Odağı', 'violet'],
    ['Konu Takibi', 'violet'],
    ['Konu Takvimi', 'amber'],
    ['Pomodoro', 'red'],
    ['Kronometre', 'red'],
    ['Geri Sayım', 'red'],
    ['Optik Çözüm', 'amber'],
    ['Kritik Sorular', 'amber'],
    ['Analiz Raporu', 'teal'],
    ['Deneme Takibi', 'teal'],
    ['Hata Analizi', 'red'],
    ['Yapamadıklarım', 'red'],
    ['Soru Takvimi', 'red'],
    ['Ebbinghaus Tekrarı', 'teal'],
    ['Net Sihirbazı', 'violet'],
    ['Hedef Bölüm', 'violet'],
    ['YÖK Atlas Verisi', 'green'],
    ['Günlük Takvim', 'blue'],
    ['Plan Takvimi', 'blue'],
    ['Rutinler', 'blue'],
    ['Ders Programı', 'blue'],
    ['Düellolar', 'teal'],
    ['Klanlar', 'violet'],
    ['Global Sohbet', 'violet'],
    ['Soru Paylaşımı', 'violet'],
    ['Sıralamalar', 'amber'],
    ['55 Başarım', 'amber'],
    ['171 Adımlık Rehber', 'slate'],
    ['Gizlilik Ayarları', 'slate'],
    ['Android Widget', 'slate'],
  ] as [string, 'violet' | 'amber' | 'red' | 'teal' | 'green' | 'blue' | 'slate'][],
  tabletLabel: 'Aynı hesap, her ekranda: iPad’de aktivite haritası ve Günün Odağı, iPhone’da YKS 2027 sayacı.',
};

/**
 * Ücretsiz ve Premium: uygulamadaki Premium ekranının tablosuyla aynı kapsam.
 * (Uygulamadaki "Kulüpler" ve "Optik Tarama" ifadeleri burada doğru adlarıyla,
 * "Klanlar" ve "Optik Çözüm" olarak yazıldı.)
 */
export const plans = {
  title: 'Ücretsiz başla, hazır olunca Premium’a geç.',
  lead: 'Sosyal ve Hedef Belirleme ücretsiz. Takibin geri kalanı Premium ile açılır.',
  free: [
    { label: 'Sosyal', detail: 'Arkadaşlar, Klanlar, Düellolar' },
    { label: 'Hedef Belirleme', detail: 'Üniversite ve bölüm arama, sıralama hesabı' },
  ],
  premium: [
    { label: 'Konu Takibi', detail: 'TYT ve AYT konuları, konu takvimi' },
    { label: 'Deneme Takibi', detail: 'Net girişi, analiz, takvim, sıralama grafiği' },
    { label: 'Optik Çözüm', detail: 'Dijital optik form, puan hesabı, analiz raporu' },
    { label: 'Çalışma Planlama', detail: 'Pomodoro, rutinler, ders programı' },
    { label: 'Yapamadıklarım', detail: 'Soru fotoğrafı, aralıklı tekrar takvimi' },
  ],
  periods: [
    { name: 'Haftalık', note: 'Kısa bir dönem için' },
    { name: 'Aylık', note: 'İlk 3 gün ücretsiz' },
    { name: 'Sınava Kadar', note: 'Aylığa göre yaklaşık %45 avantajlı' },
  ],
  foot: 'Fiyatlar uygulama mağazalarda yayına çıktığında netleşecek. Abonelikler Google Play ve App Store üzerinden yönetilir, dönem sonunda otomatik yenilenir ve istediğin zaman iptal edilebilir.',
};

/** Sınav geri sayımı: uygulamadaki tahmini TYT oturumu (lib/screens/ana_panel.dart). */
export const exam = {
  label: 'TYT',
  iso: '2027-06-19T10:15:00+03:00',
  dateText: '19 Haziran 2027',
  note: 'Tahmini tarih. ÖSYM 2027 takvimini açıkladığında güncellenecek.',
};

export const faq = [
  {
    q: 'Takip+ (Takip Plus) nedir?',
    a: '<p>Takip+ (Takip Plus), YKS’ye hazırlanan öğrenciler için geliştirilmiş bir YKS takip ve analiz uygulaması. Konu takibi, deneme netleri, çalışma süresi, hedef sıralama ve optik çözüm analizlerini tek uygulamada toplar. Böylece öğrenci nerede olduğunu kendisi görür, eksiklerini kendisi bulur ve kendi koçluğunu yapabilir.</p><p>Takip+, bu kadar kapsamlı takip ve analizi tek yerde, yalnızca öğrenciye odaklanarak sunmak için tasarlandı.</p>',
  },
  {
    q: 'Takip+ bir sosyal medya takipçi hizmeti mi?',
    a: '<p>Hayır. Takip+ takipçi, beğeni ya da izlenme satmaz; adındaki “takip”, öğrencinin kendi ders ve deneme takibini anlatır. Resmî sitemiz takipplus.com.tr, resmî hesaplarımız Instagram, TikTok ve YouTube’da @takipplus_yks.</p>',
  },
  {
    q: 'Takip+ YKS ne zaman çıkacak?',
    a: '<p>Uygulama Android ve iOS için geliştiriliyor, henüz mağazalarda değil. Yayın tarihi kesinleştiğinde erken erişim listesindekilere ilk biz haber vereceğiz.</p>',
  },
  {
    q: 'Takip+ YKS ücretsiz mi?',
    a: '<p>Ücretsiz planda Sosyal ve Hedef Belirleme özellikleri var. Konu ve deneme takibi, Optik Çözüm, çalışma planlama ve Yapamadıklarım Premium ile açılır.</p>',
  },
  {
    q: 'Premium nasıl işleyecek?',
    a: '<p>Haftalık, Aylık ve Sınava Kadar olmak üzere üç plan olacak. Aylık planı 3 gün ücretsiz deneyebilirsin. Sınava Kadar planının fiyatı, satın aldığın anda sınava kalan ay sayısına göre hesaplanır ve aylık plana göre yaklaşık %45 daha avantajlıdır. Kesin fiyatları yayında paylaşacağız.</p><p>Planlar dönem sonunda otomatik yenilenir; istediğin zaman Google Play ya da App Store hesap ayarlarından iptal edebilirsin.</p>',
  },
  {
    q: 'Optik Çözüm optik formumu kamerayla mı tarıyor?',
    a: '<p>Hayır. Optik Çözüm’de telefonun dijital bir optik forma dönüşür: soruları ekranda işaretlersin, her sorunun süresi ölçülür ve sonunda bir analiz raporu çıkar. Kamera ya da fotoğraf gerekmez.</p>',
  },
  {
    q: 'Sıralama ve puan hesapları ne kadar doğru?',
    a: '<p>Hesaplar uygulamaya gömülü, YÖK Atlas kaynaklı veri setine dayanır ve her yılın kendine özgü ders ve branş çarpanlarıyla yapılır; sonuçlar %99 oranında tutarlıdır. Yine de bunlar senin netlerine göre yapılan hesaplardır, resmî ÖSYM sonuçlarının yerine geçmez.</p>',
  },
  {
    q: 'Nasıl giriş yapılıyor?',
    a: '<p>Google hesabınla giriş yaparsın; iPhone ve iPad’de Apple ile Giriş de var. Ayrı bir şifre oluşturman gerekmez.</p>',
  },
  {
    q: 'Tablette kullanabilir miyim?',
    a: '<p>Evet. Takip+ YKS telefonun yanında tablette de çalışır; ekran büyüdükçe düzen genişler, grafikler ve listeler yan yana sığar.</p>',
  },
  {
    q: 'Profilimi ve çalışma süremi kimler görebilir?',
    a: '<p>Sosyal özelliklerde profilin, haftalık çalışma süren ve anlık durumun diğer kullanıcılara görünebilir. Bunların neyinin kime görüneceğini Gizlilik Ayarları’ndan seçer, istemediğin kişileri engelleyebilirsin. Ayrıntılar <a href="/gizlilik">Gizlilik Politikası</a>’nda.</p>',
  },
  {
    q: 'Widget iPhone’da da var mı?',
    a: '<p>TYT, AYT ve YDT’ye kalan günleri gösteren ana ekran widget’ı şu an yalnızca Android’de var.</p>',
  },
  {
    q: '18 yaşından küçüğüm. Kullanabilir miyim?',
    a: '<p>Evet. Kullanıcılarımızın çoğu lise öğrencisi. 18 yaşından küçüksen uygulamayı velinin bilgisi dahilinde kullanmanı istiyoruz. Veliler de bize yazarak hesapla ilgili bilgi ya da silme talebinde bulunabilir.</p>',
  },
  {
    q: 'Hesabımı nasıl silerim?',
    a: `<p>Uygulamada Profil ekranındaki “Hesabımı Sil” ile hesabını ve verilerini kalıcı olarak silebilirsin. Silinen verilerin listesi <a href="/hesap-silme">Hesap silme</a> sayfasında; talebini <a href="mailto:${contactEmail}">${contactEmail}</a> adresine de iletebilirsin.</p>`,
  },
  {
    q: 'Takip+ YKS resmî bir ÖSYM uygulaması mı?',
    a: '<p>Hayır. Takip+ YKS, ÖSYM ya da YÖK ile bağlantılı resmî bir uygulama değildir. Sıralama hesaplarında YÖK Atlas kaynaklı veriler kullanılır.</p>',
  },
];
