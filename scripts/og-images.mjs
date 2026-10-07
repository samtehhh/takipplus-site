// 1200×630 markalı Open Graph görselleri (WhatsApp, Instagram, X, iMessage bağlantı önizlemesi).
// Tek şablon, sayfa başına metin; ürün sayfalarında uygulamanın gerçek ekranı telefon maketinde.
// Çıktı: public/og/<slug>.jpg (fotoğraflı kart PNG'de 400 KB'ı aşıyor; WhatsApp büyük
// görselleri önizlemede göstermiyor, JPEG ~100 KB)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { satoriFonts } from './lib/fonts.mjs';
import { canonicalHost } from '../src/config/site.js';

const outDir = new URL('../public/og/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const pages = {
  default: { kicker: 'Sınav hazırlığı uygulamaları', title: 'Kendi ilerlemeni sen yönet.', sub: 'Konu, deneme, net ve hedef takibi tek uygulamada.', screen: 'p-home-bugun' },
  home: { kicker: 'Sınav hazırlığı uygulamaları', title: 'Kendi ilerlemeni sen yönet.', sub: 'Konu, deneme, net ve hedef takibi tek uygulamada. İlk ürün: Takip+ YKS.', screen: 'p-home-bugun' },
  yks: { kicker: 'Takip+ YKS', title: 'Tüm YKS hazırlığın tek uygulamada.', sub: 'Kendi koçluğunu yap, başarını kanıtla. Erken erişim listesi açık.', screen: 'p-home-sayac' },
  hakkimizda: { kicker: 'Hakkımızda', title: 'Öğrencinin kendi koçu olabileceğine inanıyoruz.', sub: 'Takip+ nasıl başladı, neyi neden yapıyoruz.', screen: 'p-home-calisma' },
  marka: { kicker: 'Marka kiti', title: 'Logolar, renkler ve yazı tipleri.', sub: 'Takip+ markasını doğru kullanmak için her şey burada.' },
  iletisim: { kicker: 'İletişim', title: 'Sorun, fikrin ya da önerin mi var?', sub: 'Bütün mesajları okuyoruz; genellikle bir iş günü içinde yanıtlıyoruz.' },
  'hesap-silme': { kicker: 'Hesap silme', title: 'Hesabını ve verilerini silme.', sub: 'Adımlar, silinen veriler ve saklama süreleri.' },
  gizlilik: { kicker: 'Gizlilik Politikası', title: 'Verilerini nasıl işliyoruz?', sub: 'Hangi veriler, neden ve ne kadar süre işlenir.' },
  'kullanim-sartlari': { kicker: 'Kullanım Şartları', title: 'Takip+ kullanım şartları.', sub: 'Hesap, topluluk kuralları, Premium ve sorumluluklar.' },
  'kvkk-aydinlatma': { kicker: 'KVKK Aydınlatma Metni', title: 'Kişisel verilerin ve hakların.', sub: '6698 sayılı Kanun kapsamında aydınlatma metni.' },
  'yks-sayaci': { kicker: 'YKS 2027 Sayacı', title: 'YKS’ye kaç gün kaldı?', sub: 'TYT, AYT ve YDT için Türkiye saatiyle saniye saniye geri sayım.', screen: 'p-home-sayac' },
  'net-hesaplama': { kicker: 'YKS Net Hesaplama', title: 'Doğrunu ve yanlışını yaz, netin çıksın.', sub: 'TYT ve AYT netleri, dört yanlış bir doğru kuralıyla.', screen: 'p-net-sihirbazi' },
};

// Düz uygulama karosu: küçük önizlemede ışıltılı sürüm çamurlaşır (marka kiti s.05)
const logoPath = fileURLToPath(new URL('../assets/brand/kit/yks/svg/uygulama-karosu-duz.svg', import.meta.url));
const markData = `data:image/png;base64,${new Resvg(readFileSync(logoPath), { fitTo: { mode: 'width', value: 192 } }).render().asPng().toString('base64')}`;
// Telefonsuz sayfalarda sağda büyük ışıltılı sembol (marka kitinin orijinal dosyası)
const glowPath = fileURLToPath(new URL('../assets/brand/kit/yks/png/isiltili-sembol-seffaf-1024.png', import.meta.url));
const glowData = `data:image/png;base64,${(await sharp(glowPath).resize(520).png().toBuffer()).toString('base64')}`;

