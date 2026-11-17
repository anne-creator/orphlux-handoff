/* Homepage metrics: one viewport-triggered, 1500ms easeOutCubic count. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const counters = [];
  const duration = 1500;
  let frame = 0;
  const disabled = () => root.classList.contains('motion-off') || root.dataset.pageMotion === 'paused';
  const paused = () => document.hidden || disabled();

  document.querySelectorAll('.company-proof dd, .stock-metric strong').forEach(element => {
    // Change only the leading text node, leaving units and markup intact.
    const node = Array.from(element.childNodes).find(child => child.nodeType === 3 && /^\s*\d/.test(child.nodeValue));
    if (!node) return;
    const match = node.nodeValue.match(/^(\s*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const target = Number(match[2].replaceAll(',', ''));
    const digits = (match[2].split('.')[1] || '').length;
    const formatter = new Intl.NumberFormat('en-US', {minimumFractionDigits: digits, maximumFractionDigits: digits});
    // Keep the accessible value stable while the visible number changes.
    element.setAttribute('aria-label', element.textContent.trim());
    const counter = {element, node, target, formatter, prefix: match[1], suffix: match[3], elapsed: 0, last: null, visible: false, done: reduced.matches || disabled()};
    counters.push(counter);
    render(counter, reduced.matches || disabled() ? target : 0);
  });

  function render(counter, value) {
    counter.node.nodeValue = counter.prefix + counter.formatter.format(value) + counter.suffix;
  }
  function finish(counter) {
    render(counter, counter.target);
    counter.done = true;
    counter.last = null;
  }
  function tick(now) {
    frame = 0;
    for (const counter of counters) {
      if (!counter.visible || counter.done) continue;
      if (counter.last !== null) counter.elapsed += now - counter.last;
      counter.last = now;
      const progress = Math.min(1, counter.elapsed / duration);
      render(counter, counter.target * (1 - Math.pow(1 - progress, 3)));
      if (progress === 1) finish(counter);
    }
    schedule();
  }
  function schedule() {
    if (!frame && !paused() && !reduced.matches && counters.some(counter => counter.visible && !counter.done)) frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    counters.forEach(counter => {
      counter.last = null;
      if (reduced.matches) finish(counter);
    });
    schedule();
  }
  if (!('IntersectionObserver' in window) || reduced.matches) {
    counters.forEach(finish);
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const counter = counters.find(item => item.element === entry.target);
      counter.visible = entry.isIntersecting;
      counter.last = null;
      if (counter.done) observer.unobserve(counter.element);
      else if (entry.isIntersecting && disabled()) finish(counter);
    });
    schedule();
  }, {threshold: 0});
  counters.forEach(counter => observer.observe(counter.element));
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(root, {attributes: true, attributeFilter: ['class', 'data-page-motion']});
})();
