// Android App Links. Paket adı ve SHA-256 parmak izi src/data/products.ts içinden gelir.
import type { APIRoute } from 'astro';
import { products } from '../../data/products';

export const GET: APIRoute = () => {
  const statements = products
    .filter((p) => p.ids.androidPackage && p.ids.androidSha256.length)
    .map((p) => ({
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: p.ids.androidPackage, sha256_cert_fingerprints: p.ids.androidSha256 },
    }));
  return new Response(JSON.stringify(statements, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
