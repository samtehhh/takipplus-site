import type { APIRoute } from 'astro';
import { site } from '../config/site';

// Tüm site taranabilir; /.well-known/ dahil. Yalnızca API uçları kapalı.
// İndekslenmemesi gereken sayfalar (onay sayfaları, 404) robots.txt ile değil,
// noindex ile dışarıda tutulur: engellenen sayfanın noindex'ini Google göremez.
export const GET: APIRoute = () =>
  new Response(['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${site.url}/sitemap-index.xml`, ''].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
