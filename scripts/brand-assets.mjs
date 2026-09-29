// Favicon seti, PWA ikonları ve basın kiti dosyaları.
// Kaynak: assets/brand/kit/ — Takip+ marka kiti v1.0 (Eylül 2026) dosyaları, olduğu gibi.
// Logolar yeniden çizilmez ya da renklendirilmez; bu betik yalnızca kopyalar, gerekirse
// rasterleştirir ve tek tıkla indirilebilen basın kiti zip'ini paketler.
// Çıktı: public/favicon.ico, public/favicon.svg, public/apple-touch-icon.png, public/icons/, public/brand/
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { zipSync } from 'fflate';

const root = fileURLToPath(new URL('../', import.meta.url));
const kit = join(root, 'assets/brand/kit');
const pub = (p) => join(root, 'public', p);

// Web ikonları (kitin 03_Web klasörü, Takip+ YKS = ana marka rengi)
const web = join(kit, 'yks/web');
rmSync(pub('icons'), { recursive: true, force: true });
mkdirSync(pub('icons'), { recursive: true });
cpSync(join(web, 'favicon.ico'), pub('favicon.ico'));
cpSync(join(web, 'favicon.svg'), pub('favicon.svg'));
cpSync(join(web, 'apple-touch-icon.png'), pub('apple-touch-icon.png'));
for (const f of ['favicon-16x16.png', 'favicon-32x32.png', 'favicon-48x48.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'mask-icon.svg']) {
  cpSync(join(web, f), pub(`icons/${f}`));
}
// Arama sonuçları için yüksek çözünürlüklü favicon: sekmedeki favicon.svg'nin kendisi, 192 px
// (Google 48'in katı ister; yalnızca 48 px .ico bulunca büyütüp bulanık gösteriyor)
writeFileSync(
  pub('icons/favicon-192x192.png'),
  new Resvg(readFileSync(join(web, 'favicon.svg')), { fitTo: { mode: 'width', value: 192 } }).render().asPng(),
);

// Basın kiti: indirme dosyaları public/brand/kit/ altında kitteki klasör yapısıyla
rmSync(pub('brand'), { recursive: true, force: true });
mkdirSync(pub('brand'), { recursive: true });
const files = walk(kit).filter((f) => !f.startsWith('yks/web/'));
for (const f of files) {
  mkdirSync(join(pub('brand/kit'), f, '..'), { recursive: true });
  cpSync(join(kit, f), join(pub('brand/kit'), f));
}

// Kare raster logo (JSON-LD Organization.logo): düz uygulama karosu, 512 px
const tile = readFileSync(join(kit, 'yks/svg/uygulama-karosu-duz.svg'));
writeFileSync(pub('brand/takipplus-logo-512.png'), new Resvg(tile, { fitTo: { mode: 'width', value: 512 } }).render().asPng());

// Tek tıkla "Tüm kiti indir" (.zip)
const readme = `TAKİP+ MARKA KİTİ · v1.0 · Eylül 2026
https://takipplus.com.tr/marka

ana/     Takip+ yatay logo ve yazı logo (ürün adı olmadan), koyu ve açık zemin
yks/     Takip+ YKS (mor): sembol ve yatay logo SVG, ışıltılı sembol ve uygulama ikonu PNG
lgs/     Takip+ LGS (mavi) · yakında
kpss/    Takip+ KPSS (turuncu) · yakında
renkler.css · renkler.json   Renk değerleri

Kurallar
- Işıltılı logo yalnızca koyu zeminde ve 64 px ve üzerinde. Küçük boyutta ve açık zeminde düz SVG sürümleri.
- Düz sürümlere sonradan gölge, parlama ya da kontur ekleme; oranları ve renkleri değiştirme.
- Artı (+) her zaman beyazdır (açık zeminde lacivert #0F172A).
- Yazım: "Takip+ YKS". "Takip Plus", "TakipPlus" ya da "Takip +" değil.
`;
const entries = { 'Takip+_Marka_Kiti/OKU_BENI.txt': [new TextEncoder().encode(readme), { level: 9 }] };
for (const f of files) {
  // PNG zaten sıkıştırılmış: yeniden sıkıştırmak yalnızca süre harcar
  entries[`Takip+_Marka_Kiti/${f}`] = [readFileSync(join(kit, f)), { level: f.endsWith('.png') ? 0 : 9 }];
}
const zip = zipSync(entries, { mtime: new Date('2026-09-28T12:00:00Z') });
writeFileSync(pub('brand/takipplus-marka-kiti.zip'), zip);

console.log(`brand-assets: tamam (${files.length} dosya, zip ${(zip.length / 1024 / 1024).toFixed(1)} MB)`);

function walk(dir, base = dir) {
  return readdirSync(dir)
    .flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walk(p, base) : [relative(base, p).replaceAll('\\', '/')];
    })
    .sort();
}
