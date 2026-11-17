/* Final delivery: same M1.2 default visuals, no comparison UI in the document. */
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
    datasetCards: 'pixel',
  };
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    if (url.searchParams.get(key) === value) continue;
    url.searchParams.set(key, value);
    changed = true;
  }
  url.searchParams.delete('font');
  history.replaceState(history.state, '', url);
  window.addEventListener('popstate', () => {
    const current = new URL(location.href);
    for (const [key,value] of Object.entries(defaults)) current.searchParams.set(key,value);
    current.searchParams.delete('font');
    history.replaceState(history.state, '', current);
  });
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
  // Legacy modules receive an unattached control container. Their existing default
  // layouts, animation logic and media stay identical to the comparison version.
  const panel = document.createElement('aside');
  const buttons = new Map();
  const status = document.createElement('span');
  status.className = 'm12-current';
  panel.append(status);
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
  root.style.setProperty('--m12-bar-height', '0px');
  root.dataset.deliveryReady = 'true';
})().catch(error => console.error('OrphLux final page could not load', error));
