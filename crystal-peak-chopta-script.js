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

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────
   2. HERO SLIDESHOW
   Smooth zoom-out + crossfade between 4 images
   Each slide stays for 5 s, transition = 1.4 s
───────────────────────────────────── */
(function initSlideshow() {
  const slides   = document.querySelectorAll('.slide');
  const dots     = document.querySelectorAll('.dot');
  let current    = 0;
  let timer      = null;

  function goTo(index) {
    // Mark current slide as "leaving" (fades out + slight extra zoom-out)
    slides[current].classList.remove('active');
    slides[current].classList.add('leaving');
    dots[current].classList.remove('active');

    // After the transition ends, clean up the leaving class
    const leaving = slides[current];
    leaving.addEventListener('transitionend', function cleanup(e) {
      if (e.propertyName === 'opacity') {
        leaving.classList.remove('leaving');
        leaving.removeEventListener('transitionend', cleanup);
      }
    });

    current = index;

    // New slide: reset to zoomed-in, then trigger active state next frame
    slides[current].style.transition = 'none';
    slides[current].style.transform  = 'scale(1.12)';
    slides[current].style.opacity    = '0';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slides[current].style.transition = '';  // restore CSS transition
        slides[current].classList.add('active');
        dots[current].classList.add('active');
      });
    });
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5500);
  }

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === current) return;
      goTo(i);
      startTimer();           // reset interval on manual nav
    });
  });

  // Pause on hover (UX nicety)
  const hero = document.getElementById('hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', startTimer);

  startTimer();
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
      // Stagger siblings slightly
      const delay = (i % 4) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
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
   5. WHATSAPP — booking form submit
───────────────────────────────────── */
function bookOnWhatsApp() {
  const name     = (document.getElementById('bk-name').value.trim())    || 'Guest';
  const phone    = (document.getElementById('bk-phone').value.trim())   || 'Not provided';
  const checkin  =  document.getElementById('bk-checkin').value         || 'TBD';
  const checkout =  document.getElementById('bk-checkout').value        || 'TBD';
  const guests   =  document.getElementById('bk-guests').value;
  const pkg      =  document.getElementById('bk-pkg').value;

  const lines = [
    'Hi Crystal Peak Chopta! I\'d like to make a booking. Details below:',
    '',
    `\uD83D\uDC64 Name      : ${name}`,
    `\uD83D\uDCDE Phone     : ${phone}`,
    `\uD83D\uDCC5 Check-in  : ${checkin}`,
    `\uD83D\uDCC5 Check-out : ${checkout}`,
    `\uD83D\uDC65 Guests    : ${guests}`,
    `\u26FA Package   : ${pkg}`,
    '',
    'Please confirm availability. Thank you!',
  ];

  window.open(
    `https://wa.me/918979619292?text=${encodeURIComponent(lines.join('\n'))}`,
    '_blank', 'noopener'
  );
}

/* ─────────────────────────────────────
   6. WHATSAPP — quick package enquiry
───────────────────────────────────── */
function openWhatsApp(packageName) {
  const msg =
    `Hi! I'm interested in the *${packageName}* package at Crystal Peak Chopta. ` +
    `Could you share availability and details? Thank you!`;
  window.open(
    `https://wa.me/918979619292?text=${encodeURIComponent(msg)}`,
    '_blank', 'noopener'
  );
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