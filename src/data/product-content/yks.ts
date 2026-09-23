/**
 * Takip+ YKS sayfa içeriği. Her metin uygulamanın kaynak kodundaki
 * gerçek davranışla uyumlu olmalı (bkz. README → "Ürün gerçekleri").
 */
import { contactEmail } from '../../config/site';

export const seo = {
  title: 'Takip+ YKS: YKS takip uygulaması',
  description:
    'Konu takibi, deneme ve net analizi, Optik Çözüm, hedef üniversite ve çalışma planı tek uygulamada. Takip+ YKS için erken erişim listesine katıl.',
};

export const hero = {
  label: 'Takip+ YKS',
  title: 'YKS hazırlığını tek uygulamadan takip et.',
  lead: 'Konu takibi, deneme netleri, hedef üniversite ve çalışma planın aynı yerde. Koçun sensin; Takip+ ilerlemeni her gün görünür kılar.',
  note: 'Android ve iOS için geliştiriliyor. Giriş Google hesabınla yapılır.',
};

export const today = {
  label: 'Bugün',
  title: 'Bütün günün, tek ekranda.',
  text: 'Uygulamayı açtığında ilk gördüğün yer Günün Odağı. Bugün ne çalışacağını düşünmek yerine başlarsın.',
  points: [
    { t: 'Rutinlerin', d: 'Her gün tekrar eden çalışmaların hazır bekler.' },
    { t: 'Tekrar zamanı gelen sorular', d: 'Yapamadıklarım’dan bugün tekrar etmen gerekenler.' },
    { t: 'Çalıştığın konular', d: 'Üzerinde olduğun konular, bir dokunuş uzağında.' },
    { t: 'Plan görevlerin', d: 'Elle eklediğin görevler de aynı listede.' },
  ],
  footnote: 'Saat, soru, video ve konu hedeflerindeki ilerlemen ekranın üstünde canlı olarak görünür.',
};

/** Uygulamanın gerçek sekme sırası. */
export const tabs = [
  { name: 'Bugün', text: 'Rutinler, tekrar edilecek sorular, konular ve plan görevleri tek ekranda.', color: 'var(--violet-500)' },
  { name: 'Konular', text: 'TYT ve AYT konularını çalışılıyor, bitti ya da tekrar olarak işaretle; konu takviminde gör.', color: 'var(--red-500)' },
  { name: 'Çalışma', text: 'Pomodoro, kronometre ve geri sayım. Rutinler, doğru/yanlış girişi, haftalık ders programı ve Optik Çözüm.', color: 'var(--amber-500)' },
  { name: 'Denemeler', text: 'Net girişi, deneme geçmişi, analiz panosu ve grafikler. Yanlışların için Yapamadıklarım.', color: 'var(--teal-400)' },
  { name: 'Hedef&Net', text: 'Üniversite ve bölüm hedefini seç; netten puana, puandan sıralamaya hesapla.', color: 'var(--emerald-500)' },
  { name: 'Planlar', text: 'Günlük takvim ve plan takvimiyle görevlerini haftalara yay.', color: 'var(--violet-400)' },
];

export type MockKey = 'optik' | 'netchart' | 'repeat' | 'wizard' | 'timer';

export const deepDives: {
  id: string;
  tab: string;
  title: string;
  text: string;
  points: string[];
  mock: MockKey;
  note?: string;
}[] = [
  {
    id: 'optik-cozum',
    tab: 'Çalışma',
    title: 'Telefonun optik forma dönüşsün.',
    text: 'Optik Çözüm’de soruları dijital bir optik form üzerinde işaretlersin. Her sorunun süresi ayrı ayrı ölçülür, bitirdiğinde analiz raporun hazırdır.',
    points: ['Soru başına süre', 'Boş ve işaretli soruların dağılımı', 'Bitince analiz raporu ve puan hesabı'],
    mock: 'optik',
  },
  {
    id: 'deneme-analizi',
    tab: 'Denemeler',
    title: 'Netlerinin nereye gittiğini gör.',
    text: 'Her denemeden sonra netlerini gir. Analiz panosu ders ders ilerlemeni grafiklerle gösterir; deneme ve soru takvimi ne zaman ne çözdüğünü tutar.',
    points: ['Net girişi ve deneme geçmişi', 'Analiz panosu ve grafikler', 'Deneme takvimi ve soru takvimi'],
    mock: 'netchart',
  },
  {
    id: 'yapamadiklarim',
    tab: 'Denemeler',
    title: 'Yapamadığın soru, bir daha kaçmaz.',
    text: 'Yanlış yaptığın ya da boş bıraktığın sorunun fotoğrafını ekle. Yapamadıklarım onu aralıklı tekrar takvimine koyar; zamanı gelince Bugün ekranında karşına çıkar.',
    points: ['Soru fotoğrafı ve kısa not', 'Aralıklı tekrar takvimi', 'Tekrar zamanı gelenler Bugün’de'],
    mock: 'repeat',
  },
  {
    id: 'hedef-net',
    tab: 'Hedef&Net',
    title: 'Hedefinle arandaki mesafe, net olarak.',
    text: 'Üniversite ve bölüm ara, hedefini seç. Net Sihirbazı netlerinden puanını ve tahmini sıralamanı hesaplar, hedefe ne kadar net kaldığını gösterir.',
    points: ['Üniversite ve bölüm arama', 'Net → puan → sıralama hesabı', 'Net Sihirbazı ile hedefe kalan net'],
    mock: 'wizard',
    note: 'Sıralama ve taban verileri, uygulamaya gömülü YÖK Atlas kaynaklı veri setinden gelir. Sonuçlar tahmindir; resmî ÖSYM sonuçlarının yerine geçmez. Görseldeki değerler örnektir.',
  },
  {
    id: 'calisma-sayaci',
    tab: 'Çalışma',
    title: 'Sayacı başlat, gerisini Takip+ tutsun.',
    text: 'Pomodoro, kronometre ya da geri sayımla çalış. Rutinlerini kur, çözdüğün soruların doğru ve yanlışını gir, haftalık ders programını tek yerden yönet.',
    points: ['Pomodoro, kronometre, geri sayım', 'Rutinler ve doğru/yanlış girişi', 'Haftalık ders programı'],
    mock: 'timer',
  },
];

