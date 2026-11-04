(function(){
  "use strict";

  // ---------- Mobile nav toggle ----------
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function(){
      var isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Header hide on scroll down / show on scroll up ----------
  var header = document.getElementById('siteHeader');
  var lastY = window.scrollY;
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (!ticking) {
      window.requestAnimationFrame(function(){
        var y = window.scrollY;
        if (y > lastY && y > 120) {
          header.classList.add('is-hidden');
        } else {
          header.classList.remove('is-hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  });

  // ---------- Scroll reveal ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('is-visible'); });
  }

  // ---------- Active nav link on scroll ----------
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var id = entry.target.getAttribute('id');
        var link = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(function(a){ a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(function(s){ navIO.observe(s); });
  }
/* ============================================================
   HERO HEADLINE MOTION
   - "moves": soft idle glow, small upward shift on first scroll
   - "people": magnetic pull anywhere in the hero, capped + spring-back
   - glow intensity on "moves" scales with how fast the cursor is
     moving (not just proximity to "people")
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroEl = document.getElementById('top');
  const movesEl = document.querySelector('.hero h1 .word-moves');
  const peopleEl = document.querySelector('.hero h1 .word-people');

  if (reduceMotion || !heroEl || !movesEl || !peopleEl || !window.gsap || !window.ScrollTrigger) {
    return; // static glow from CSS still applies
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({
    scrollTrigger: {
      trigger: heroEl,
      start: 'top top-=8',
      toggleActions: 'play none none reverse'
    }
  }).to(movesEl, {
    y: -52,
    duration: 1.2,
    ease: 'power3.out'
  });

  const MAX_PULL = 13;
  const MIN_PULL_FLOOR = 3;

  let fieldRadius = Math.hypot(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => {
    fieldRadius = Math.hypot(window.innerWidth, window.innerHeight);
  });

  const xTo = gsap.quickTo(peopleEl, 'x', { duration: 0.7, ease: 'power3.out' });
  const yTo = gsap.quickTo(peopleEl, 'y', { duration: 0.7, ease: 'power3.out' });

  const GLOW = {
    a1: [0.34, 0.66], b1: [14, 22],
    a2: [0.14, 0.34], b2: [34, 50]
  };
  function paintGlow(t) {
    const a1 = gsap.utils.interpolate(GLOW.a1[0], GLOW.a1[1], t);
    const b1 = gsap.utils.interpolate(GLOW.b1[0], GLOW.b1[1], t);
    const a2 = gsap.utils.interpolate(GLOW.a2[0], GLOW.a2[1], t);
    const b2 = gsap.utils.interpolate(GLOW.b2[0], GLOW.b2[1], t);
    movesEl.style.textShadow =
      `0 0 ${b1}px rgba(255,90,54,${a1}), 0 0 ${b2}px rgba(255,90,54,${a2})`;
  }
  const glowProxy = { t: 0 };
  const glowTo = gsap.quickTo(glowProxy, 't', {
    duration: 0.6,
    ease: 'power3.out',
    onUpdate: () => paintGlow(glowProxy.t)
  });

  let active = false;
  let idleTimer = null;
  let lastX = null, lastY = null, lastT = performance.now();
  const MAX_SPEED = 1800;

  paintGlow(0);

  heroEl.addEventListener('mousemove', (e) => {
    const rect = peopleEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    active = true;

    const strength = Math.max(0, 1 - dist / fieldRadius);
    const pull = MIN_PULL_FLOOR + strength * (MAX_PULL - MIN_PULL_FLOOR);
    const angle = Math.atan2(dy, dx);
    xTo(Math.cos(angle) * pull);
    yTo(Math.sin(angle) * pull);

    const now = performance.now();
    let velocityStrength = 0;
    if (lastX !== null) {
      const dt = Math.max(now - lastT, 1);
      const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt * 1000;
      velocityStrength = gsap.utils.clamp(0, 1, speed / MAX_SPEED);
    }
    lastX = e.clientX; lastY = e.clientY; lastT = now;

    const glowStrength = gsap.utils.clamp(0, 1, strength * 0.35 + velocityStrength * 0.85);
    glowTo(glowStrength);

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => glowTo(strength * 0.35), 140);
  });

  heroEl.addEventListener('mouseleave', () => {
    if (active) {
      active = false;
      lastX = null; lastY = null;
      clearTimeout(idleTimer);
      gsap.to(peopleEl, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.45)'
      });
      glowTo(0);
    }
  });
})();
})();
(function () {
  const filterBar = document.getElementById('contentFilters');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.format-chip');
    if (!btn) return;

    filterBar.querySelectorAll('.format-chip').forEach((c) => c.classList.remove('is-active'));
    btn.classList.add('is-active');
    const format = btn.dataset.format;

    document.querySelectorAll('.brand-shelf').forEach((shelf) => {
      let visibleCount = 0;
      shelf.querySelectorAll('.content-tile').forEach((tile) => {
        const match = format === 'all' || tile.dataset.format === format;
        tile.classList.toggle('is-hidden', !match);
        if (match) visibleCount++;
      });
      shelf.classList.toggle('is-empty', visibleCount === 0);
    });
  });
})();
(function(){
  const lightbox   = document.getElementById('contentLightbox');
  const lightboxImg= document.getElementById('lightboxImg');
  const closeBtn   = document.getElementById('lightboxClose');
  const prevBtn    = document.getElementById('lightboxPrev');
  const nextBtn    = document.getElementById('lightboxNext');
  const dotsWrap   = document.getElementById('lightboxDots');

  let images = [];
  let index  = 0;

  function renderSlide(){
    lightboxImg.src = images[index];
    dotsWrap.innerHTML = '';
    if(images.length > 1){
      images.forEach((_, i) => {
        const dot = document.createElement('span');
        if(i === index) dot.classList.add('is-active');
        dotsWrap.appendChild(dot);
      });
    }
    const multi = images.length > 1;
    prevBtn.classList.toggle('is-hidden', !multi);
    nextBtn.classList.toggle('is-hidden', !multi);
  }

  function openLightbox(tile){
    const carouselData = tile.getAttribute('data-carousel');
    if(carouselData){
      images = JSON.parse(carouselData);
    } else {
      const img = tile.querySelector('.phone-frame img');
      images = img ? [img.getAttribute('src')] : [];
    }
    index = 0;
    renderSlide();
    lightbox.classList.add('is-open');
  }

  function closeLightbox(){
    lightbox.classList.remove('is-open');
  }

  function showNext(){ index = (index + 1) % images.length; renderSlide(); }
  function showPrev(){ index = (index - 1 + images.length) % images.length; renderSlide(); }

  document.querySelectorAll('.content-tile').forEach(tile => {
    tile.addEventListener('click', () => openLightbox(tile));
  });

  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);
  lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if(!lightbox.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') showNext();
    if(e.key === 'ArrowLeft') showPrev();
  });

  // swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if(Math.abs(dx) > 40){ dx < 0 ? showNext() : showPrev(); }
  });
})();