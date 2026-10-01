// Uygulama ekran görüntülerini ve tur videolarının kapak karelerini sitedeki cihaz
// çerçevelerine hazırlar.
//
// Telefon: kurucunun kendi hesabıyla çekilmiş Android ekranları (720×1600, durum çubuğu yok),
// olduğu gibi. Çerçeve sahte durum çubuğu ya da Dynamic Island çizmez; ekran tam görünür.
// Kalite: kaynak JPEG; bir kez daha kayıplı sıkıştırılıp derlemede tekrar sıkıştırılınca
// gradyanlarda bantlanma ve yazıda yumuşama oluyordu. Bu yüzden WebP %95 (pratikte kayıpsız)
// saklanır; tarayıcıya giden AVIF/WebP'yi Astro tek seferde yüksek kalitede üretir.
// Tablet: iPad ekranları (1536×2048, düz arayüz çizimi) kayıpsız WebP.
// Mağaza görselleri (magaza-v3) WebP %92.
// Video kapakları: public/videos/tur-*.mp4 dosyalarının ilk karesi (ffmpeg), kayıpsız WebP.
//
// Gerçek iPad ekranları (TestFlight, 1536×2048): ikinci argüman ya da Downloads/ipad taslaklar.
// Üstteki iPadOS durum satırı ("TestFlight 18:45 1 Eki Per") kırpılır.
//
// Kullanım: node scripts/prepare-screens.mjs "<Claude outputs/takipplus klasörü>" ["<ipad taslaklar>"]
// Çıktı: src/assets/app/*.webp (derlemede Astro AVIF/WebP ve srcset üretir)
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) {
  console.error('Kaynak klasör gerekli: node scripts/prepare-screens.mjs "<…/Claude outputs/takipplus>"');
  process.exit(1);
}
const out = fileURLToPath(new URL('../src/assets/app/', import.meta.url));
const videos = fileURLToPath(new URL('../public/videos/', import.meta.url));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const own = join(src, "KENDI ALDIGIM SS'LER");
const ipad = join(src, 'magaza-v2', 'ham-ekranlar', 'ipad-temiz');
const storePhone = join(src, 'magaza-v3', 'app-store-iphone-6.9');
const storeTablet = join(src, 'magaza-v3', 'app-store-ipad-13');

// Telefon: kaynak dosya (zaman damgası) → çıktı adı
const phones = {
  '190741': 'p-home-sayac',
  '190738': 'p-home-bugun',
  '190732': 'p-home-calisma',
  '190825': 'p-konular',
  '190840': 'p-konu-durum',
  '191444': 'p-tekrar-planla',
  '190904': 'p-konu-takvimi',
  '190911': 'p-pomodoro',
  '190949': 'p-optik',
  '190955': 'p-performans',
  '191004': 'p-net-analizi',
  '191022': 'p-ders-turkce',
  '191050': 'p-deneme-gecmisi',
  '191103': 'p-yap-liste',
  '191107': 'p-yap-analiz',
  '191511': 'p-yap-detay',
  '191121': 'p-hedef-detay',
  '191130': 'p-uni-liste',
  '191135': 'p-net-sihirbazi',
  '191144': 'p-gunluk-takvim',
  '191200': 'p-plan-hedefler',
  '191207': 'p-plan-takvimi',
  '191220': 'p-sosyal',
};

const ipadReal = process.argv[3] ?? join(homedir(), 'Downloads', 'ipad taslaklar');
// Gerçek iPad ekranları: dosya → çıktı adı (başka kullanıcı adı görünenler hariç)
const ipadShots = {
  'WhatsApp Image 2026-10-01 at 18.55.27 (1).jpeg': 't-home-harita',
};
const IPAD_STATUS = 48; // 24 pt × 2

const tablets = {
  'home.png': 't-home-sayac',
  'perf.png': 't-performans',
  'konular-v2.png': 't-konular',
  'plan.png': 't-plan',
  'yap.png': 't-yap',
};

const report = [];
const ownFiles = readdirSync(own);
for (const [stamp, name] of Object.entries(phones)) {
  const f = ownFiles.find((x) => x.includes(stamp));
  if (!f) throw new Error(`Ekran bulunamadı: ${stamp}`);
  const info = await sharp(join(own, f)).webp({ quality: 95, effort: 6 }).toFile(join(out, `${name}.webp`));
  if (info.width !== 720 || info.height !== 1600) throw new Error(`${name}: 720×1600 bekleniyordu (${info.width}×${info.height})`);
  report.push(`${name.padEnd(18)} ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`);
}
for (const [file, name] of Object.entries(tablets)) {
  const info = await sharp(join(ipad, file)).webp({ lossless: true, effort: 6 }).toFile(join(out, `${name}.webp`));
  report.push(`${name.padEnd(18)} ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB`);
}

for (const [file, name] of Object.entries(ipadShots)) {
  const img = sharp(join(ipadReal, file));
  const { width, height } = await img.metadata();
  const info = await img
    .extract({ left: 0, top: IPAD_STATUS, width, height: height - IPAD_STATUS })
    .webp({ quality: 95, effort: 6 })
    .toFile(join(out, `${name}.webp`));
  report.push(`${name.padEnd(18)} ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB (gerçek iPad, durum satırı kırpıldı)`);
}

// Tur videolarının ilk karesi: video yüklenene ve oynayana kadar yerinde duran kapak
for (const f of readdirSync(videos).filter((x) => /^tur-.*\.mp4$/.test(x))) {
  const png = execFileSync('ffmpeg', ['-v', 'error', '-i', join(videos, f), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 1 << 26 });
  const name = `v-${f.replace(/^tur-|\.mp4$/g, '')}`;
  const info = await sharp(png).webp({ quality: 95, effort: 6 }).toFile(join(out, `${name}.webp`));
  report.push(`${name.padEnd(18)} ${info.width}×${info.height} ${Math.round(info.size / 1024)} KB (${f})`);
}

// Mağaza görselleri (iPhone 1290×2796, iPad 2064×2752): olduğu gibi, yükleme sırasıyla
for (const [dir, prefix] of [
  [storePhone, 's-iphone'],
  [storeTablet, 's-ipad'],
]) {
  const files = readdirSync(dir)
    .filter((f) => /^\d\d-.*\.png$/.test(f))
    .sort();
  if (files.length !== 10) throw new Error(`${dir}: 10 görsel bekleniyordu, ${files.length} var`);
  let i = 1;
  for (const f of files) {
    const name = `${prefix}-${String(i++).padStart(2, '0')}`;
    await sharp(join(dir, f)).webp({ quality: 92, effort: 6 }).toFile(join(out, `${name}.webp`));
    report.push(`${name.padEnd(18)} ${f}`);
  }
}

console.log(report.join('\n'));
console.log(`prepare-screens: ${report.length} dosya → src/assets/app/`);
