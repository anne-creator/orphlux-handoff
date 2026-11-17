// Six real-world samples become annotated, verified records along the silver flow.
// The illustration remains complete without JavaScript; text never moves.
(() => {
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('[data-motion-toggle]');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const samples = [...document.querySelectorAll('.moving-sample')].map(element => {
    const path = document.getElementById(element.dataset.route);
    if (!path) return null;
    return {element, path, length: path.getTotalLength(), phase: Number(element.dataset.phase),
      raw: element.querySelector('.sample-raw'), annotation: element.querySelector('.sample-annotation'),
      record: element.querySelector('.sample-record')};
  }).filter(Boolean);
  if (!hero || !toggle || !samples.length) return;
  let manualOff = document.documentElement.classList.contains('motion-off');
  let visible = true, frame = 0, last = 0, elapsed = 0;
  const enabled = () => !manualOff && !media.matches && visible && !document.hidden;
  const blend = (value, start, end) => {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  const paint = time => {
    // Batch geometry reads before attribute writes; only six elements are moving.
    const positions = samples.map(sample => {
      const progress = (time / 24000 + sample.phase) % 1;
      return {sample, progress, point:sample.path.getPointAtLength(progress * sample.length)};
    });
    positions.forEach(({sample, progress, point}) => {
      const annotated = blend(progress, .30, .42);
      const resolved = blend(progress, .58, .70);
      sample.element.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
      sample.element.setAttribute('opacity', String(Math.min(blend(progress, 0, .08), 1 - blend(progress, .87, 1)) * .72));
      sample.raw?.setAttribute('opacity', String(1 - resolved));
      sample.annotation?.setAttribute('opacity', String(annotated * (1 - resolved)));
      sample.record?.setAttribute('opacity', String(resolved));
    });
  };
  const tick = now => {
    if (!enabled()) {frame = 0; last = 0; return;}
    if (last && now - last < 32) {frame = requestAnimationFrame(tick); return;}
    if (last) elapsed += Math.min(now - last, 80);
    last = now; paint(elapsed); frame = requestAnimationFrame(tick);
  };
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    toggle.hidden = media.matches;
    toggle.setAttribute('aria-pressed', String(manualOff));
    toggle.setAttribute('aria-label', manualOff ? 'Play background animation' : 'Pause background animation');
    toggle.querySelector('.motion-label').textContent = manualOff ? 'Play motion' : 'Pause motion';
    toggle.querySelector('.motion-play-icon')?.toggleAttribute('hidden', !manualOff);
    toggle.querySelector('.motion-pause-icon')?.toggleAttribute('hidden', manualOff);
    if (media.matches) samples.forEach(sample => sample.element.setAttribute('opacity', '0'));
    else paint(elapsed);
    if (enabled()) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', () => {
    manualOff = !manualOff;
    document.documentElement.classList.toggle('motion-off', manualOff);
    try {localStorage.setItem('orphlux-motion', manualOff ? 'off' : 'on');} catch {}
    sync();
  });
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}, {threshold:0}).observe(hero);
  document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', sync);
  sync();
})();