export const social = {
  label: 'Sosyal',
  title: 'Yalnız çalışma.',
  text: 'Sosyal, ana ekrandan açılan ayrı bir merkez. Arkadaşlarınla yarışabilir, bir klana katılabilir, çözemediğin soruyu paylaşıp yardım alabilirsin.',
  items: [
    { t: 'Düellolar', d: 'Pomodoro ve Optik düellosu. Arkadaşınla ya da herkese açık topluluk düellolarında.' },
    { t: 'Klanlar', d: 'Birlikte hedefe koşan küçük gruplar ve klan sohbeti.' },
    { t: 'Sıralamalar', d: 'Haftalık çalışma süresine göre genel, alan ve bölüm sıralaması.' },
    { t: 'Soru Paylaşımı', d: 'Çözemediğin soruyu paylaş, topluluktan yardım al.' },
    { t: 'Arkadaşlar ve sohbet', d: 'Birebir mesajlaşma ve Global Sohbet.' },
    { t: 'Hikâyeler ve durum', d: '24 saatlik hikâyeler; arkadaşların ne çalıştığını anlık durumdan görür.' },
  ],
  privacy: 'Neyin kime görüneceğini Gizlilik Ayarları’ndan sen seçersin; istemediğin kişiyi engelleyebilirsin.',
};

export const extras = [
  {
    t: '55 başarım',
    d: 'Çalıştıkça açılan başarımlar. Küçük adımları da görünür kılar.',
  },
  {
    t: 'Ana ekran widget’ı',
    d: 'TYT, AYT ve YDT’ye kalan günü uygulamayı açmadan gör. Şu an yalnızca Android’de.',
    note: 'Örnek görünüm. Gün sayısı, uygulamanın kullandığı tahmini sınav tarihlerine göre hesaplanır.',
    widget: true,
  },
  {
    t: '173 adımlık rehber',
    d: 'Uygulama içindeki “Nasıl Kullanılır” eğitimi her özelliği adım adım anlatır.',
  },
];

/**
 * Ücretsiz ve Premium karşılaştırması — uygulamadaki Premium ekranının
 * tablosuyla aynı satırlar. (Uygulamadaki "Kulüpler" ve "Optik Tarama"
 * ifadeleri burada doğru adlarıyla, "Klanlar" ve "Optik Çözüm" olarak yazıldı.)
 */
export const plans = [
  { label: 'Sosyal', detail: 'Arkadaşlar, Klanlar, Düellolar', free: true },
  { label: 'Hedef Belirleme', detail: 'Üniversite/bölüm arama, sıralama hesaplama', free: true },
  { label: 'Konu Takibi', detail: 'TYT/AYT konuları, konu takvimi', free: false },
  { label: 'Deneme Takibi', detail: 'Net girişi, takvim, sıralama grafiği', free: false },
  { label: 'Optik Çözüm', detail: 'Dijital optik form ve puan hesaplama', free: false },
  { label: 'Çalışma Planlama', detail: 'Pomodoro, rutinler, ders programı', free: false },
  { label: 'Yapamadıklarım', detail: 'Aralıklı tekrar takvimi', free: false },
];

export const faq = [
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
    a: '<p>Hesaplar uygulamaya gömülü, YÖK Atlas kaynaklı bir veri setine dayanır ve geçmiş yılların verileriyle yapılan tahminlerdir. Yönünü görmen için iyi bir pusuladır ama resmî ÖSYM sonuçlarının yerine geçmez.</p>',
  },
  {
    q: 'Nasıl giriş yapılıyor?',
    a: '<p>Şimdilik yalnızca Google hesabınla giriş yapabilirsin. Ayrı bir şifre oluşturman gerekmez.</p>',
  },
  {
    q: 'Profilimi ve çalışma süremi kimler görebilir?',
    a: '<p>Sosyal özelliklerde profilin, haftalık çalışma süren ve anlık durumun diğer kullanıcılara görünebilir. Bunların neyinin kime görüneceğini Gizlilik Ayarları’ndan seçer, istemediğin kişileri engelleyebilirsin. Ayrıntılar <a href="/gizlilik">Gizlilik Politikası</a>’nda.</p>',
  },
  {
    q: 'Widget iPhone’da da var mı?',
    a: '<p>TYT, AYT ve YDT sayacı gösteren ana ekran widget’ı şu an yalnızca Android’de var.</p>',
  },
  {
    q: '18 yaşından küçüğüm. Kullanabilir miyim?',
    a: '<p>Evet. Kullanıcılarımızın çoğu lise öğrencisi. 18 yaşından küçüksen uygulamayı velinin bilgisi dahilinde kullanmanı istiyoruz. Veliler de bize yazarak hesapla ilgili bilgi ya da silme talebinde bulunabilir.</p>',
  },
  {
    q: 'Hesabımı nasıl silerim?',
    a: `<p>Adımlar ve silinen verilerin listesi <a href="/hesap-silme">Hesap silme</a> sayfasında. Talebini <a href="mailto:${contactEmail}">${contactEmail}</a> adresine de iletebilirsin.</p>`,
  },
];
