/* ══════════════════════════════════════
   CRYSTAL PEAK CHOPTA — script.js
   ══════════════════════════════════════ */

/* ─────────────────────────────────────
   1. NAV — scroll effect + hamburger
───────────────────────────────────── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

function closeMobile() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────
   2. HERO SLIDESHOW
   Exact timing per slide:
   ┌──────────────────────────────────────┐
   │  0s – 2.5s : visible, zoom OUT       │
   │              scale(1.12) → scale(1.0)│
   │              (CSS transition 2.5s)   │
   │                                      │
   │  2.5s      : .leaving applied        │
   │              fade 1→0 AND            │
   │              zoom continues 1.0→0.94 │
   │              both over 0.5s          │
   │                                      │
   │  3.0s      : next slide takes over   │
   │              repeat forever          │
   └──────────────────────────────────────┘
───────────────────────────────────── */
(function initSlideshow() {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;

  const TOTAL    = slides.length;
  const ZOOM_MS  = 2500;   // how long each slide zooms out before fade starts
  const FADE_MS  = 500;    // fade + continued zoom duration
  const BUFFER   = 30;     // small buffer so cleanup happens after CSS finishes

  let current   = 0;
  let zoomTimer = null;
  let nextTimer = null;

  /* ── Reset slide: invisible, zoomed in, zero transition ── */
  function resetSlide(el) {
    el.style.transition = 'none';
    el.style.opacity    = '0';
    el.style.transform  = 'scale(1.12)';
    el.style.zIndex     = '0';
    el.classList.remove('active', 'leaving');
  }

  /* ── Activate slide: clear inline styles so CSS .active rules apply ── */
  function activateSlide(el) {
    void el.offsetWidth;          // force reflow — critical for transition to fire
    el.style.transition = '';
    el.style.opacity    = '';
    el.style.transform  = '';
    el.style.zIndex     = '';
    el.classList.add('active');
  }

  /* ── Begin leaving: fade + zoom-out-continue (CSS .leaving handles it) ── */
  function leaveSlide(el) {
    el.classList.remove('active');
    el.classList.add('leaving');
    el.style.zIndex = '2';        // sit above incoming slide while fading
  }

  /* ── Run one full cycle for current slide ── */
  function runCycle() {
    clearTimeout(zoomTimer);
    clearTimeout(nextTimer);

    // After ZOOM_MS: trigger fade on current, activate next underneath
    zoomTimer = setTimeout(() => {
      const prevIndex = current;
      const nextIndex = (current + 1) % TOTAL;

      // 1. Start fading current slide out
      leaveSlide(slides[prevIndex]);
      dots[prevIndex].classList.remove('active');

      // 2. Reset next slide (instant, no transition)
      resetSlide(slides[nextIndex]);

      // 3. Two rAFs ensure the reset paints before we add .active
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          activateSlide(slides[nextIndex]);
          dots[nextIndex].classList.add('active');
          current = nextIndex;
        });
      });

      // 4. After fade finishes, clean up old slide and loop
      nextTimer = setTimeout(() => {
        slides[prevIndex].classList.remove('leaving');
        slides[prevIndex].style.zIndex = '0';
        runCycle();
      }, FADE_MS + BUFFER);

    }, ZOOM_MS);
  }

  /* ── Dot click: jump to chosen slide ── */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === current) return;

      clearTimeout(zoomTimer);
      clearTimeout(nextTimer);

      const prevIndex = current;

      leaveSlide(slides[prevIndex]);
      dots[prevIndex].classList.remove('active');

      resetSlide(slides[i]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          activateSlide(slides[i]);
          dots[i].classList.add('active');
          current = i;
        });
      });

      setTimeout(() => {
        slides[prevIndex].classList.remove('leaving');
        slides[prevIndex].style.zIndex = '0';
        runCycle();
      }, FADE_MS + BUFFER);
    });
  });

  /* ── Init: activate first slide, start cycle ── */
  slides.forEach((s, i) => i === 0 ? activateSlide(s) : resetSlide(s));
  dots[0] && dots[0].classList.add('active');
  runCycle();

})();


/* ─────────────────────────────────────
   3. SCROLL REVEAL
   Generic .reveal + directional cards
───────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-up'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), (i % 4) * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────
   4. BOOKING FORM — date logic
───────────────────────────────────── */
const checkinInput  = document.getElementById('bk-checkin');
const checkoutInput = document.getElementById('bk-checkout');

if (checkinInput && checkoutInput) {
  const today = new Date().toISOString().split('T')[0];
  checkinInput.min  = today;
  checkoutInput.min = today;

  checkinInput.addEventListener('change', () => {
    checkoutInput.min = checkinInput.value;
    if (checkoutInput.value && checkoutInput.value < checkinInput.value) {
      checkoutInput.value = '';
    }
  });
}


/* ─────────────────────────────────────
   5. WHATSAPP — booking form
───────────────────────────────────── */
function bookOnWhatsApp() {
  const name     = (document.getElementById('bk-name').value.trim())    || 'Guest';
  const phone    = (document.getElementById('bk-phone').value.trim())   || 'Not provided';
  const checkin  =  document.getElementById('bk-checkin').value         || 'TBD';
  const checkout =  document.getElementById('bk-checkout').value        || 'TBD';
  const guests   =  document.getElementById('bk-guests').value;
  const pkg      =  document.getElementById('bk-pkg').value;

  const msg = [
    "Hi Crystal Peak Chopta! I'd like to make a booking:",
    "",
    "\uD83D\uDC64 Name      : " + name,
    "\uD83D\uDCDE Phone     : " + phone,
    "\uD83D\uDCC5 Check-in  : " + checkin,
    "\uD83D\uDCC5 Check-out : " + checkout,
    "\uD83D\uDC65 Guests    : " + guests,
    "\u26FA Package   : " + pkg,
    "",
    "Please confirm availability. Thank you!"
  ].join('\n');

  window.open('https://wa.me/918979619292?text=' + encodeURIComponent(msg), '_blank', 'noopener');
}


/* ─────────────────────────────────────
   6. WHATSAPP — quick package enquiry
───────────────────────────────────── */
function openWhatsApp(packageName) {
  const msg = "Hi! I'm interested in the *" + packageName + "* package at Crystal Peak Chopta. Could you share availability and details? Thank you!";
  window.open('https://wa.me/918979619292?text=' + encodeURIComponent(msg), '_blank', 'noopener');
}


/* ─────────────────────────────────────
   7. SMOOTH ANCHOR SCROLL
───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navH = (navbar ? navbar.offsetHeight : 70) + 16;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ─────────────────────────────────────
   8. GALLERY — keyboard a11y
───────────────────────────────────── */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.setAttribute('tabindex', '0');
  const caption = item.querySelector('.gallery-caption');
  if (caption) item.setAttribute('aria-label', caption.textContent);
});