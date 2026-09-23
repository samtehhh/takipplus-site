// Logo varyantları, favicon seti ve uygulama ikonları.
// Kaynak: src/lib/mark.ts (vektör) ve assets/logo.png (uygulama ikonu).
// Çıktı: public/favicon.*, public/apple-touch-icon.png, public/icons/, public/brand/
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { MARK, markSvg } from '../src/lib/mark.ts';
import { satoriFonts } from './lib/fonts.mjs';

const root = new URL('../', import.meta.url);
const out = (p) => new URL(`public/${p}`, root);
mkdirSync(out('icons'), { recursive: true });
mkdirSync(out('brand'), { recursive: true });

const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
const squeeze = (buf, palette = false) => sharp(buf).png({ compressionLevel: 9, palette, quality: 92, effort: 10 }).toBuffer();

// Kenardan kenara zemin (iOS/Android köşeleri kendisi yuvarlar)
function fullBleed({ scale = 0.95 } = {}) {
  const c = MARK.colors;
  const inner = markSvg({ id: 'fb', tile: false });
  const body = inner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  // Glif alanı 332×312 (96,100). 512'lik kareye ortala ve ölçekle.
  const s = scale;
  const tx = 256 - (96 + 166) * s;
  const ty = 256 - (100 + 156) * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${c.tile}"/><g transform="translate(${tx} ${ty}) scale(${s})">${body}</g></svg>`;
}

// ---------- Wordmark (satori ile yola dönüştürülmüş metin) ----------
async function wordmarkSvg(color) {
  const svg = await satori(
    { type: 'div', props: { style: { display: 'flex', fontFamily: 'Outfit, Outfit Ext', fontWeight: 800, fontSize: 200, letterSpacing: -2.5, color, lineHeight: 1 }, children: 'Takip+' } },
    { width: 640, height: 220, fonts: satoriFonts() },
  );
  return svg;
}

function extractBody(svg) {
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

async function horizontal(textColor, id) {
  const word = extractBody(await wordmarkSvg(textColor));
  const mark = extractBody(markSvg({ id }));
  // 512'lik sembol → 220 yükseklik; wordmark sağda
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" role="img" aria-label="Takip+"><g transform="translate(0 0) scale(0.46875)">${mark}</g><g transform="translate(262 18)">${word}</g></svg>`;
}

async function main() {
  // Favicon
  writeFileSync(out('favicon.svg'), markSvg({ id: 'fav' }));
  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(icoSizes.map(async (s) => squeeze(png(markSvg({ id: 'ico' }), s))));
  writeFileSync(out('favicon.ico'), buildIco(icoPngs, icoSizes));

  // Uygulama ikonları
  writeFileSync(out('apple-touch-icon.png'), await squeeze(png(fullBleed(), 180)));
  writeFileSync(out('icons/icon-192.png'), await squeeze(png(markSvg({ id: 'm192' }), 192)));
  writeFileSync(out('icons/icon-512.png'), await squeeze(png(markSvg({ id: 'm512' }), 512)));
  writeFileSync(out('icons/maskable-512.png'), await squeeze(png(fullBleed({ scale: 0.82 }), 512)));

  // Basın kiti: SVG
  const files = {
    'takipplus-symbol.svg': markSvg({ id: 's' }),
    'takipplus-mark-on-dark.svg': markSvg({ id: 'md', tile: false }),
    'takipplus-mark-on-light.svg': markSvg({ id: 'ml', tile: false, plusColor: '#0F172A' }),
    'takipplus-wordmark-on-dark.svg': await wordmarkSvg('#F8FAFC'),
    'takipplus-wordmark-on-light.svg': await wordmarkSvg('#0F172A'),
    'takipplus-horizontal-on-dark.svg': await horizontal('#F8FAFC', 'hd'),
    'takipplus-horizontal-on-light.svg': await horizontal('#0F172A', 'hl'),
  };
  for (const [name, svg] of Object.entries(files)) writeFileSync(out(`brand/${name}`), svg);

  // Basın kiti: PNG
  writeFileSync(out('brand/takipplus-symbol-512.png'), await squeeze(png(files['takipplus-symbol.svg'], 512)));
  writeFileSync(out('brand/takipplus-symbol-1024.png'), await squeeze(png(files['takipplus-symbol.svg'], 1024)));
  writeFileSync(out('brand/takipplus-horizontal-on-dark.png'), await squeeze(png(files['takipplus-horizontal-on-dark.svg'], 1800)));
  writeFileSync(out('brand/takipplus-horizontal-on-light.png'), await squeeze(png(files['takipplus-horizontal-on-light.svg'], 1800)));

  // Orijinal uygulama ikonu (raster), optimize
  const appIcon = readFileSync(new URL('assets/logo.png', root));
  writeFileSync(out('brand/takipplus-app-icon.png'), await sharp(appIcon).resize(512).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer());

  console.log('brand-assets: tamam');
}

// ICO kabı: PNG gömülü girdiler
function buildIco(pngs, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((buf, i) => {
    const o = i * 16;
    dir.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], o);
    dir.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...pngs]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
