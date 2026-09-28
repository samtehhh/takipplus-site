// RFC 9116 security.txt. İletişim adresi src/config/site.js'ten gelir.
// Expires her derlemede yenilenir (derleme + 180 gün); site 6 aydan uzun süre
// yeniden yayınlanmazsa dosya "süresi dolmuş" olur. Aylık bakım listesine bak.
import type { APIRoute } from 'astro';
import { site, contactEmail } from '../../config/site';

export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: mailto:${contactEmail}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: tr, en',
    `Canonical: ${site.url}/.well-known/security.txt`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
