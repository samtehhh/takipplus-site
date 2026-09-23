/**
 * Sitenin tek istemci betiği. İçerik bu betik olmadan da eksiksiz görünür;
 * burada yalnızca menü, sabit CTA, form gönderimi, ölçüm ve küçük
 * görünme animasyonları var.
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

// ---------- Sınav geri sayımı (widget örneği) ----------
// Uygulamadaki gibi İstanbul saatine göre takvim günü farkı
{
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
  document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
    const d = Math.round((Date.parse(el.dataset.countdown!) - Date.parse(today)) / 86400000);
    el.textContent = String(Math.max(0, d));
  });
}

// ---------- Form sonucu sayfası (JS'siz gönderim) ----------
if (new URLSearchParams(location.search).get('durum') === 'hata') root.classList.add('is-error');

// ---------- Header gölgesi (scroll dinlemeden) ----------
const sentinel = document.createElement('div');
sentinel.setAttribute('aria-hidden', 'true');
sentinel.style.cssText = 'position:absolute;top:0;height:8px;width:1px;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([entry]) => root.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);

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
  // Geniş ekrana geçilirse menüyü kapat
  window.matchMedia('(min-width: 60rem)').addEventListener('change', (m) => m.matches && setOpen(false));
}

// ---------- Görünme ve imza animasyonları ----------
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal], [data-animate]');
if (!reduceMotion && 'IntersectionObserver' in window && revealEls.length) {
  root.classList.add('motion');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  revealEls.forEach((el) => {
    // Zaten ekrandaysa animasyonsuz göster (ilk boyamada zıplama olmasın)
    const r = el.getBoundingClientRect();
    if (el.hasAttribute('data-reveal') && r.top < innerHeight * 0.9) el.classList.add('is-in');
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

// ---------- Carousel sayfa göstergesi ----------
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((c) => {
  const track = c.querySelector<HTMLElement>('.carousel__track')!;
  const dots = [...c.querySelectorAll<HTMLElement>('.carousel__dot')];
  const items = [...track.children] as HTMLElement[];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const i = items.indexOf(e.target as HTMLElement);
        dots.forEach((d, j) => d.classList.toggle('is-active', i === j));
      }
    },
    { root: track, threshold: 0.6 },
  );
  items.forEach((it) => io.observe(it));
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
    new IntersectionObserver(
      ([e]) => {
        formSeen = e.isIntersecting || e.boundingClientRect.top < 0;
        update();
      },
      { rootMargin: '0px 0px 0px 0px' },
    ).observe(form);
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
