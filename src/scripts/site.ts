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

// ---------- Uygulama turu (ARIA sekmeleri + otomatik ilerleme) ----------
document.querySelectorAll<HTMLElement>('[data-tour]').forEach((tour) => {
  const tabs = [...tour.querySelectorAll<HTMLButtonElement>('[data-tour-tab]')];
  const texts = [...tour.querySelectorAll<HTMLElement>('[data-tour-text]')];
  const shots = [...tour.querySelectorAll<HTMLElement>('.device__shot')];
  const panel = tour.querySelector<HTMLElement>('[role="tabpanel"]');
  const playBtn = tour.querySelector<HTMLButtonElement>('[data-tour-play]');
  const playLabel = playBtn?.querySelector<HTMLElement>('[data-tour-play-label]');
  if (!tabs.length || !panel) return;

  const MS = 5200;
  let current = 0;
  let timer = 0;
  let inView = false;
  let held = false;
  let stopped = reduceMotion;

  const playing = () => !stopped && inView && !held;

  const schedule = () => {
    clearTimeout(timer);
    tour.classList.remove('is-playing');
    if (!playing()) return;
    void tour.offsetWidth; // ilerleme çubuğunun animasyonunu baştan başlat
    tour.classList.add('is-playing');
    timer = window.setTimeout(() => select(current + 1), MS);
  };

  const select = (n: number, focus = false) => {
    current = (n + tabs.length) % tabs.length;
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
    schedule();
  };

  const setStopped = (value: boolean) => {
    stopped = value;
    if (playBtn && playLabel) {
      playBtn.setAttribute('aria-pressed', String(value));
      playLabel.textContent = value ? 'Turu başlat' : 'Turu durdur';
    }
    schedule();
  };

  tabs.forEach((t, k) =>
    t.addEventListener('click', () => {
      // Kullanıcı seçti: otomatik ilerleme biter
      if (!stopped) setStopped(true);
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
    if (!stopped) setStopped(true);
    select(Math.min(tabs.length - 1, Math.max(0, next)), true);
  });

  // Üzerine gelince ya da içine odaklanınca bekle
  tour.addEventListener('pointerenter', (e) => {
    if ((e as PointerEvent).pointerType === 'mouse') {
      held = true;
      schedule();
    }
  });
  tour.addEventListener('pointerleave', () => {
    if (held) {
      held = false;
      schedule();
    }
  });
  tour.addEventListener('focusin', () => {
    held = true;
    schedule();
  });
  tour.addEventListener('focusout', (e) => {
    if (!tour.contains((e as FocusEvent).relatedTarget as Node)) {
      held = false;
      schedule();
    }
  });

  if (playBtn && !reduceMotion) {
    playBtn.hidden = false;
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.addEventListener('click', () => {
      setStopped(!stopped);
      // düğmeye basmak odak demek; turun sürmesi için bekleme bırakılır
      held = false;
      schedule();
    });
  }

  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    },
    { threshold: 0.35 },
  ).observe(tour);

  // Diğer sekmelerin ekranları ancak tura yaklaşınca yüklensin (ilk açılışta bant genişliği hero'ya)
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
  let sec = Number(el.dataset.tick) || 0;
  let id = 0;
  const fmt = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  new IntersectionObserver(([entry]) => {
    clearInterval(id);
    if (entry.isIntersecting) {
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
