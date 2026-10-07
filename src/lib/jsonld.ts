import { site, contactEmail } from '../config/site';
import type { Product } from '../data/products';

const abs = (path: string) => new URL(path, site.url).href;

const sameAs = Object.values(site.social).filter(Boolean);

// Ana sayfa dışındaki şemalarda yayıncı: ad ve logo sayfanın kendisinde görünsün
const publisher = () => ({ '@type': 'Organization', '@id': abs('/#organization'), name: site.name, url: abs('/'), logo: abs('/brand/takipplus-logo-512.png') });

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': abs('/#organization'),
  name: site.name,
  alternateName: site.alternateNames,
  url: abs('/'),
  logo: abs('/brand/takipplus-logo-512.png'),
  email: contactEmail,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: contactEmail,
    availableLanguage: ['Turkish'],
  },
  founder: { '@type': 'Person', name: site.founder },
  foundingDate: String(site.foundingYear),
  ...(sameAs.length ? { sameAs } : {}),
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: site.name,
  alternateName: site.alternateNames,
  url: abs('/'),
  inLanguage: 'tr-TR',
  publisher: { '@id': abs('/#organization') },
});

export const breadcrumbLd = (crumbs: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Ana sayfa', path: '/' }, ...crumbs].map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: abs(c.path),
  })),
});

/**
 * Yalnızca `released: true` olan ürünlerde kullanılır ([product].astro).
 * Google'ın uygulama zengin sonucu `offers` ve gerçek bir puan
 * (aggregateRating) ister; yayın öncesi ikisi de olmadığından şema hiç
 * eklenmez (Search Console'da "geçersiz öğe" görünmesin diye).
 * aggregateRating asla elle yazılmaz: yalnızca doğrulanabilir mağaza verisiyle.
 */
export const mobileAppLd = (p: Product, description: string) => {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: p.name,
    description,
    url: abs(`/${p.slug}`),
    applicationCategory: 'EducationalApplication',
    operatingSystem: p.platforms.map((x) => (x === 'ios' ? 'iOS' : 'Android')).join(', '),
    inLanguage: 'tr-TR',
    image: abs(`/og/${p.slug}.jpg`),
    publisher: publisher(),
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
  };
  if (p.released) {
    const urls = [p.stores.googlePlayUrl, p.stores.appStoreUrl].filter(Boolean);
    if (urls.length) ld.downloadUrl = urls;
    // Uygulama ücretsiz indirilir; Premium, uygulama içi abonelik.
    ld.offers = { '@type': 'Offer', price: '0', priceCurrency: 'TRY' };
  }
  return ld;
};

/** /rehber yazıları için Article şeması. */
export const articleLd = (a: {
  title: string;
  description: string;
  path: string;
  published: Date;
  updated?: Date;
  image: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  mainEntityOfPage: abs(a.path),
  url: abs(a.path),
  image: abs(a.image),
  inLanguage: 'tr-TR',
  datePublished: a.published.toISOString(),
  dateModified: (a.updated ?? a.published).toISOString(),
  author: { '@type': 'Person', name: site.founder, url: abs('/hakkimizda') },
  publisher: publisher(),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.q,
    acceptedAnswer: { '@type': 'Answer', text: i.a.replace(/<[^>]+>/g, '') },
  })),
});
