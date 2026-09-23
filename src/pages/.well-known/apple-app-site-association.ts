// iOS Universal Links. Team ID ve bundle ID src/data/products.ts içinden gelir.
// vercel.json bu dosyayı application/json olarak sunar.
import type { APIRoute } from 'astro';
import { products } from '../../data/products';

export const GET: APIRoute = () => {
  const details = products
    .filter((p) => p.ids.appleTeamId && p.ids.iosBundleId)
    .map((p) => ({ appIDs: [`${p.ids.appleTeamId}.${p.ids.iosBundleId}`], components: [{ '/': `/${p.slug}/*` }] }));
  return new Response(JSON.stringify({ applinks: { details } }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
