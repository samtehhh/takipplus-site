/**
 * Sitenin tek istemci betiği. İçerik bu betik olmadan da eksiksiz görünür;
 * burada yalnızca menü, sabit CTA, form gönderimi, ölçüm, görünme
 * animasyonları, uygulama turu, sınav sayacı ve kaydırma çizgisi var.
 * Kaydırmaya bağlı her şey önce CSS (scroll-timeline) ile yapılır; JS
 * yalnızca desteklemeyen tarayıcılar için yedektir.
 */

type Va = (event: 'event', payload: { name: string; data?: Record<string, string> }) => void;
declare global {
  interface Window {
    va?: Va;
    vaq?: unknown[];
    umami?: { track: (name: string, data?: Record<string, string>) => void };
    plausible?: (name: string, opts?: { props?: Record<string, string> }) => void;
  }
}

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

// ---------- Ölçüm ----------
window.va =
  window.va ||
  function (...args: unknown[]) {
    (window.vaq = window.vaq || []).push(args);
  };

export function track(name: string, data?: Record<string, string>) {
  try {
    window.va?.('event', { name, data });
    window.umami?.track(name, data);
    window.plausible?.(name, { props: data });
  } catch {
    /* ölçüm hiçbir zaman arayüzü bozmamalı */
  }
}

// Sayfaya özgü betikler (tools.ts) ölçümü bu olayla iletir; site.ts'i içe aktarmazlar
window.addEventListener('tp:track', (e) => {
  const { name, data } = (e as CustomEvent<{ name: string; data?: Record<string, string> }>).detail;
  track(name, data);
});

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
  if (el) track(el.dataset.track!, { path: location.pathname });
});

// ---------- Form sonucu sayfası (JS'siz gönderim) ----------
if (new URLSearchParams(location.search).get('durum') === 'hata') root.classList.add('is-error');

// ---------- Header durumu (scroll dinlemeden) ----------
const sentinel = document.createElement('div');
sentinel.setAttribute('aria-hidden', 'true');
sentinel.style.cssText = 'position:absolute;top:0;height:8px;width:1px;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([entry]) => root.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);

// ---------- Hedef çizgisi: scroll-timeline desteklenmiyorsa yedek ----------
const goalbar = document.querySelector<HTMLElement>('[data-goalbar]');
if (goalbar && !CSS.supports('animation-timeline: scroll()')) {
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    goalbar.style.setProperty('--p', p.toFixed(4));
    root.classList.toggle('is-goal', p > 0.995);
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  update();
}

