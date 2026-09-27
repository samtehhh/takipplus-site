// Favicon seti, uygulama ikonları ve basın kiti dosyaları.
// Kaynak: assets/brand/ altındaki orijinal Takip+ logoları (değiştirilmez,
// yalnızca boyutlandırılır ve sıkıştırılır). Wordmark uygulamadaki gibi
// Outfit 800, harf aralığı −0.2 (lib/widgets/takip_plus_wordmark.dart).
// Çıktı: public/favicon.ico, public/apple-touch-icon.png, public/icons/, public/brand/
import { mkdirSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { satoriFonts } from './lib/fonts.mjs';

const root = new URL('../', import.meta.url);
const src = (f) => new URL(`assets/brand/${f}`, root).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const out = (p) => new URL(`public/${p}`, root);
mkdirSync(out('icons'), { recursive: true });
mkdirSync(out('brand'), { recursive: true });

const LOGO = decodeURIComponent(src('takipplus-logo-512.png')); // karo, köşeler şeffaf
const GLOW = decodeURIComponent(src('takipplus-logo-glow-1024.png')); // glow'lu
const ICON = decodeURIComponent(src('takipplus-icon-1024.png')); // tam zeminli uygulama ikonu

const png = (input, size) => sharp(input).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9, effort: 10 }).toBuffer();

async function wordmarkSvg(color) {
  return satori(
    {
      type: 'div',
      props: {
        style: { display: 'flex', fontFamily: 'Outfit, Outfit Ext', fontWeight: 800, fontSize: 200, letterSpacing: -2.5, color, lineHeight: 1 },
        children: 'Takip+',
      },
    },
    { width: 640, height: 220, fonts: satoriFonts() },
  );
}

async function horizontal(textColor, bg) {
  // 1800×480: logo 400 px, yanında wordmark
  const H = 480;
  const logo = await png(LOGO, 400);
  const word = new Resvg(await wordmarkSvg(textColor), { fitTo: { mode: 'width', value: 760 } }).render().asPng();
  const wordTrim = await sharp(word).trim().toBuffer({ resolveWithObject: true });
  const W = 40 + 400 + 56 + wordTrim.info.width + 60;
  return sharp({ create: { width: W, height: H, channels: 4, background: bg } })
    .composite([
      { input: logo, left: 40, top: 40 },
      { input: wordTrim.data, left: 40 + 400 + 56, top: Math.round((H - wordTrim.info.height) / 2) + 6 },
    ])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

async function main() {
  // Favicon (.ico içinde PNG)
  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(icoSizes.map((s) => png(LOGO, s)));
  writeFileSync(out('favicon.ico'), buildIco(icoPngs, icoSizes));
  writeFileSync(out('icons/icon-96.png'), await png(LOGO, 96));

  // Uygulama ikonları
  writeFileSync(out('apple-touch-icon.png'), await png(ICON, 180));
  writeFileSync(out('icons/icon-192.png'), await png(LOGO, 192));
  writeFileSync(out('icons/icon-512.png'), await png(LOGO, 512));
  writeFileSync(out('icons/maskable-512.png'), await png(ICON, 512));

  // Basın kiti
  writeFileSync(out('brand/takipplus-logo-512.png'), await png(LOGO, 512));
  writeFileSync(out('brand/takipplus-logo-glow-1024.png'), await png(GLOW, 1024));
  writeFileSync(out('brand/takipplus-icon-1024.png'), await png(ICON, 1024));
  writeFileSync(out('brand/takipplus-horizontal-on-dark.png'), await horizontal('#F8FAFC', '#0F172A'));
  writeFileSync(out('brand/takipplus-horizontal-on-light.png'), await horizontal('#0F172A', '#F8FAFC'));
  writeFileSync(out('brand/takipplus-horizontal-transparent.png'), await horizontal('#F8FAFC', { r: 0, g: 0, b: 0, alpha: 0 }));
  writeFileSync(out('brand/takipplus-wordmark-on-dark.svg'), await wordmarkSvg('#F8FAFC'));
  writeFileSync(out('brand/takipplus-wordmark-on-light.svg'), await wordmarkSvg('#0F172A'));

  console.log('brand-assets: tamam');
}

function buildIco(pngs, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((buf, i) => {
    const o = i * 16;
    dir.writeUInt8(sizes[i], o);
    dir.writeUInt8(sizes[i], o + 1);
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
