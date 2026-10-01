/**
 * Web araçları: YKS Sayacı (/yks-sayaci) ve Net Hesaplama (/net-hesaplama).
 * Hesaplar uygulamayla aynı (lib/screens/ana_panel.dart, net_wizard_screen.dart).
 * Sayfalar JS olmadan da tarihleri ve kuralları gösterir; sayılar burada yazılır.
 */
// Ölçüm site.ts üzerinden (tp:track olayı): bu dosya site.ts'i içe aktarmaz, yoksa site.ts
// ayrı bir parçaya bölünüp her sayfada fazladan bir JS isteği doğuruyordu.
const track = (name: string, data?: Record<string, string>) =>
  window.dispatchEvent(new CustomEvent('tp:track', { detail: { name, data } }));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DAY = 86_400_000;
const TR = 3 * 3_600_000; // Türkiye: UTC+3, yaz saati yok
const pad = (n: number) => String(n).padStart(2, '0');
const num = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
const int = new Intl.NumberFormat('tr-TR');

/** Türkiye takvim günü (0 = 1 Ocak 1970, perşembe) */
const trDay = (t: number) => Math.floor((t + TR) / DAY);

function monthsDays(from: number, to: number) {
  const a = new Date(from + TR);
  const b = new Date(to + TR);
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  let days = b.getUTCDate() - a.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate();
  }
  return { months: Math.max(0, months), days: Math.max(0, days) };
}

// ---------- YKS Sayacı ----------
document.querySelectorAll<HTMLElement>('[data-yc]').forEach((card) => {
  const target = Date.parse(card.dataset.yc!);
  if (Number.isNaN(target)) return;
  const unit = (k: string) => card.querySelector<HTMLElement>(`[data-yc-unit="${k}"]`);
  const out = { d: unit('d'), h: unit('h'), m: unit('m'), s: unit('s') };
  const sr = card.querySelector<HTMLElement>('[data-yc-sr]');

  const tick = () => {
    const left = Math.max(0, target - Date.now());
    const d = Math.floor(left / DAY);
    const h = Math.floor((left % DAY) / 3_600_000);
    const m = Math.floor((left % 3_600_000) / 60_000);
    const s = Math.floor((left % 60_000) / 1000);
    if (out.d) out.d.textContent = pad(d);
    if (out.h) out.h.textContent = pad(h);
    if (out.m) out.m.textContent = pad(m);
    if (out.s) out.s.textContent = pad(s);
    return { d, h, m };
  };
  const first = tick();
  if (sr) sr.textContent = `YKS’ye ${first.d} gün ${first.h} saat ${first.m} dakika kaldı.`;
  card.classList.add('is-ready');
  window.setInterval(tick, reduceMotion ? 60_000 : 1000);
});

// Oturum kartları: kalan gün ve hazırlık yılının geride kalan kısmı (Android widget'ı gibi)
{
  const cards = document.querySelectorAll<HTMLElement>('[data-session]');
  const paint = () => {
    const now = Date.now();
    cards.forEach((c) => {
      const to = Date.parse(c.dataset.session!);
      const from = Date.parse(c.dataset.from!);
      const days = Math.max(0, Math.floor((to - now) / DAY));
      const pct = Math.floor(Math.min(1, Math.max(0, (now - from) / (to - from))) * 100);
      const dEl = c.querySelector<HTMLElement>('[data-session-days]');
      const pEl = c.querySelector<HTMLElement>('[data-session-pct]');
      if (dEl) dEl.textContent = int.format(days);
      if (pEl) pEl.textContent = `%${pct}`;
      c.style.setProperty('--p', String(pct / 100));
      c.classList.add('is-ready');
    });
  };
  if (cards.length) {
    paint();
    window.setInterval(paint, 60_000);
  }
}

// Kalan süre: hafta, hafta sonu, ay
document.querySelectorAll<HTMLElement>('[data-span]').forEach((box) => {
  const target = Date.parse(box.dataset.span!);
  if (Number.isNaN(target)) return;
  const set = (k: string, v: string) => {
    const el = box.querySelector<HTMLElement>(`[data-span-${k}]`);
    if (el) el.textContent = v;
  };
  const now = Date.now();
  const days = Math.max(0, Math.floor((target - now) / DAY));
  let saturdays = 0;
  for (let i = trDay(now) + 1; i < trDay(target); i++) if (i % 7 === 2) saturdays++;
  const md = monthsDays(now, target);
  set('weeks', int.format(Math.floor(days / 7)));
  set('weekends', int.format(saturdays));
  set('months', int.format(md.months));
  set('mdays', int.format(md.days));
  box.classList.add('is-ready');
});

