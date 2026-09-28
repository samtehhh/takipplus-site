// Astro entegrasyonu: derlenmiş HTML'deki `style="…"` özniteliklerini sınıflara
// çevirip tek bir harici CSS dosyasına taşır.
//
// Neden: CSP'de `style-src 'unsafe-inline'` olmadan satır içi style
// öznitelikleri tarayıcıda engellenir. Bileşenler (renk, gecikme sırası, yüzde
// gibi) değerleri style özniteliğiyle vermeye devam edebilir; bu adım yalnızca
// derleme çıktısını dönüştürür, geliştirme sunucusunu etkilemez.
//
// Görünüm aynı kalır: üretilen kural `.s-<hash>:not(#_)` seçicisiyle (1,1,0)
// özgüllükte, bileşen kurallarından güçlü; satır içi stil gibi animasyonlar
// yine üstüne yazabilir (!important kullanılmaz).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAG = /<([a-zA-Z][^\s/>]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const hash = (s, n = 8) => createHash('sha256').update(s).digest('hex').slice(0, n);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

export function transformHtml(html, rules) {
  let used = false;
  // <script> ve <style> içeriğine dokunma
  const out = html
    .split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/i)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part.replace(TAG, (tag, name, attrs, selfClose) => {
        if (!/\sstyle\s*=/i.test(attrs)) return tag;
        const list = [...attrs.matchAll(ATTR)].map((m) => ({ name: m[1], value: m[2] ?? m[3] ?? m[4] }));
        const style = list.find((a) => a.name.toLowerCase() === 'style');
        const decls = decode(style.value ?? '').trim().replace(/;\s*$/, '');
        const rest = list.filter((a) => a !== style);
        if (decls) {
          const cls = `s-${hash(decls)}`;
          rules.set(cls, decls);
          const existing = rest.find((a) => a.name.toLowerCase() === 'class');
          if (existing) existing.value = `${existing.value ?? ''} ${cls}`.trim();
          else rest.push({ name: 'class', value: cls });
          used = true;
        }
        const serialized = rest.map((a) => (a.value === undefined ? ` ${a.name}` : ` ${a.name}="${a.value.replace(/"/g, '&quot;')}"`)).join('');
        return `<${name}${serialized}${selfClose ? ' /' : ''}>`;
      });
    })
    .join('');
  return { html: out, used };
}

export default function styleAttrs() {
  return {
    name: 'takipplus:style-attrs',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const rules = new Map();
        const pages = [];
        for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
          const { html, used } = transformHtml(readFileSync(file, 'utf8'), rules);
          pages.push({ file, html, used });
        }
        if (!rules.size) return;
        const css = [...rules].sort(([a], [b]) => a.localeCompare(b)).map(([cls, decls]) => `.${cls}:not(#_){${decls}}`).join('\n') + '\n';
        const href = `/_assets/attrs.${hash(css, 10)}.css`;
        writeFileSync(join(dist, href), css);
        for (const p of pages) {
          const html = p.used ? p.html.replace('</head>', `<link rel="stylesheet" href="${href}"></head>`) : p.html;
          writeFileSync(p.file, html);
        }
        logger.info(`${rules.size} style özniteliği ${href} dosyasına taşındı`);
      },
    },
  };
}
