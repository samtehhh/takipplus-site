/**
 * Takip+ sembolü — assets/logo.png'deki uygulama ikonunun vektör hâli.
 * Tüm logo varyantları (site içi, favicon, basın kiti dosyaları) bu
 * geometriden üretilir.
 */
export const MARK = {
  viewBox: '0 0 512 512',
  tile: { x: 16, y: 16, size: 480, r: 108 },
  t: 'M110 116H364V192H275V396H199V192H110Z',
  plus: 'M338 204H370V246H412V278H370V320H338V278H296V246H338Z',
  colors: {
    tile: '#0A0A1A',
    tStops: ['#5B21B6', '#7C3AED', '#8B5CF6', '#C084FC'],
    plus: '#F8FAFC',
    rim: '#8B5CF6',
  },
};

/** Tam SVG (karo + T+). `id` gradyan kimliklerini benzersiz kılar. */
export function markSvg({ id = 'tp', tile = true, plusColor = MARK.colors.plus, title = 'Takip+' } = {}) {
  const { tile: t, colors: c } = MARK;
  const stops = c.tStops
    .map((s, i) => `<stop offset="${(i / (c.tStops.length - 1)).toFixed(2)}" stop-color="${s}"/>`)
    .join('');
  const tileEls = tile
    ? `<rect x="${t.x}" y="${t.y}" width="${t.size}" height="${t.size}" rx="${t.r}" fill="${c.tile}"/>` +
      `<rect x="${t.x + 1}" y="${t.y + 1}" width="${t.size - 2}" height="${t.size - 2}" rx="${t.r - 1}" fill="url(#${id}-sheen)"/>` +
      `<rect x="${t.x + 1.5}" y="${t.y + 1.5}" width="${t.size - 3}" height="${t.size - 3}" rx="${t.r - 1.5}" fill="none" stroke="url(#${id}-rim)" stroke-width="3"/>`
    : '';
  const vb = tile ? MARK.viewBox : '96 100 332 312';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}">` +
    `<defs>` +
    `<linearGradient id="${id}-t" x1="0.05" y1="1" x2="0.95" y2="0">${stops}</linearGradient>` +
    `<radialGradient id="${id}-sheen" cx="0.3" cy="0.05" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/><stop offset="0.55" stop-color="${c.rim}" stop-opacity="0.10"/><stop offset="1" stop-color="${c.rim}" stop-opacity="0.55"/></linearGradient>` +
    `</defs>` +
    tileEls +
    `<path d="${MARK.t}" fill="url(#${id}-t)"/>` +
    `<path d="${MARK.plus}" fill="${plusColor}"/>` +
    `</svg>`
  );
}
