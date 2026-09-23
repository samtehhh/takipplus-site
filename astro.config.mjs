import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sitemap'e girmeyecek yollar (onay sayfaları, 404 vb.)
const noIndex = ['/404', '/erken-erisim/onaylandi', '/erken-erisim/tesekkurler'];

export default defineConfig({
  site: 'https://takipplus.com.tr',
  trailingSlash: 'never',
  output: 'static',
  build: {
    format: 'file', // /gizlilik → gizlilik.html; Vercel cleanUrls ile uzantısız sunulur
    assets: '_assets',
    inlineStylesheets: 'always',
  },
  prefetch: false,
  compressHTML: false,
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !noIndex.some((p) => page.replace(/\/$/, '').endsWith(p)),
      i18n: undefined,
    }),
  ],
  image: {
    responsiveStyles: false,
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
