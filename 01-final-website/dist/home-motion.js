// Local GSAP core + native observers. No paid services or remote dependencies.
(() => {
  const gsap = window.gsap;
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('[data-motion-toggle]');
  if (!gsap || !hero || !toggle || !window.IntersectionObserver) return;

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 720px)');
  const select = selector => [...document.querySelectorAll(selector)];
  const intro = select('.hero-copy .eyebrow, .hero h1 > span, .hero-lede, .hero-actions');
  const reveals = select('.company-proof dl > div, .section-topline, .service-intro, .service-row, .physical-copy, .capture-method, .section-heading, .stock-card, .open-data, .research-layout > div, .research-directions li, .footer-cta, .outline-wordmark, .footer-bottom');
  const seen = new WeakSet();
  const loops = [];
  const transient = new Set();
  let manualOff = root.classList.contains('motion-off');
  let suspended = false;
  const enabled = () => !manualOff && !reduced.matches;
  const pageActive = () => enabled() && !document.hidden && !suspended;

  function settle(element) {
    gsap.killTweensOf(element);
    gsap.set(element, {clearProps:'opacity,transform,willChange'});
    seen.add(element);
  }
  function reveal(element, delay = 0) {
    if (seen.has(element)) return;
    seen.add(element);
    if (!enabled()) { settle(element); return; }
    const tween = gsap.to(element, {
      opacity:1, y:0, duration:.85, delay, ease:'power2.out',
      clearProps:'opacity,transform,willChange',
      onComplete:() => transient.delete(tween)
    });
    transient.add(tween);
  }
  function sync() {
    const active = pageActive();
    root.classList.toggle('motion-off', manualOff);
    root.dataset.pageMotion = reduced.matches ? 'reduced' : manualOff ? 'paused' : 'running';
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(manualOff));
    toggle.setAttribute('aria-label', manualOff ? 'Play page animation' : 'Pause page animation');
    toggle.querySelector('.motion-label').textContent = manualOff ? 'Play motion' : 'Pause motion';
    toggle.querySelector('.motion-symbol').textContent = manualOff ? '▷' : 'Ⅱ';
    for (const item of loops) {
      item.tween.paused(!active || !item.visible);
      if (reduced.matches) item.tween.progress(0).pause();
    }
    if (!enabled()) {
      for (const tween of transient) tween.kill();
      transient.clear();
      [...intro, ...reveals].forEach(settle);
    } else {
      for (const tween of transient) tween.paused(!active);
    }
  }

  const loopObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      for (const item of loops) if (item.trigger === entry.target) item.visible = entry.isIntersecting;
    }
    sync();
  }, {threshold:0});

  function float(element, trigger, vars) {
    if (!element) return;
    const rect = trigger.getBoundingClientRect();
    const tween = gsap.to(element, {paused:true, repeat:-1, yoyo:true, ease:'sine.inOut', ...vars});
    loops.push({tween, trigger, visible:rect.bottom > 0 && rect.top < innerHeight});
    loopObserver.observe(trigger);
  }
  const revealObserver = new IntersectionObserver(entries => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target, Math.min(order++ * .09, .27));
      revealObserver.unobserve(entry.target);
    }
  }, {threshold:.08, rootMargin:'0px 0px -24px 0px'});

  try {
    float(hero.querySelector('.hero-silk'), hero, {
      xPercent:compact.matches ? 1 : 1.5, y:compact.matches ? -12 : -24,
      scale:1.035, rotation:.35, duration:5.5
    });
    // Corner reflections stay fixed; the video supplies Hero flow motion.
    select('.service-art').forEach((element, i) => float(element, element.closest('.service-row'), {
      y:-9, rotation:i === 1 ? -.4 : .4, duration:3.2 + i * .45
    }));
    select('.silver-transition img').forEach(element => float(element, element.parentElement, {
      xPercent:2, scale:1.055, duration:7
    }));

    if (enabled()) {
      // Only below-fold content is prepared; restored scroll positions stay readable.
      reveals.forEach(element => {
        element.dataset.motionReveal = '';
        if (element.getBoundingClientRect().top < innerHeight * .9) { seen.add(element); return; }
        gsap.set(element, {opacity:0, y:compact.matches ? 22 : 32});
        revealObserver.observe(element);
      });
      if (scrollY < 60) {
        const entrance = gsap.fromTo(intro, {opacity:0, y:22}, {
          opacity:1, y:0, duration:.85, stagger:.12, ease:'power2.out',
          clearProps:'opacity,transform', onComplete:() => transient.delete(entrance)
        });
        transient.add(entrance);
      }
    } else reveals.forEach(element => seen.add(element));

    // Keyboard navigation never lands on a visually hidden reveal target.
    document.addEventListener('focusin', event => {
      const element = event.target.closest('[data-motion-reveal]');
      if (element) { settle(element); revealObserver.unobserve(element); }
    });
    toggle.addEventListener('click', () => {
      manualOff = !manualOff;
      try {localStorage.setItem('orphlux-motion', manualOff ? 'off' : 'on');} catch {}
      sync();
    });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    window.addEventListener('pagehide', () => {suspended = true; sync();});
    window.addEventListener('pageshow', () => {suspended = false; sync();});
    sync();
  } catch (error) {
    loopObserver.disconnect(); revealObserver.disconnect();
    loops.forEach(item => item.tween.kill());
    transient.forEach(tween => tween.kill());
    [...intro, ...reveals].forEach(settle);
    toggle.hidden = true;
    console.warn('Page motion unavailable; showing static content.', error);
  }
})();
