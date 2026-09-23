// Satori için font dosyaları (WOFF). Latin + Latin-Ext: ç ö ü + ğ ş ı İ
import { readFileSync } from 'node:fs';

const f = (pkg, file) => readFileSync(new URL(`../../node_modules/@fontsource/${pkg}/files/${file}`, import.meta.url));

export function satoriFonts() {
  const out = [];
  for (const weight of [600, 700, 800]) {
    for (const sub of ['latin', 'latin-ext']) {
      out.push({ name: sub === 'latin' ? 'Outfit' : 'Outfit Ext', weight, style: 'normal', data: f('outfit', `outfit-${sub}-${weight}-normal.woff`) });
    }
  }
  for (const weight of [400, 500, 600]) {
    for (const sub of ['latin', 'latin-ext']) {
      out.push({ name: sub === 'latin' ? 'Inter' : 'Inter Ext', weight, style: 'normal', data: f('inter', `inter-${sub}-${weight}-normal.woff`) });
    }
  }
  return out;
}
