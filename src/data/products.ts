/**
 * Takip+ ürün listesi.
 *
 * Yeni ürün eklemek için: bu listeye bir kayıt ekle ve ürünün içerik dosyasını
 * `src/data/product-content/<slug>.ts` altında oluştur. `/<slug>` sayfası
 * `src/pages/[product].astro` şablonuyla otomatik üretilir.
 *
 * Mağaza, paket adı ve derin link bilgileri de burada tutulur; yayın günü
 * sadece `released` değeri true yapılır.
 */

export type ProductStatus = 'development' | 'early-access' | 'live' | 'planned';

export interface Product {
  /** Tam ad: "Takip+ YKS" */
  name: string;
  /** Kısa ad: "YKS" */
  shortName: string;
  slug: string;
  /** Ürünün vurgu rengi. Tüm ürün sayfası bu renkle tonlanır. */
  accent: string;
  accentDeep: string;
  status: ProductStatus;
  /** Ürün kartında görünen tek cümle. */
  tagline: string;
  audience: string;
  platforms: ('android' | 'ios')[];
  /** Mağaza yayını. false iken butonlar "Erken erişime katıl" olur. */
  released: boolean;
  stores: {
    googlePlayUrl: string;
    appStoreUrl: string;
    /** App Store sayısal kimliği — Smart App Banner için. */
    appStoreId: string;
  };
  ids: {
    iosBundleId: string;
    /** Apple Developer Team ID — apple-app-site-association için. */
    appleTeamId: string;
    /** Kesinleşmediyse boş bırak. Play Store'a `com.example.*` yüklenemez. */
    androidPackage: string;
    /** Play App Signing SHA-256 parmak izleri — assetlinks.json için. */
    androidSha256: string[];
  };
}

export const products: Product[] = [
  {
    name: 'Takip+ YKS',
    shortName: 'YKS',
    slug: 'yks',
    accent: '#8B5CF6',
    accentDeep: '#6D28D9',
    status: 'development',
    tagline: 'YKS hazırlığının tamamı tek uygulamada: konu, deneme, hedef ve plan.',
    audience: 'YKS’ye hazırlanan lise öğrencileri',
    platforms: ['android', 'ios'],
    released: false,
    stores: {
      googlePlayUrl: '',
      appStoreUrl: '',
      appStoreId: '',
    },
    ids: {
      iosBundleId: 'com.samettondes.takipplus',
      appleTeamId: '',
      // Şu anki `com.example.flutter_application_1` Play Store'a yüklenemez.
      androidPackage: '',
      androidSha256: [],
    },
  },
];

export const liveProducts = products.filter((p) => p.status !== 'planned');

export const statusLabel: Record<ProductStatus, string> = {
  development: 'Geliştiriliyor',
  'early-access': 'Erken erişimde',
  live: 'Yayında',
  planned: 'Planlanıyor',
};