// ---------- Net Hesaplama ----------
document.querySelectorAll<HTMLElement>('[data-netcalc]').forEach((calc) => {
  const KEY = 'tp-net-v1';
  const cards = [...calc.querySelectorAll<HTMLElement>('[data-subject]')];
  const areaBtns = [...calc.querySelectorAll<HTMLButtonElement>('[data-area]')];
  const aytBlock = calc.querySelector<HTMLElement>('[data-ayt]');
  const aytTitle = calc.querySelector<HTMLElement>('[data-ayt-title]');
  let area = 'SAY';
  let tracked = false;

  type Saved = { area?: string; v?: Record<string, [number, number]> };
  let saved: Saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Saved;
  } catch {
    saved = {};
  }

  const digits = (s: string) => {
    const n = parseInt(s.replace(/\D/g, ''), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const fmt = (n: number) => num.format(n);
  // Yalnız değişen metni yaz: ekran okuyucu aynı toplamı her tuşta yeniden okumasın
  const setText = (el: HTMLElement | null, v: string) => {
    if (el && el.textContent !== v) el.textContent = v;
  };

  const save = () => {
    const v: Record<string, [number, number]> = {};
    for (const c of cards) {
      const d = digits(c.querySelector<HTMLInputElement>('[data-d]')!.value);
      const y = digits(c.querySelector<HTMLInputElement>('[data-y]')!.value);
      if (d || y) v[c.dataset.subject!] = [d, y];
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ area, v }));
    } catch {
      /* gizli pencere ya da kapalı depolama: hesap yine çalışır */
    }
  };

  /** Bir dersin neti; doğru + yanlış soru sayısını aşamaz (uygulamadaki gibi yanlış kırpılır) */
  const compute = (c: HTMLElement, changed?: 'd' | 'y') => {
    const q = Number(c.dataset.q);
    const dIn = c.querySelector<HTMLInputElement>('[data-d]')!;
    const yIn = c.querySelector<HTMLInputElement>('[data-y]')!;
    const d = Math.min(q, digits(dIn.value));
    const y = Math.min(digits(yIn.value), q - d);
    if (changed) {
      if (dIn.value !== '' && String(d) !== dIn.value) dIn.value = String(d);
      if (yIn.value !== '' && String(y) !== yIn.value) yIn.value = String(y);
    }
    const net = d - y / 4;
    setText(c.querySelector('[data-net]'), fmt(net));
    setText(c.querySelector('[data-blank]'), String(q - d - y));
    c.classList.toggle('is-negative', net < 0);
    return { net, q };
  };

  const visible = (c: HTMLElement) => {
    const areas = c.dataset.areas;
    return !areas || areas.split(' ').includes(area);
  };

  const totals = () => {
    for (const block of calc.querySelectorAll<HTMLElement>('[data-total]')) {
      const group = block.dataset.total!;
      let sum = 0;
      let max = 0;
      for (const c of cards) {
        if (c.dataset.group !== group || !visible(c)) continue;
        const r = compute(c);
        sum += r.net;
        max += r.q;
      }
      setText(block.querySelector('[data-total-net]'), fmt(sum));
      setText(block.querySelector('[data-total-max]'), String(max));
      block.style.setProperty('--p', String(max ? Math.min(1, Math.max(0, sum / max)) : 0));
    }
  };

  const setArea = (next: string, persist = true) => {
    area = areaBtns.some((b) => b.dataset.area === next) ? next : 'SAY';
    for (const b of areaBtns) b.setAttribute('aria-pressed', String(b.dataset.area === area));
    for (const c of cards) if (c.dataset.areas) c.hidden = !visible(c);
    if (aytBlock) aytBlock.hidden = area === 'TYT';
    if (aytTitle) aytTitle.textContent = area === 'DİL' ? 'YDT netin' : `AYT netlerin (${area})`;
    totals();
    if (persist) save();
  };

  // Kayıtlı değerler
  for (const c of cards) {
    const v = saved.v?.[c.dataset.subject!];
    if (v) {
      c.querySelector<HTMLInputElement>('[data-d]')!.value = v[0] ? String(v[0]) : '';
      c.querySelector<HTMLInputElement>('[data-y]')!.value = v[1] ? String(v[1]) : '';
    }
  }

  calc.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    const card = input.closest<HTMLElement>('[data-subject]');
    if (!card) return;
    const clean = input.value.replace(/\D/g, '').slice(0, 2);
    if (clean !== input.value) input.value = clean;
    compute(card, input.hasAttribute('data-d') ? 'd' : 'y');
    totals();
    save();
    if (!tracked) {
      tracked = true;
      track('tool_net_input', { area });
    }
  });

  // Odaklanınca içerik seçilir: "0"ı silmeden yeni sayı yazılır (uygulamadaki gibi)
  calc.addEventListener('focusin', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.matches('[data-d], [data-y]')) requestAnimationFrame(() => input.select());
  });

  for (const b of areaBtns) b.addEventListener('click', () => setArea(b.dataset.area!));

  calc.querySelector('[data-reset]')?.addEventListener('click', () => {
    for (const input of calc.querySelectorAll<HTMLInputElement>('[data-d], [data-y]')) input.value = '';
    totals();
    save();
    const status = calc.querySelector<HTMLElement>('[data-reset-status]');
    if (status) status.textContent = 'Bütün doğru ve yanlışlar temizlendi.';
  });

  setArea(saved.area ?? 'SAY', false);
  calc.classList.add('is-ready');
});
