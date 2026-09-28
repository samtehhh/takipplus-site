/**
 * Takip+ — sitenin tek yapılandırma dosyası.
 *
 * Alan adı, yayın bayrakları, fiyatlar, e-posta, sosyal medya, mağaza linkleri
 * ve paket kimlikleri yalnızca buradan değiştirilir. Sayfalar, astro.config.mjs,
 * derleme betikleri ve testler bu değerleri okur; başka hiçbir yerde kopyası
 * tutulmaz.
 *
 * Düz JavaScript (ESM): Astro, Node betikleri ve Vercel fonksiyonları aynı
 * dosyayı derleme adımı olmadan içe aktarabilsin diye.
 *
 * "YER TUTUCU" yazan değerler henüz bilinmiyor; README → "Senin yapman
 * gerekenler" listesinde nereden alınacakları yazıyor. Boş bırakılan değerler
 * sitede hiçbir yerde kullanılmaz.
 */

export const site = {
  name: 'Takip+',
  /**
   * Aramalarda "+" çoğu zaman yok sayılır; insanlar markayı bu adlarla arar.
   * Organization ve WebSite şemalarında alternateName olarak kullanılır.
   */
  alternateNames: ['Takip Plus', 'TakipPlus'],
  /** Kanonik adres: www'suz, https, sonda / yok. */
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
     * Alan adına ait adres hazır olduğunda `useDomainEmail` değerini true yap;
     * sitenin tamamı (security.txt ve şemalar dahil) yeni adrese geçer.
     */
    domainEmail: 'iletisim@takipplus.com.tr',
    useDomainEmail: false,
    /** KVKK veri sorumlusu posta adresi. YER TUTUCU: site sahibi dolduracak. */
    postalAddress: '[Veri sorumlusu posta adresi — site sahibi tarafından eklenecek]',
  },

  /** Sosyal medya hesapları (tam URL). YER TUTUCU: boş olanlar sitede ve şemada görünmez. */
  social: {
    instagram: '',
    x: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
  },

  /**
   * Analiz aracı. Çerez kullanmayan araçlardan biri seçilmeli, aksi hâlde
   * izin banner'ı zorunlu olur (README → "Ölçüm").
   * @type {{ provider: 'vercel' | 'umami' | 'plausible' | 'none', umamiWebsiteId: string, umamiSrc: string, plausibleDomain: string }}
   */
  analytics: {
    provider: 'vercel',
    umamiWebsiteId: '',
    umamiSrc: '',
    plausibleDomain: 'takipplus.com.tr',
  },

  /**
   * Arama motoru sahiplik doğrulama kodları. Boş olanın etiketi basılmaz.
   * Google, alan adı mülkü olduğu için DNS TXT kaydıyla doğrulanıyor.
   */
  verification: {
    /** Bing Webmaster Tools › HTML Meta Tag › msvalidate.01 değeri. */
    bing: '756D90E943A86E1C0CED69B01F5D53FE',
  },

  /**
   * Sosyal kanıt alanı. Gerçek ve doğrulanabilir veri gelene kadar kapalı.
   * Uydurma yorum, kullanıcı sayısı ya da istatistik eklenmez.
   * @type {{ visible: boolean, items: { quote: string, author: string, context: string }[] }}
   */
  socialProof: {
    visible: false,
    items: [],
  },
};

/**
 * Uygulamaların yayın ve mağaza bilgileri. Anahtar, ürünün adresidir (/yks).
 *
 * `released: true` yapıldığında otomatik olarak: "Erken erişime katıl"
 * butonları resmi mağaza rozetlerine döner, iOS Smart App Banner (appStoreId
 * doluysa) ve /yks sayfasındaki MobileApplication şeması devreye girer.
 */
export const apps = {
  yks: {
    released: false,
    stores: {
      googlePlayUrl: '',
      appStoreUrl: '',
      /** App Store sayısal kimliği (Smart App Banner). YER TUTUCU. */
      appStoreId: '',
    },
    ids: {
      iosBundleId: 'com.samettondes.takipplus',
      /** Apple Developer Team ID (10 karakter). YER TUTUCU: apple-app-site-association için. */
      appleTeamId: '',
      /**
       * Android paket adı. YER TUTUCU: `com.example.flutter_application_1` Play
       * Store'a yüklenemez. Öneri: `tr.com.takipplus.yks`. Kesinleşince yaz.
       */
      androidPackage: '',
      /** Play App Signing SHA-256 parmak izleri. YER TUTUCU: assetlinks.json için. */
      androidSha256: /** @type {string[]} */ ([]),
    },
  },
};

/** Sitede gösterilecek iletişim adresi. */
export const contactEmail = site.contact.useDomainEmail ? site.contact.domainEmail : site.contact.email;

/** Kanonik alan adı, örn. "takipplus.com.tr". */
export const canonicalHost = new URL(site.url).host;

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
