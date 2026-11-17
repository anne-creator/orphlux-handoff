/* Native scrolling drives one paired text/image stage. No scroll interception. */
(() => {
  const section = document.querySelector('#services');
  if (!section) return;
  const panel = section.querySelector('.services-grid');
  const rows = [...section.querySelectorAll('.service-row')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const roomy = matchMedia('(min-height: 700px)');
  let enabled = false;
  let frame = 0;
  let travel = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

  function render() {
    frame = 0;
    if (!enabled || document.hidden) return;
    const progress = clamp((24 - section.getBoundingClientRect().top) / travel);
    const position = Math.max(0, Math.min(2, progress * 2.6 - .3));
    const step = Math.min(1, Math.floor(position));
    const mix = smooth((position - step - .3) / .4);
    rows.forEach((row, index) => {
      const opacity = index === step ? 1 - mix : index === step + 1 ? mix : 0;
      row.style.setProperty('--genai-opacity', opacity.toFixed(4));
      row.style.setProperty('--genai-shift', `${((index - step - mix) * 12).toFixed(2)}px`);
      row.dataset.active = String(opacity >= .5);
    });
    section.dataset.genaiStep = String(mix < .5 ? step + 1 : step + 2);
  }

  function requestRender() {
    if (!frame && enabled && !document.hidden) frame = requestAnimationFrame(render);
  }

  function sync() {
    enabled = roomy.matches && !reduced.matches && !document.documentElement.classList.contains('motion-off');
    section.classList.toggle('genai-scroll', enabled);
    if (enabled) {
      travel = Math.max(560, innerHeight * 1.05);
      section.style.minHeight = `${Math.ceil(panel.offsetHeight + travel + 24)}px`;
      render();
    } else {
      section.style.removeProperty('min-height');
      delete section.dataset.genaiStep;
      rows.forEach(row => {
        row.style.removeProperty('--genai-opacity');
        row.style.removeProperty('--genai-shift');
        delete row.dataset.active;
      });
    }
  }

  addEventListener('scroll', requestRender, {passive:true});
  addEventListener('resize', sync, {passive:true});
  addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', requestRender);
  reduced.addEventListener('change', sync);
  roomy.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  document.fonts?.ready.then(sync);
  sync();
})();