// ---------- Mobil menü ----------
const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
if (menu && openBtn && typeof menu.showModal === 'function') {
  const setOpen = (open: boolean) => {
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.showModal();
      menu.querySelector<HTMLAnchorElement>('.menu__links a')?.focus();
    } else if (menu.open) {
      menu.close();
    }
  };
  openBtn.addEventListener('click', () => setOpen(true));
  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => setOpen(false));
  menu.addEventListener('close', () => {
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.matchMedia('(min-width: 60rem)').addEventListener('change', (m) => m.matches && setOpen(false));
}

// ---------- Görünme ve imza animasyonları ----------
// data-reveal: metin bloğu yumuşakça belirir. data-animate: sahne kendi
// animasyonunu .is-in ile başlatır (kartlar telefondan çıkar, çizgi çizilir).
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal], [data-animate]');
if (!reduceMotion && 'IntersectionObserver' in window && revealEls.length) {
  root.classList.add('motion');
  // Düzen ölçmeden: ilk gözlemde ekranda olmayan metin "bekliyor" olur ve
  // görünür olunca belirir. İlk ekrandaki metin hiç gizlenmez (zıplama yok).
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.remove('is-pending');
          el.classList.add('is-in');
          io.unobserve(el);
        } else if (!el.classList.contains('is-in')) {
          el.classList.add('is-pending');
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

// ---------- Cihaz ekranları: yükleme ışığı ve yumuşak açılış ----------
// Tembel yüklenen ekran görüntüsü gelene kadar gizli kalır (çerçevede ışık süzülür), gelince
// aydınlanarak açılır. Öncelikli (hero) görsel hiç gizlenmez: LCP gecikmesin.
document.querySelectorAll<HTMLImageElement>('.device__shot img').forEach((img) => {
  const device = img.closest<HTMLElement>('.device');
  const done = () => {
    img.classList.remove('is-loading');
    if (img.closest('.device__shot')?.classList.contains('is-active')) device?.classList.add('is-loaded');
  };
  if (img.complete && img.naturalWidth > 0) return done();
  if (img.loading === 'lazy') img.classList.add('is-loading');
  img.addEventListener('load', done, { once: true });
  // Yüklenemezse kırık görsel simgesi yerine boş koyu ekran kalır
  img.addEventListener(
    'error',
    () => {
      img.classList.add('is-broken');
      device?.classList.add('is-loaded');
    },
    { once: true },
  );
});

// ---------- Uygulama turu (ARIA sekmeleri + videolar) ----------
// Her sekmenin kısa bir uygulama klibi var. Bölüm görünürken seçili sekmenin klibi oynar,
// sekmedeki çubuk videonun ilerlemesini gösterir, klip bitince sıradaki sekmeye geçilir.
// Kullanıcı bir sekme seçerse otomatik geçiş durur, o klip döngüde oynar. "Turu durdur"
// videoyu da durdurur. Hareket azaltılmışsa hiçbir şey kendiliğinden oynamaz; düğmeyle başlar.
// Videosu olmayan sekmede ya da video açılamazsa eski zamanlayıcı (5,2 sn) çalışır.
document.querySelectorAll<HTMLElement>('[data-tour]').forEach((tour) => {
  const tabs = [...tour.querySelectorAll<HTMLButtonElement>('[data-tour-tab]')];
  const texts = [...tour.querySelectorAll<HTMLElement>('[data-tour-text]')];
  const shots = [...tour.querySelectorAll<HTMLElement>('.device__shot')];
  const panel = tour.querySelector<HTMLElement>('[role="tabpanel"]');
  const playBtn = tour.querySelector<HTMLButtonElement>('[data-tour-play]');
  const playLabel = playBtn?.querySelector<HTMLElement>('[data-tour-play-label]');
  if (!tabs.length || !panel) return;

  const MS = 5200;
  const videoOf = (k: number) => shots[k]?.querySelector<HTMLVideoElement>('video[data-shot-video]') ?? null;
  const barOf = (k: number) => tabs[k].querySelector<HTMLElement>('.tour__bar i');
  let current = 0;
  let inView = false;
  let focused = false;
  let auto = !reduceMotion; // klip bitince sıradakine geç
  let stopped = reduceMotion; // hiç oynatma (düğmeyle)
  let timer = 0;
  let raf = 0;
  let started = 0;

  const setProgress = (k: number, r: number) => barOf(k)?.style.setProperty('--tp', String(Math.min(1, Math.max(0, r))));

  const stopAll = () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    tour.classList.remove('is-playing');
  };

  const tick = () => {
    const v = videoOf(current);
    if (v && v.duration) setProgress(current, v.currentTime / v.duration);
    else if (started) setProgress(current, (performance.now() - started) / MS);
    raf = requestAnimationFrame(tick);
  };

  const advance = () => {
    if (auto && !focused) select(current + 1);
    else run();
  };

  const run = () => {
    stopAll();
    if (stopped || !inView) {
      videoOf(current)?.pause();
      return;
    }
    tour.classList.add('is-playing');
    const v = videoOf(current);
    started = 0;
    if (v) {
      v.loop = !auto;
      v.play().catch(() => {
        // video açılamadı: zamanlayıcıyla devam
        started = performance.now();
        timer = window.setTimeout(advance, MS);
      });
    } else {
      started = performance.now();
      timer = window.setTimeout(advance, MS);
    }
    raf = requestAnimationFrame(tick);
  };

  shots.forEach((s, k) => {
    const v = videoOf(k);
    if (!v) return;
    v.addEventListener('playing', () => v.classList.add('is-playing'));
    v.addEventListener('ended', () => {
      if (k === current) advance();
    });
  });

  const select = (n: number, focus = false) => {
    const prev = current;
    current = (n + tabs.length) % tabs.length;
    if (prev !== current) {
      const pv = videoOf(prev);
      if (pv) {
        pv.pause();
        pv.currentTime = 0;
        pv.classList.remove('is-playing');
      }
      setProgress(prev, 0);
    }
    tabs.forEach((t, k) => {
      const on = k === current;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    texts.forEach((p, k) => p.classList.toggle('is-active', k === current));
    shots.forEach((s, k) => {
      s.classList.toggle('is-active', k === current);
      if (k === current) s.removeAttribute('aria-hidden');
      else s.setAttribute('aria-hidden', 'true');
    });
    panel.setAttribute('aria-labelledby', tabs[current].id);
    if (focus) tabs[current].focus();
    setProgress(current, 0);
    const v = videoOf(current);
    if (v) v.currentTime = 0;
    run();
  };

  const setStopped = (value: boolean) => {
    stopped = value;
    if (playBtn && playLabel) {
      playBtn.setAttribute('aria-pressed', String(value));
      playLabel.textContent = value ? 'Turu başlat' : 'Turu durdur';
    }
    run();
  };

  tabs.forEach((t, k) =>
    t.addEventListener('click', () => {
      // Kullanıcı seçti: otomatik geçiş biter, seçilen klip döngüde oynar
      auto = false;
      select(k);
    }),
  );

  tour.querySelector('[data-tour-tabs]')?.addEventListener('keydown', (e) => {
    const key = (e as KeyboardEvent).key;
    const cols = 3;
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: cols,
      ArrowUp: -cols,
    };
    let next: number | null = null;
    if (key in moves) next = current + moves[key];
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    auto = false;
    select(Math.min(tabs.length - 1, Math.max(0, next)), true);
  });

  // Klavyeyle içerideyken sekme kendiliğinden değişmez (klip döngüde)
  tour.addEventListener('focusin', () => {
    focused = true;
  });
  tour.addEventListener('focusout', (e) => {
    if (!tour.contains((e as FocusEvent).relatedTarget as Node)) focused = false;
  });

  if (playBtn) {
    playBtn.hidden = false;
    playBtn.setAttribute('aria-pressed', String(stopped));
    if (playLabel) playLabel.textContent = stopped ? 'Turu başlat' : 'Turu durdur';
    playBtn.addEventListener('click', () => {
      if (stopped) auto = true;
      setStopped(!stopped);
    });
  }

  new IntersectionObserver(
    ([entry]) => {
      const was = inView;
      inView = entry.isIntersecting;
      if (inView !== was) run();
    },
    { threshold: 0.35 },
  ).observe(tour);

  // Diğer sekmelerin kapakları ancak tura yaklaşınca yüklensin (ilk açılışta bant genişliği hero'ya)
  const arm = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      tour.classList.add('is-armed');
      arm.disconnect();
    },
    { rootMargin: '0px' },
  );
  arm.observe(tour);
});

