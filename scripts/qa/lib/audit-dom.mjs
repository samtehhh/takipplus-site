// Sayfa içinde çalışan denetim fonksiyonları: audit.mjs (Chrome) ve cross-browser.mjs
// (Firefox, WebKit) aynı kontrolleri kullanır. Tarayıcıya .toString() ile gönderilir;
// dışarıdan değişken kullanmamalıdır.
// ---- Sayfa içinde çalışan denetim (tarayıcıdan bağımsız, düz DOM) ----
export function inPageAudit(opts) {
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  const issues = [];
  const add = (check, sev, el, detail) => issues.push({ check, sev, el: el ? describe(el) : '', detail });
  function describe(el) {
    if (!el || !el.tagName) return '';
    const id = el.id ? `#${el.id}` : '';
    const cls = [...el.classList].filter((c) => !c.startsWith('s-')).slice(0, 2).join('.');
    const sec = el.closest('section[id], header, footer, main > section')?.id;
    return `${el.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}${sec && sec !== el.id ? ` (#${sec})` : ''}`;
  }
  const visible = (el) => {
    if (el.closest('details:not([open])') && !el.closest('summary')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const decorative = (el) => !!el.closest('[aria-hidden="true"], .device, .co, .stage, .traj, .dotgrid, .sr-only, .skip-link, dialog:not([open]), .waitlist__hp, template, noscript, .sticky-cta[hidden]');
  // kapalı <details> içeriği görünmez (SSS cevapları); özet satırı görünür
  const hiddenInDetails = (el) => !!el.closest('details:not([open])') && !el.closest('summary');
  const clippedByAncestor = (el, r) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) {
        const ar = a.getBoundingClientRect();
        if (ar.right <= vw + 1 && ar.left >= -1) return a;
      }
    }
    return null;
  };

  // 1) Yatay kaydırma + sebebi
  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) {
    const culprits = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.right > vw + 1 && !clippedByAncestor(el, r)) {
        if (culprits.some((c) => c.contains(el))) continue;
        culprits.push(el);
      }
    }
    add('yatay kaydırma', 'CRITICAL', culprits[0], `scrollWidth ${sw} > ${vw}; sebep: ${culprits.slice(0, 3).map(describe).join(' | ')}`);
  }

  // 2) Kesilen içerik (görünür, süs olmayan öğe ekran kenarından taşıyor ve bir ata kesiyor)
  const IGNORE_CUT = '.dotgrid, .traj, .glow, .goalbar, .hh__sky, .th__sky, .hero__sky, .cv__goal, .sg__track, .finale__band, .skip-link, dialog, .waitlist__hp, .sr-only, .sticky-cta, .pv__device';
  const cut = [];
  for (const el of document.querySelectorAll('main *, header *, footer *')) {
    if (el.closest(IGNORE_CUT) || !visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4) continue;
    const over = Math.max(r.right - vw, -r.left);
    if (over <= 1) continue;
    if (cut.some((c) => c.contains(el))) continue;
    // ekrana sığan, yatay kaydırılabilir bir kutunun içindeyse (geniş tablo) içerik kaydırılarak görülür
    const scroller = clippedByAncestor(el, r);
    if (scroller && /(auto|scroll)/.test(getComputedStyle(scroller).overflowX)) continue;
    cut.push(el);
    add('kesilen içerik', 'HIGH', el, `${Math.round(over)} px ekran dışında`);
  }

  // 3) Metinlerin üst üste binmesi (süs ve cihaz içi hariç)
  const textEls = [...document.querySelectorAll('h1, h2, h3, h4, p, li, a, button, label, dt, dd, summary, figcaption, small, strong')].filter((el) => !decorative(el) && visible(el) && el.textContent.trim().length > 1);
  const rects = textEls.map((el) => ({ el, r: el.getBoundingClientRect() }));
  let overlapCount = 0;
  for (let i = 0; i < rects.length && overlapCount < 6; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 4 && y > 4) {
        // iki satıra bölünen satır içi öğenin dış kutusu komşusunu kapsar; gerçek kesişme
        // satır kutuları (getClientRects) arasında aranır
        const lines = (el) => [...el.getClientRects()].filter((q) => q.width > 1 && q.height > 1);
        const hit = lines(a.el).some((p) => lines(b.el).some((q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 4 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 4));
        if (!hit) continue;
        // satır içi öğe kutuları kesişebilir; gerçek çakışma: biri diğerinin metnini örter
        const cx = Math.max(a.r.left, b.r.left) + x / 2, cy = Math.max(a.r.top, b.r.top) + y / 2;
        const top = document.elementFromPoint(cx, cy);
        if (!top) continue;
        const aTop = a.el.contains(top) || top.contains(a.el), bTop = b.el.contains(top) || top.contains(b.el);
        if (aTop && bTop) continue;
        overlapCount++;
        add('metin çakışması', 'HIGH', a.el, `${describe(b.el)} ile ${Math.round(x)}×${Math.round(y)} px`);
        break;
      }
    }
  }

  // 4) Başlık / buton / menü taşması
  for (const el of document.querySelectorAll('h1, h2, h3, .btn, .site-header a, .site-header button, .tour__tab, .seg button, .pv__btn')) {
    if (decorative(el) || !visible(el) || getComputedStyle(el).display === 'inline') continue;
    if (el.scrollWidth > el.clientWidth + 2) {
      add('metin kutusundan taşıyor', 'HIGH', el, `içerik ${el.scrollWidth} > kutu ${Math.round(el.getBoundingClientRect().width)}`);
    }
  }
  for (const btn of document.querySelectorAll('.btn')) {
    if (decorative(btn) || !visible(btn)) continue;
    const lab = btn.querySelector('.btn__label') || btn;
    const range = document.createRange();
    range.selectNodeContents(lab);
    const tops = new Set([...range.getClientRects()].filter((q) => q.width > 1).map((q) => Math.round(q.top / 4)));
    if (tops.size > 1 && vw >= 1024) add('buton etiketi iki satır', 'LOW', btn, btn.textContent.trim().slice(0, 30));
  }

  // 5) Üst menü: öğeler çakışıyor mu, tek satırda mı
  const header = document.querySelector('.site-header');
  if (header && visible(header)) {
    const items = [...header.querySelectorAll('a, button')].filter((e) => visible(e) && !e.closest('.sr-only, dialog, .skip-link'));
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].contains(items[j]) || items[j].contains(items[i])) continue;
        const a = items[i].getBoundingClientRect(), b = items[j].getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) add('menü çakışması', 'CRITICAL', items[i], describe(items[j]));
      }
    const hh = header.getBoundingClientRect().height;
    if (hh > 110) add('menü çok yüksek', 'MEDIUM', header, `${Math.round(hh)} px`);
  }

  // 6) Sabit/yapışkan öğelerin ekran payı (yakınlaştırmada içerik görünmez hale gelmesin)
  let fixedH = 0;
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if ((cs.position === 'fixed' || cs.position === 'sticky') && visible(el) && !el.closest('dialog') && cs.pointerEvents !== 'none') {
      const r = el.getBoundingClientRect();
      if (r.width > vw * 0.5 && r.height < vh) fixedH += r.height;
    }
  }
  if (fixedH > vh * 0.3) add('sabit öğeler ekranın çoğunu kaplıyor', 'HIGH', header, `${Math.round(fixedH)} / ${vh} px`);

  // 7) Görseller: kırık, oranı bozuk
  for (const img of document.images) {
    if (decorative(img) && !img.closest('.device')) continue;
    if (img.complete && img.naturalWidth === 0 && img.loading !== 'lazy' && img.getClientRects().length) add('kırık görsel', 'HIGH', img, img.currentSrc || img.src);
    const r = img.getBoundingClientRect();
    if (img.naturalWidth && r.width > 20 && getComputedStyle(img).objectFit === 'fill') {
      const d = Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) / (img.naturalWidth / img.naturalHeight);
      if (d > 0.03) add('görsel oranı bozuk', 'MEDIUM', img, `%${Math.round(d * 100)}`);
    }
  }

  // 8) Küçük dokunma hedefleri (satır içi bağlantılar hariç; WCAG 2.5.8: 24 px)
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=tab]')) {
    if (!visible(el) || el.closest('.sr-only, .waitlist__hp, dialog:not([open]), [aria-hidden="true"]')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'inline' && el.closest('p, li, dd, small, label')) continue;
    if (el.matches('input[type=checkbox], input[type=radio]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) add('küçük dokunma hedefi', 'MEDIUM', el, `${Math.round(r.width)}×${Math.round(r.height)}`);
  }

  // 9) Çok küçük yazı (süs dışı)
  const tw = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
  let small = 0;
  for (let n = tw.nextNode(); n && small < 3; n = tw.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || decorative(el) || !visible(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 11) {
      small++;
      add('çok küçük yazı', 'LOW', el, `${fs}px "${n.textContent.trim().slice(0, 24)}"`);
    }
  }
  return issues;
}

