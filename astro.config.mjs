import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, existsSync } from 'node:fs';
import { site } from './src/config/site.js';
import styleAttrs from './scripts/lib/style-attrs.mjs';

// Sitemap'e girmeyecek yollar (onay sayfaları, 404 vb.)
const noIndex = ['/404', '/erken-erisim/onaylandi', '/erken-erisim/tesekkurler'];

// scripts/lastmod.mjs (prebuild) her sayfanın kaynağının son commit tarihini yazar.
const lastmodFile = new URL('./src/data/generated/lastmod.json', import.meta.url);
const lastmod = existsSync(lastmodFile) ? JSON.parse(readFileSync(lastmodFile, 'utf8')) : {};

export default defineConfig({
  site: site.url,
  trailingSlash: 'never',
  output: 'static',
  build: {
    format: 'file', // /gizlilik → gizlilik.html; vercel.json yeniden yazmalarıyla uzantısız sunulur
    assets: '_assets',
    // CSS harici dosyada: CSP'de style-src 'unsafe-inline' gerekmesin diye
    inlineStylesheets: 'never',
  },
  prefetch: false,
  compressHTML: false,
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !noIndex.some((p) => page.replace(/\/$/, '').endsWith(p)),
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        if (lastmod[path]) item.lastmod = lastmod[path];
        return item;
      },
    }),
    styleAttrs(),
  ],
  image: {
    responsiveStyles: false,
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // Birden çok sayfada kullanılan küçük bileşenlerin stilleri tek ortak dosyada: sayfa
          // başına daha az CSS isteği (ilk boyama bu dosyaları bekler; ayrı ayrı bölününce /yks
          // altı stil dosyası indiriyordu). Tek sayfaya özgü bileşenler o sayfanın dosyasında kalır.
          manualChunks(id) {
            if (/\/src\/components\/(app\/)?(Header|Footer|Logo|Button|AppIcon|Device|DeviceDuo|Trajectory|Faq|WaitlistForm|StoreButtons|Analytics)\.astro/.test(id)) return 'ui';
          },
        },
      },
    },
  },
});