// ---------- Mağaza görselleri galerisi ----------
// Şeritler <template> içinde; bölüm ekrana ~800 px yaklaşınca sayfaya eklenir (ilk açılışta
// görseller hero ile yarışmasın). Sekme ve oklar şeritler gelince bağlanır.
document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((g) => {
  const tpl = g.querySelector<HTMLTemplateElement>('template[data-gallery-tpl]');
  const host = g.querySelector<HTMLElement>('[data-gallery-sets]');
  if (!tpl || !host) return;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      host.append(tpl.content.cloneNode(true));
      initGallery(g);
    },
    { rootMargin: '800px 0px' },
  );
  io.observe(g);
});

function initGallery(g: HTMLElement) {
  const tabs = [...g.querySelectorAll<HTMLButtonElement>('[data-gallery-tab]')];
  const sets = [...g.querySelectorAll<HTMLElement>('[data-gallery-set]')];
  const sw = g.querySelector<HTMLElement>('[data-gallery-switch]');
  const nav = g.querySelector<HTMLElement>('[data-gallery-nav]');
  if (sw) sw.hidden = false;
  if (nav) nav.hidden = false;
  const active = () => sets.find((s) => s.hasAttribute('data-active'))?.querySelector<HTMLElement>('.sg__track');
  const select = (kind: string, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.galleryTab === kind;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    sets.forEach((s) => s.toggleAttribute('data-active', s.dataset.gallerySet === kind));
  };
  tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.galleryTab!)));
  sw?.addEventListener('keydown', (e) => {
    const key = (e as KeyboardEvent).key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const next = tabs[(i + (key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    select(next.dataset.galleryTab!, true);
  });
  const step = (dir: number) => {
    const track = active();
    const item = track?.querySelector<HTMLElement>('.sg__item');
    if (!track || !item) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    track.scrollBy({ left: dir * (item.offsetWidth + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  g.querySelector('[data-gallery-prev]')?.addEventListener('click', () => step(-1));
  g.querySelector('[data-gallery-next]')?.addEventListener('click', () => step(1));
}

// ---------- Sınav sayacı ----------
document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((cd) => {
  const target = Date.parse(cd.dataset.countdown!);
  if (Number.isNaN(target)) return;
  const out = {
    d: cd.querySelector<HTMLElement>('[data-cd="d"]'),
    h: cd.querySelector<HTMLElement>('[data-cd="h"]'),
    m: cd.querySelector<HTMLElement>('[data-cd="m"]'),
    s: cd.querySelector<HTMLElement>('[data-cd="s"]'),
  };
  const sr = cd.querySelector<HTMLElement>('[data-cd-sr]');
  const pad = (n: number) => String(n).padStart(2, '0');
  const tick = () => {
    const left = Math.max(0, target - Date.now());
    const d = Math.floor(left / 86_400_000);
    const h = Math.floor((left % 86_400_000) / 3_600_000);
    const m = Math.floor((left % 3_600_000) / 60_000);
    const s = Math.floor((left % 60_000) / 1000);
    if (out.d) out.d.textContent = String(d);
    if (out.h) out.h.textContent = pad(h);
    if (out.m) out.m.textContent = pad(m);
    if (out.s) out.s.textContent = pad(s);
    return { d, h };
  };
  const first = tick();
  if (sr) sr.textContent = `Sınava ${first.d} gün ${first.h} saat kaldı.`;
  cd.classList.add('is-ready');
  // Saniyeler yalnızca hareket azaltılmamışsa akar; aksi hâlde dakikada bir
  window.setInterval(tick, reduceMotion ? 60_000 : 1000);
});

// ---------- Tekrar takvimi: ziyaretçinin bugününe göre tarihler ----------
{
  const els = document.querySelectorAll<HTMLElement>('[data-rt-date]');
  if (els.length) {
    const fmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' });
    const now = Date.now();
    els.forEach((el) => {
      const days = Number(el.dataset.rtDate);
      el.textContent = fmt.format(new Date(now + days * 86_400_000));
    });
  }
}

// ---------- Akan soru süresi (Optik Çözüm kartı) ----------
document.querySelectorAll<HTMLElement>('[data-tick]').forEach((el) => {
  if (reduceMotion) return;
  // Uygulamadaki sayacın üstünde durur ve onun gösterdiği değerden başlar (m:ss). Her
  // görünüşte baştan başlar: sayfa uzun süre açık kalınca "17:01" gibi anlamsız değerler çıkmaz.
  const start = Number(el.dataset.tick) || 0;
  let sec = start;
  let id = 0;
  const fmt = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
  new IntersectionObserver(([entry]) => {
    clearInterval(id);
    if (entry.isIntersecting) {
      sec = start;
      el.textContent = fmt(sec);
      id = window.setInterval(() => {
        sec += 1;
        el.textContent = fmt(sec);
      }, 1000);
    }
  }).observe(el);
});

// ---------- Sabit CTA (mobil) ----------
const sticky = document.querySelector<HTMLElement>('[data-sticky]');
const hero = document.querySelector('[data-hero]');
const form = document.querySelector('#erken-erisim');
if (sticky && hero) {
  let heroGone = false;
  let formSeen = false;
  const update = () => {
    const show = heroGone && !formSeen;
    sticky.classList.toggle('is-shown', show);
    sticky.hidden = !show;
  };
  new IntersectionObserver(([e]) => {
    heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
    update();
  }).observe(hero);
  if (form) {
    new IntersectionObserver(([e]) => {
      formSeen = e.isIntersecting || e.boundingClientRect.top < 0;
      update();
    }).observe(form);
  }
  // Klavye açıkken (odak bir input'tayken) çubuğu gizle
  document.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).matches('input, textarea, select')) {
      sticky.classList.remove('is-shown');
    }
  });
  document.addEventListener('focusout', update);
}

// ---------- Mağaza butonları: cihaza göre sıralama ----------
const ua = navigator.userAgent;
const platform = /android/i.test(ua) ? 'android' : /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : '';
if (platform) {
  document.querySelectorAll<HTMLElement>('[data-stores]').forEach((group) => {
    const preferred = group.querySelector<HTMLElement>(`[data-store="${platform}"]`);
    if (preferred) group.prepend(preferred);
  });
}

// ---------- Bekleme listesi formu ----------
document.querySelectorAll<HTMLFormElement>('form[data-waitlist]').forEach((f) => {
  const email = f.querySelector<HTMLInputElement>('input[type="email"]')!;
  const consent = f.querySelector<HTMLInputElement>('input[name="consent"]')!;
  const emailErr = f.querySelector<HTMLElement>('[data-error="email"]')!;
  const consentErr = f.querySelector<HTMLElement>('[data-error="consent"]')!;
  const status = f.querySelector<HTMLElement>('[data-status]')!;
  const submit = f.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const setError = (input: HTMLInputElement, box: HTMLElement, msg: string) => {
    box.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  f.noValidate = true;
  email.addEventListener('input', () => setError(email, emailErr, ''));
  consent.addEventListener('change', () => setError(consent, consentErr, ''));

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    f.dataset.state = '';

    let ok = true;
    const value = email.value.trim();
    if (!value) {
      setError(email, emailErr, 'E-posta adresini yaz.');
      ok = false;
    } else if (!email.checkValidity()) {
      setError(email, emailErr, 'Bu e-posta adresi geçerli görünmüyor. Örnek: ad@ornek.com');
      ok = false;
    }
    if (!consent.checked) {
      setError(consent, consentErr, 'Devam etmek için aydınlatma metnini okuduğunu onayla.');
      ok = false;
    }
    if (!ok) {
      (f.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }

    submit.disabled = true;
    submit.dataset.loading = '';
    const data = Object.fromEntries(new FormData(f)) as Record<string, string>;
    try {
      const res = await fetch(f.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, email: value, consent: true, source: location.pathname }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Kayıt şu an tamamlanamadı.');
      f.dataset.state = 'success';
      const done = f.querySelector<HTMLElement>('[data-success]')!;
      done.hidden = false;
      if (body.doubleOptIn) done.querySelector<HTMLElement>('[data-doi]')!.hidden = false;
      done.focus();
      track('waitlist_signup', { path: location.pathname });
    } catch (err) {
      f.dataset.state = 'error';
      status.textContent = `${(err as Error).message} Birazdan tekrar dene ya da bize e-posta gönder.`;
      track('waitlist_error', { path: location.pathname });
    } finally {
      submit.disabled = false;
      delete submit.dataset.loading;
    }
  });
});