// Görünür alandaki tıklanabilir öğeler başka bir öğe tarafından örtülüyor mu
export function occlusionAudit() {
  const out = [];
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, summary, [role=tab]')) {
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('.sr-only, .waitlist__hp, dialog:not([open]), [aria-hidden="true"], .site-header, .sticky-cta')) continue;
    if (el.closest('details:not([open])') && !el.closest('summary')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.top < headerBottom + 4 || r.bottom > innerHeight - 4 || r.left < 0 || r.right > innerWidth) continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    if (!top || el.contains(top) || top.contains(el)) continue;
    if (top.closest('label') && top.closest('label').contains(el)) continue;
    // Alttaki sabit çubuk (sticky CTA) kaydırırken geçici olarak örter; sorun yalnızca
    // sayfa en sona kaydırıldığında bile öğe çubuğun altında kalıyorsa vardır
    const sticky = top.closest('.sticky-cta');
    if (sticky) {
      const maxScroll = document.documentElement.scrollHeight - innerHeight;
      const bottomAtEnd = r.bottom + scrollY - maxScroll;
      if (bottomAtEnd <= sticky.getBoundingClientRect().top + 1) continue;
    }
    out.push({ el, top, sticky: !!sticky });
  }
  return out.map((o) => ({
    check: o.sticky ? 'alttaki sabit çubuk sayfa sonunda da örtüyor' : 'tıklanabilir alan örtülü',
    sev: o.sticky ? 'MEDIUM' : 'HIGH',
    el: `${o.el.tagName.toLowerCase()}.${[...o.el.classList].slice(0, 2).join('.')} "${(o.el.textContent || '').trim().slice(0, 24)}"`,
    detail: `üstünde: ${o.top.tagName.toLowerCase()}.${[...o.top.classList].slice(0, 2).join('.')}`,
  }));
}

