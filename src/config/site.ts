/**
 * Takip+ — sitenin tek yapılandırma dosyası.
 *
 * Yayın günü, fiyatlar, e-posta adresleri, mağaza linkleri ve paket adları
 * yalnızca buradan değiştirilir. Sayfalar bu değerleri okur; hiçbir sayfada
 * bu bilgilerin kopyası tutulmaz.
 */

export const site = {
  name: 'Takip+',
  url: 'https://takipplus.com.tr',
  locale: 'tr_TR',
  lang: 'tr',
  founder: 'Samet Öndeş',
  foundingYear: 2026,
  themeColor: '#0F172A',

  contact: {
    /** Şu an kullanılan adres. */
    email: 'contact.takipplus@gmail.com',
    /**
     * Alan adına ait adres hazır olduğunda buraya yazıp `useDomainEmail`
     * değerini true yap; sitenin tamamı yeni adrese geçer.
     */
    domainEmail: 'iletisim@takipplus.com.tr',
    useDomainEmail: false,
    /** KVKK veri sorumlusu posta adresi. Yer tutucu: site sahibi dolduracak. */
    postalAddress: '[Veri sorumlusu posta adresi — site sahibi tarafından eklenecek]',
  },

  /** Sosyal medya hesapları. Boş olanlar sitede gösterilmez. */
  social: {
    instagram: '',
    x: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
  },

  /**
   * Analiz aracı. Çerez kullanmayan araçlardan biri seçilmeli, aksi hâlde
   * izin banner'ı zorunlu olur. 'vercel' | 'umami' | 'plausible' | 'none'
   */
  analytics: {
    provider: 'vercel' as 'vercel' | 'umami' | 'plausible' | 'none',
    umamiWebsiteId: '',
    umamiSrc: '',
    plausibleDomain: 'takipplus.com.tr',
  },

  /**
   * Sosyal kanıt alanı. Gerçek ve doğrulanabilir veri gelene kadar kapalı.
   * Uydurma yorum, kullanıcı sayısı ya da istatistik eklenmez.
   */
  socialProof: {
    visible: false,
    items: [] as { quote: string; author: string; context: string }[],
  },
};

/** Sitede gösterilecek iletişim adresi. */
export const contactEmail = site.contact.useDomainEmail
  ? site.contact.domainEmail
  : site.contact.email;

/**
 * Premium fiyatları — uygulamadaki `PremiumPricing` sınıfıyla birebir.
 * Uygulama içi satın alma entegre edilene kadar `pricingVisible: false`.
 */
export const pricing = {
  pricingVisible: false,
  currency: 'TRY',
  weekly: 49.99,
  monthly: 149.99,
  monthlyTrialDays: 3,
  untilExamMultiplier: 0.55456570155902,
  /** Fiyat hesabında kullanılan sınav tarihi (ay hassasiyetinde). */
  examDate: '2027-06-30',
  renewalNote:
    'Seçtiğin plan, dönemi sonunda otomatik olarak yenilenir. İstediğin zaman Google Play veya App Store hesap ayarlarından iptal edebilirsin.',
};
