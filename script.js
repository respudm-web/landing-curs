// ============================================================
//  GSAP + ScrollTrigger — main animation file
//  - FOUC-safe: CSS hides animated elements via html.has-js; GSAP reveals.
//  - Respects prefers-reduced-motion via gsap.matchMedia().
//  - Shapes: fade in + scroll parallax + continuous float.
// ============================================================

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power2.out', duration: 0.7 });

// ============================================================
//  matchMedia — responsive + reduced-motion branches
// ============================================================
const mm = gsap.matchMedia();

mm.add(
  {
    isReduced: '(prefers-reduced-motion: reduce)',
    isNormal:  '(prefers-reduced-motion: no-preference)',
  },
  (context) => {
    const { isReduced } = context.conditions;

    // ─────────────────────────────────────────────────────────────
    //  3D CHROME SHAPES
    //  Each shape has three layered animations:
    //   1. fade-in to target opacity (from CSS --shape-opacity)
    //   2. scroll-linked parallax (y, scrub)
    //   3. continuous float (yPercent + rotation, yoyo)
    //  Different transform props don't conflict because GSAP composes
    //  x / y / xPercent / yPercent / rotation independently.
    // ─────────────────────────────────────────────────────────────
    const shapes = gsap.utils.toArray('.shape-3d');
    shapes.forEach((el, i) => {
      const speed       = parseFloat(el.dataset.parallax) || 0;
      const floatPhase  = parseFloat(el.dataset.float) || 1;
      const targetAlpha = parseFloat(getComputedStyle(el).getPropertyValue('--shape-opacity')) || 0.55;
      const parent      = el.closest('section, .hero') || el.parentElement;

      // 1. Fade-in when section enters viewport
      gsap.to(el, {
        opacity: targetAlpha,
        duration: isReduced ? 0 : 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: parent, start: 'top 95%', once: true },
      });

      if (isReduced) return;

      // 2. Scroll-linked parallax
      gsap.to(el, {
        y: () => speed * window.innerHeight * 1.4,
        ease: 'none',
        scrollTrigger: {
          trigger: parent,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // 3. Continuous float — subtle life, varies per shape
      gsap.to(el, {
        yPercent: 4 + (i % 3) * 2,
        rotation: 2 + floatPhase,
        duration: 5 + floatPhase * 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: floatPhase * 0.4,
      });
    });

    if (isReduced) {
      // Reveal all animated elements immediately for reduced-motion users
      gsap.set([
        '.tag', '.hero-title', '.hero-sub', '.hero-cta', '.hero-meta', '.hero-visual',
        '.section-head', '.pain-card', '.result-card', '.module', '.strip-item',
        '.testimonial', '.author-photo-wrap', '.author-content', '.price-card',
        '.faq-item', '.final-inner',
      ], { autoAlpha: 1, y: 0, x: 0 });
      return;
    }

    // ─────────────────────────────────────────────────────────────
    //  HERO ENTRANCE — timeline with stagger, subtle blur for futuristic feel
    // ─────────────────────────────────────────────────────────────
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.tag',
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 })
      .fromTo('.hero-title',
        { y: 60, autoAlpha: 0, filter: 'blur(8px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.0 },
        '-=0.3')
      .fromTo('.hero-sub',
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7 },
        '-=0.55')
      .fromTo('.hero-cta',
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
        '-=0.4')
      .fromTo('.hero-meta',
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
        '-=0.4')
      .fromTo('.hero-visual',
        { x: 60, autoAlpha: 0, scale: 0.96 },
        { x: 0, autoAlpha: 1, scale: 1, duration: 1.0 },
        '-=0.8');

    // ─────────────────────────────────────────────────────────────
    //  SECTION HEADS — reveal on scroll
    // ─────────────────────────────────────────────────────────────
    gsap.utils.toArray('.section-head').forEach((el) => {
      gsap.fromTo(el,
        { y: 40, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, duration: 0.8,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        }
      );
    });

    // ─────────────────────────────────────────────────────────────
    //  CARDS — ScrollTrigger.batch (efficient grouped reveal)
    // ─────────────────────────────────────────────────────────────
    const batchReveal = (selector, opts = {}) => {
      ScrollTrigger.batch(selector, {
        start: opts.start || 'top 85%',
        once: true,
        onEnter: (els) =>
          gsap.fromTo(els,
            { y: opts.y ?? 50, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: opts.stagger ?? 0.1, duration: opts.duration ?? 0.7 }
          ),
      });
    };

    batchReveal('.pain-card',   { start: 'top 82%' });
    batchReveal('.result-card');
    batchReveal('.module',      { stagger: 0.12 });
    batchReveal('.strip-item',  { stagger: 0.15, y: 30 });
    batchReveal('.testimonial');

    // ─────────────────────────────────────────────────────────────
    //  AUTHOR — two-column slide-in
    // ─────────────────────────────────────────────────────────────
    gsap.fromTo('.author-photo-wrap',
      { x: -50, autoAlpha: 0 },
      {
        x: 0, autoAlpha: 1, duration: 0.9,
        scrollTrigger: { trigger: '.author-grid', start: 'top 78%', once: true },
      }
    );
    gsap.fromTo('.author-content',
      { x: 50, autoAlpha: 0 },
      {
        x: 0, autoAlpha: 1, duration: 0.9,
        scrollTrigger: { trigger: '.author-grid', start: 'top 78%', once: true },
      }
    );

    // ─────────────────────────────────────────────────────────────
    //  PRICE CARD
    // ─────────────────────────────────────────────────────────────
    gsap.fromTo('.price-card',
      { y: 50, autoAlpha: 0, scale: 0.98 },
      {
        y: 0, autoAlpha: 1, scale: 1, duration: 0.9,
        scrollTrigger: { trigger: '.price-card', start: 'top 85%', once: true },
      }
    );

    // ─────────────────────────────────────────────────────────────
    //  FAQ — stagger in
    // ─────────────────────────────────────────────────────────────
    gsap.fromTo('.faq-item',
      { y: 30, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.6,
        scrollTrigger: { trigger: '.faq', start: 'top 82%', once: true },
      }
    );

    // ─────────────────────────────────────────────────────────────
    //  FINAL CTA
    // ─────────────────────────────────────────────────────────────
    gsap.fromTo('.final-inner',
      { y: 40, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.8,
        scrollTrigger: { trigger: '.final-inner', start: 'top 80%', once: true },
      }
    );
  }
);

