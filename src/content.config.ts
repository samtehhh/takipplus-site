import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * /rehber — ileride açılacak yazı bölümü. Yazılar src/content/rehber/*.md
 * altına eklenir; alt çizgiyle başlayan dosyalar (örn. _sablon.md) yok sayılır.
 * Hiç yazı yoksa /rehber sayfaları üretilmez.
 */
const rehber = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/rehber' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(155),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    product: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { rehber };
