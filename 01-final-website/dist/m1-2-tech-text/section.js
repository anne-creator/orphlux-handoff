import {mountTechText} from './tech-text.js';

export function mountMotionSection(panel) {
  const title = document.getElementById('hero-title');
  if (!title || title.querySelector('.hero-tech-text')) return;
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = '/m1-2-tech-text/section.css';
  document.head.append(sheet);
  // Keep the original semantic heading and use its live line breaks for Canvas.
  const layer = document.createElement('div');
  layer.className = 'hero-tech-text';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<canvas></canvas>';
  title.append(layer);
  const label = document.createElement('span');
  label.textContent = '标题动效';
  const choices = document.createElement('div');
  choices.className = 'm12-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '标题动效');
  const buttons = new Map();
  for (const [value, name] of [['original', '原版'], ['tech-text', 'Tech Text']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.addEventListener('click', () => select(value));
    buttons.set(value, button);
    choices.append(button);
  }
  panel.append(label, choices);
  const key = 'orphlux-m12-motion';
  const valid = value => ['original', 'tech-text'].includes(value);
  let saved, selected, dispose, pending;
  try { saved = localStorage.getItem(key); } catch {}
  function render() {
    dispose?.();
    dispose = undefined;
    title.classList.remove('has-tech-text');
    if (selected !== 'tech-text') return;
    const style = getComputedStyle(title);
    const titleBox = title.getBoundingClientRect();
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const ascent = probe.measureText('Hg').fontBoundingBoxAscent || parseFloat(style.fontSize) * .8;
    const nativeLayout = [];
    for (const span of title.querySelectorAll(':scope > span')) {
      const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        for (let i = 0; i < node.length; i++) {
          if (!node.data[i].trim()) continue;
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getBoundingClientRect();
          nativeLayout.push({char: node.data[i], x: rect.left - titleBox.left + 40,
            baseline: rect.top - titleBox.top + 40 + ascent});
        }
      }
    }
    dispose = mountTechText(layer, {
      text: [...title.querySelectorAll(':scope > span')].map(e => e.textContent).join(' '),
      fontFamily: style.fontFamily, fontSize: parseFloat(style.fontSize),
      fontWeight: Number(style.fontWeight), letterSpacing: parseFloat(style.letterSpacing) / parseFloat(style.fontSize) || 0,
      nativeLayout, reveal: 'letter', dashLength: 4, dashGap: 2, specks: 15,
      intro: 'none', introDuration: 2, clickKick: true, guides: false,
    });
    title.classList.add('has-tech-text');
  }
  function schedule() {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(render);
  }
  function select(value, updateURL = true) {
    selected = value;
    document.documentElement.dataset.m12Motion = value;
    render();
    buttons.forEach((button, id) => button.setAttribute('aria-pressed', String(id === value)));
    try { localStorage.setItem(key, value); } catch {}
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('motion', value);
      history.replaceState(null, '', url);
    }
  }
  const fromURL = () => new URLSearchParams(location.search).get('motion');
  select(valid(fromURL()) ? fromURL() : valid(saved) ? saved : 'tech-text', false);
  new ResizeObserver(schedule).observe(title);
  window.addEventListener('resize', schedule);
  window.addEventListener('orphlux:variantchange', schedule);
  document.fonts.ready.then(schedule);
  window.addEventListener('popstate', () => select(valid(fromURL()) ? fromURL() : 'tech-text', false));
  if (location.hash === '#motion-tech-text') {
    history.replaceState(null, '', location.href.replace('#motion-tech-text', '#hero-title'));
    title.scrollIntoView({block: 'center'});
  }
}