// ============================================================
//  Header — shadow + blur on scroll  (no GSAP needed)
//  [LIGHT THEME-AWARE] — checks html.light. To roll back,
//  restore the dark-only two-liner shown in the comment below.
// ============================================================
const header = document.querySelector('.site-header');
const onHeaderScroll = () => {
  const scrolled = window.scrollY > 20;
  const light = document.documentElement.classList.contains('light');
  header.style.boxShadow = scrolled
    ? (light ? '0 10px 30px rgba(10,11,14,0.08)' : '0 10px 30px rgba(0,0,0,0.5)')
    : 'none';
  header.style.background = scrolled
    ? (light ? 'rgba(255,255,255,0.9)' : 'rgba(10,11,14,0.88)')
    : (light ? 'rgba(255,255,255,0.7)' : 'rgba(10,11,14,0.6)');
  // Original dark-only version (for rollback):
  //   header.style.boxShadow  = scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none';
  //   header.style.background = scrolled ? 'rgba(10,11,14,0.88)' : 'rgba(10,11,14,0.6)';
};
window.addEventListener('scroll', onHeaderScroll, { passive: true });
onHeaderScroll();

// ============================================================
//  [LIGHT THEME TOGGLE] — click handler + localStorage persistence.
//  ROLLBACK: delete this block (nothing else references it).
// ============================================================
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) {}
    onHeaderScroll(); // re-apply header bg for the new theme
  });
}
// [/LIGHT THEME TOGGLE] =======================================

// ============================================================
//  FAQ — accordion (close others when one opens)
// ============================================================
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => { if (other !== item && other.open) other.open = false; });
    }
  });
});

// ============================================================
//  Discount countdown — 24h personal timer, persists in localStorage
// ============================================================
(() => {
  const el = document.querySelector('[data-timer]');
  if (!el) return;

  const hEl = el.querySelector('[data-timer-h]');
  const mEl = el.querySelector('[data-timer-m]');
  const sEl = el.querySelector('[data-timer-s]');
  const KEY = 'discountDeadline';
  const DURATION = 24 * 60 * 60 * 1000;

  let deadline = parseInt(localStorage.getItem(KEY), 10);
  const now = Date.now();
  if (!deadline || isNaN(deadline) || deadline - now > DURATION) {
    deadline = now + DURATION;
    localStorage.setItem(KEY, String(deadline));
  }

  const pad = (n) => String(n).padStart(2, '0');

  const tick = () => {
    let diff = deadline - Date.now();
    if (diff <= 0) {
      deadline = Date.now() + DURATION;
      localStorage.setItem(KEY, String(deadline));
      diff = DURATION;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);
  };

  tick();
  setInterval(tick, 1000);
})();

// ============================================================
//  Hero video — graceful fallback if source is missing
// ============================================================
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const source = heroVideo.querySelector('source');
  heroVideo.addEventListener('error', () => { heroVideo.style.display = 'none'; }, true);
  if (source) {
    fetch(source.src, { method: 'HEAD' })
      .then((r) => {
        if (!r.ok) {
          heroVideo.removeAttribute('autoplay');
          heroVideo.style.background = `#000 url('${heroVideo.poster}') center/cover no-repeat`;
        }
      })
      .catch(() => {
        heroVideo.removeAttribute('autoplay');
        heroVideo.style.background = `#000 url('${heroVideo.poster}') center/cover no-repeat`;
      });
  }
}
