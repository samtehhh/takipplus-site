document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => links.classList.remove("open"));
    });
  }

  const nav = document.querySelector(".site-nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const revealTargets = document.querySelectorAll("[data-reveal], .reveal-group");
  if (revealTargets.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealTargets.forEach((el) => io.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    }
  }

  const spotlight = document.querySelector(".spotlight");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktopPointer = window.matchMedia("(min-width: 901px) and (pointer: fine)").matches;

  if (spotlight && isDesktopPointer && !prefersReducedMotion) {
    let frame = null;

    const updateSpotlight = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        spotlight.style.setProperty("--mx", x + "%");
        spotlight.style.setProperty("--my", y + "%");
        spotlight.classList.add("active");
        frame = null;
      });
    };

    window.addEventListener("mousemove", updateSpotlight, { passive: true });
    document.addEventListener("mouseleave", () => spotlight.classList.remove("active"));
  }
});
