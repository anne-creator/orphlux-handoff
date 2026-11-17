/* One shared M1.2 page with persistent design comparison choices. */
// Resolve the local presentation defaults before any asynchronous variant mounts.
// Explicit query choices (including the legacy font parameter) remain shareable.
(() => {
  const url = new URL(location.href);
  const defaults = {
    variant: 'b',
    hero: 'reference-dot',
    motion: 'original',
    footer: 'sand',
    physical: 'reference',
    genaiMotion: 'cinematic',
    research: 'stories',
    evaluation: 'loop',
  };
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    if (url.searchParams.has(key) || (key === 'variant' && url.searchParams.has('font'))) continue;
    url.searchParams.set(key, value);
    changed = true;
  }
  if (changed) history.replaceState(history.state, '', url);
})();

(async () => {
  const {variants} = await import('/m1-2-variants.js');
  const root = document.documentElement;
  const storageKey = 'orphlux-m12-variant';
  const byId = id => variants.find(v => v.id === id);
  const byFont = font => variants.find(v => v.font === font);
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch {}
  function fromURL() {
    const query = new URLSearchParams(location.search);
    return byId(query.get('variant')) || byFont(query.get('font'));
  }
  const initial = fromURL() || byId(saved) || variants[0];
  root.dataset.meetingFont = initial.font;
  root.dataset.m12Variant = initial.id;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/m1-2-comparison.css';
  document.head.append(stylesheet);
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once:true}));
  }
  if (document.getElementById('m12-comparison')) return;
  // Restore shared values first, preventing future per-version overrides leaking.
  const tokenDefaults = new Map();
  const imageDefaults = new Map();
  variants.forEach(variant => {
    Object.keys(variant.tokens || {}).forEach(key => {
      if (!tokenDefaults.has(key)) tokenDefaults.set(key, root.style.getPropertyValue(key));
    });
    (variant.images || []).forEach(change => {
      document.querySelectorAll(change.selector).forEach(image => {
        if (!imageDefaults.has(image)) imageDefaults.set(image, {
          src:image.getAttribute('src'), alt:image.getAttribute('alt'), srcset:image.getAttribute('srcset'),
        });
      });
    });
  });
  const panel = document.createElement('aside');
  panel.id = 'm12-comparison';
  panel.setAttribute('aria-label', '对比设置');
  const group = document.createElement('div');
  group.className = 'm12-choices';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', '选择字体');
  const buttons = new Map();
  variants.filter(v => !v.extra).forEach(variant => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = variant.label;
    button.title = variant.description;
    button.addEventListener('click', () => select(variant));
    buttons.set(variant.id, button);
    group.append(button);
  });
  const status = document.createElement('span');
  status.className = 'm12-current';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  panel.append(group, status);
  document.body.append(panel);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'm12-comparison-toggle';
  toggle.setAttribute('aria-controls', panel.id);
  panel.prepend(toggle);
  function setPanelOpen(open) {
    panel.classList.toggle('comparison-collapsed', !open);
    toggle.textContent = open ? '关闭 ×' : '对比';
    toggle.setAttribute('aria-label', open ? '关闭对比设置' : '打开对比设置');
    toggle.setAttribute('aria-expanded', String(open));
    try { localStorage.setItem('orphlux-m12-comparison-open', String(open)); } catch {}
  }
  let panelOpen = false;
  try { panelOpen = localStorage.getItem('orphlux-m12-comparison-open') === 'true'; } catch {}
  setPanelOpen(panelOpen);
  toggle.addEventListener('click', () => setPanelOpen(panel.classList.contains('comparison-collapsed')));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setPanelOpen(false); toggle.focus(); event.stopPropagation(); }
  });
  const {mountOverallComparison} = await import('/onda/comparison.js');
  mountOverallComparison(panel);
  const {mountHeroComparison} = await import('/m1-2-hero-video.js');
  mountHeroComparison(panel);
  const {applyButtonTheme} = await import('/m1-2-button-palette.js');
  applyButtonTheme();
  const {mountFooterLayout} = await import('/m1-2-footer-layout.js');
  mountFooterLayout(panel);
  const {mountMotionSection} = await import('/m1-2-tech-text/section.js');
  mountMotionSection(panel);
  const {mountPhysicalReference} = await import('/m1-2-physical-reference/section.js');
  mountPhysicalReference(panel);
  const {mountEvaluationVariants} = await import('/m1-2-evaluation/index.js');
  mountEvaluationVariants(panel);
  const {mountDatasetPixelCards} = await import('/m1-2-pixel-cards/index.js');
  mountDatasetPixelCards(panel);
  const {mountGenaiCinematic} = await import('/m1-2-genai-cinematic/index.js');
  mountGenaiCinematic(panel);
  const {mountResearchStories} = await import('/m1-2-research-stories/index.js');
  mountResearchStories(panel);
  function select(variant, updateURL = true) {
    root.dataset.meetingFont = variant.font;
    root.dataset.m12Variant = variant.id;
    tokenDefaults.forEach((value, key) => {
      if (value) root.style.setProperty(key, value);
      else root.style.removeProperty(key);
    });
    Object.entries(variant.tokens || {}).forEach(([key,value]) => root.style.setProperty(key,value));
    imageDefaults.forEach((attrs,image) => Object.entries(attrs).forEach(([key,value]) => {
      if (value === null) image.removeAttribute(key);
      else image.setAttribute(key,value);
    }));
    (variant.images || []).forEach(change => document.querySelectorAll(change.selector).forEach(image => {
      image.removeAttribute('srcset');
      image.setAttribute('src', change.src);
      if (change.alt !== undefined) image.setAttribute('alt', change.alt);
    }));
    buttons.forEach((button,id) => button.setAttribute('aria-pressed', String(id === variant.id)));
    status.textContent = `${variant.label} · ${variant.description}`;
    try { localStorage.setItem(storageKey, variant.id); } catch {}
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('variant', variant.id);
      url.searchParams.delete('font');
      url.searchParams.delete('typecompare');
      history.replaceState(null, '', url);
    }
    window.dispatchEvent(new CustomEvent('orphlux:variantchange', {detail:{id:variant.id,font:variant.font}}));
    document.fonts.ready.then(() => window.dispatchEvent(new Event('resize')));
  }
  select(initial, false);
  window.addEventListener('popstate', () => select(fromURL() || variants[0], false));
  new ResizeObserver(() => {
    root.style.setProperty('--m12-bar-height', `${Math.ceil(panel.getBoundingClientRect().height)}px`);
  }).observe(panel);
})().catch(error => console.error('M1.2 comparison could not load', error));