const h = (type, style, children) => ({ type, props: { style, children } });

const screenCache = new Map();
async function screen(name) {
  if (!screenCache.has(name)) {
    const buf = await sharp(fileURLToPath(new URL(`../src/assets/app/${name}.webp`, import.meta.url))).resize(608).png().toBuffer();
    screenCache.set(name, `data:image/png;base64,${buf.toString('base64')}`);
  }
  return screenCache.get(name);
}

// Sitedeki maketin aynısı: ince siyah kenar, titanyum kenar ışığı, sahte durum çubuğu yok.
// Telefon alttan taşar (kartın altında kesilir).
function phone(src) {
  return h('div', { position: 'absolute', right: 96, top: 84, display: 'flex' }, [
    h('div', { display: 'flex', padding: 4, borderRadius: 60, backgroundImage: 'linear-gradient(160deg, #6b6684 0%, #2a2638 40%, #4b4660 100%)' }, [
      h('div', { display: 'flex', padding: 9, borderRadius: 56, background: '#06050d' }, [{ type: 'img', props: { src, width: 304, height: 676, style: { borderRadius: 47 } } }]),
    ]),
  ]);
}

async function render(slug, p) {
  const tree = h(
    'div',
    {
      position: 'relative',
      width: 1200,
      height: 630,
      display: 'flex',
      overflow: 'hidden',
      // Mağaza görsellerinin gökyüzü: ultraviyole → gece, mor ve pembe ışık
      background: '#12083F',
      backgroundImage:
        'radial-gradient(circle at 80% 55%, rgba(139,92,246,0.45), rgba(139,92,246,0) 50%), radial-gradient(circle at 96% 6%, rgba(224,86,253,0.25), rgba(224,86,253,0) 40%), linear-gradient(180deg, #2A0E8F 0%, #1E0B6B 52%, #12083F 100%)',
      color: '#F8FAFC',
      fontFamily: 'Inter, Inter Ext',
    },
    [
      p.screen ? phone(await screen(p.screen)) : { type: 'img', props: { src: glowData, width: 520, height: 520, style: { position: 'absolute', right: 20, top: 55 } } },
      h('div', { position: 'absolute', left: 72, top: 58, bottom: 58, width: 650, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
          { type: 'img', props: { src: markData, width: 76, height: 76 } },
          h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 800, fontSize: 46, letterSpacing: -0.6 }, 'Takip+'),
        ]),
        h('div', { display: 'flex', flexDirection: 'column' }, [
          h('div', { display: 'flex' }, [
            h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 700, fontSize: 24, color: '#5EEAD4', padding: '8px 20px', borderRadius: 99, background: 'rgba(45,212,191,0.12)', border: '2px solid rgba(45,212,191,0.35)', marginBottom: 24 }, p.kicker),
          ]),
          h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 800, fontSize: p.title.length > 30 ? 66 : 78, lineHeight: 1.02, letterSpacing: -2.2 }, p.title),
          h('div', { fontSize: 29, lineHeight: 1.38, color: '#DCD7F2', marginTop: 22 }, p.sub),
        ]),
        h('div', { fontFamily: 'Outfit, Outfit Ext', fontWeight: 600, fontSize: 26, color: '#C9C3E6' }, canonicalHost),
      ]),
    ],
  );
  const svg = await satori(tree, { width: 1200, height: 630, fonts: satoriFonts() });
  const pngBuf = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const buf = await sharp(pngBuf).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
  writeFileSync(new URL(`${slug}.jpg`, outDir), buf);
  return buf.length;
}

const sizes = [];
for (const [slug, p] of Object.entries(pages)) sizes.push(`${slug} ${Math.round((await render(slug, p)) / 1024)} KB`);
console.log(`og-images: ${sizes.join(', ')}`);
