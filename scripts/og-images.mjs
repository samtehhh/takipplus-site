// 1200×630 markalı Open Graph görselleri. Tek şablon, sayfa başına metin.
// Çıktı: public/og/<slug>.png
import { mkdirSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { markSvg } from '../src/lib/mark.ts';
import { satoriFonts } from './lib/fonts.mjs';

const outDir = new URL('../public/og/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const pages = {
  default: { kicker: 'Takip+', title: 'Kendi ilerlemeni sen yönet.', sub: 'Sınava hazırlanan öğrenciler için sade ve güçlü çalışma araçları.' },
  home: { kicker: 'Takip+', title: 'Kendi ilerlemeni sen yönet.', sub: 'Sınava hazırlanan öğrenciler için sade ve güçlü çalışma araçları.' },
  yks: { kicker: 'Takip+ YKS', title: 'YKS hazırlığın tek ekranda.', sub: 'Konu, deneme, net ve hedef takibi. Erken erişim listesi açık.', metrics: true },
  hakkimizda: { kicker: 'Hakkımızda', title: 'Öğrencinin kendi koçu olabileceğine inanıyoruz.', sub: 'Takip+ nasıl başladı, neyi neden yapıyoruz.' },
  marka: { kicker: 'Marka kiti', title: 'Logolar, renkler ve yazı tipleri.', sub: 'Takip+ markasını doğru kullanmak için her şey burada.' },
  iletisim: { kicker: 'İletişim', title: 'Sorun, fikrin ya da önerin mi var?', sub: 'Takip+ ekibine ulaşmanın yolları.' },
  'hesap-silme': { kicker: 'Hesap silme', title: 'Hesabını ve verilerini silme.', sub: 'Adımlar, silinen veriler ve saklama süreleri.' },
  gizlilik: { kicker: 'Gizlilik Politikası', title: 'Verilerini nasıl işliyoruz?', sub: 'Takip+ uygulamasında hangi veriler, neden ve ne kadar süre işlenir.' },
  'kullanim-sartlari': { kicker: 'Kullanım Şartları', title: 'Takip+ kullanım şartları.', sub: 'Hesap, topluluk kuralları, Premium ve sorumluluklar.' },
  'kvkk-aydinlatma': { kicker: 'KVKK Aydınlatma Metni', title: 'Kişisel verilerin ve hakların.', sub: '6698 sayılı Kanun kapsamında aydınlatma metni.' },
};

const markData = `data:image/png;base64,${new Resvg(markSvg({ id: 'og' }), { fitTo: { mode: 'width', value: 192 } }).render().asPng().toString('base64')}`;

const h = (type, style, children) => ({ type, props: { style, children } });

const METRICS = [
  ['#8B5CF6', 'SAAT', '4.5/6'],
  ['#2DD4BF', 'SORU', '80/100'],
  ['#F59E0B', 'VİDEO', '6/10'],
  ['#EF4444', 'KONU', '3/5'],
];

function heat() {
  // 30 günlük aktivite haritası motifi (dekoratif, sabit desen)
  const levels = [0, 1, 2, 1, 3, 2, 0, 2, 3, 3, 1, 2, 3, 2, 1, 0, 2, 3, 3, 2, 1, 3, 2, 3, 3, 2, 3, 3, 2, 3];
  const color = ['rgba(148,163,184,0.10)', 'rgba(16,185,129,0.30)', 'rgba(16,185,129,0.55)', 'rgba(52,211,153,0.95)'];
  return h(
    'div',
    { display: 'flex', flexWrap: 'wrap', width: 10 * 34, gap: 8 },
    levels.map((l) => h('div', { width: 26, height: 26, borderRadius: 7, background: color[l] })),
  );
}

function metrics() {
  return h(
    'div',
    { display: 'flex', gap: 14 },
    METRICS.map(([c, label, val]) =>
      h('div', { display: 'flex', flexDirection: 'column', width: 150, padding: '20px 18px', borderRadius: 22, border: `2px solid ${c}66`, background: `${c}1f` }, [
        h('div', { fontFamily: 'Outfit, Outfit Ext', fontSize: 34, fontWeight: 700, color: '#F8FAFC' }, val),
        h('div', { fontFamily: 'Inter, Inter Ext', fontSize: 16, fontWeight: 600, color: c, letterSpacing: 1.5, marginTop: 4 }, label),
      ]),
    ),
  );
}

async function render(slug, p) {
  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      background: '#0F172A',
      backgroundImage:
        'radial-gradient(circle at 12% -10%, rgba(139,92,246,0.42), rgba(139,92,246,0) 55%), radial-gradient(circle at 105% 20%, rgba(45,212,191,0.20), rgba(45,212,191,0) 45%), radial-gradient(circle at 70% 120%, rgba(245,158,11,0.12), rgba(245,158,11,0) 45%)',
      color: '#F8FAFC',
      fontFamily: 'Inter, Inter Ext',
    },
    [
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
          { type: 'img', props: { src: markData, width: 64, height: 64 } },
          h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 800, fontSize: 38, letterSpacing: -0.5 }, 'Takip+'),
        ]),
        h('div', { fontSize: 22, color: '#94A3B8' }, 'takipplus.com.tr'),
      ]),
      h('div', { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }, [
        h('div', { display: 'flex', flexDirection: 'column', maxWidth: p.metrics ? 560 : 720 }, [
          h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 600, fontSize: 26, color: '#A78BFA', marginBottom: 18 }, p.kicker),
          h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 800, fontSize: p.title.length > 34 ? 60 : 72, lineHeight: 1.04, letterSpacing: -2 }, p.title),
          h('div', { fontSize: 26, lineHeight: 1.4, color: '#94A3B8', marginTop: 22 }, p.sub),
        ]),
        p.metrics ? h('div', { display: 'flex', flexDirection: 'column', gap: 14, width: 314 }, [metrics().props.children.slice(0, 2), metrics().props.children.slice(2)].map((row) => h('div', { display: 'flex', gap: 14 }, row))) : heat(),
      ]),
    ],
  );
  const svg = await satori(tree, { width: 1200, height: 630, fonts: satoriFonts() });
  const pngBuf = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const buf = await sharp(pngBuf).png({ compressionLevel: 9, effort: 10 }).toBuffer();
  writeFileSync(new URL(`${slug}.png`, outDir), buf);
}

for (const [slug, p] of Object.entries(pages)) await render(slug, p);
console.log(`og-images: ${Object.keys(pages).length} görsel`);
