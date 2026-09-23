import { site, contactEmail } from '../config/site';
import type { Product } from '../data/products';

const abs = (path: string) => new URL(path, site.url).href;

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': abs('/#organization'),
  name: 'Takip+',
  url: site.url,
  logo: abs('/brand/takipplus-symbol-512.png'),
  email: contactEmail,
  founder: { '@type': 'Person', name: site.founder },
  foundingDate: String(site.foundingYear),
  sameAs: Object.values(site.social).filter(Boolean),
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: 'Takip+',
  url: site.url,
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
 * Yayın öncesi `offers` alanı eklenmez: fiyatlar kesinleşmedi ve uygulama
 * mağazada değil. Yayından sonra, `pricingVisible` açıldığında eklenebilir.
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
    image: abs(`/og/${p.slug}.png`),
    publisher: { '@id': abs('/#organization') },
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
  };
  if (p.released) {
    const urls = [p.stores.googlePlayUrl, p.stores.appStoreUrl].filter(Boolean);
    if (urls.length) ld.downloadUrl = urls;
  }
  return ld;
};

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((i) => ({
    '@type': 'Question',
    name: i.q,
    acceptedAnswer: { '@type': 'Answer', text: i.a.replace(/<[^>]+>/g, '') },
  })),
});
