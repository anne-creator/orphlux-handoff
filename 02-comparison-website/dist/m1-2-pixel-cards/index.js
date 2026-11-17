import {attachPixelCard} from './engine.js';

export function mountDatasetPixelCards(panel) {
  if (panel.querySelector('[data-dataset-card-controls]')) return;
  const cards = [...document.querySelectorAll('#datasets .stock-card')];
  if (!cards.length) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/m1-2-pixel-cards/style.css';
  style.addEventListener('load',()=>dispatchEvent(new CustomEvent('orphlux:variantchange')));
  document.head.append(style);
  const label = document.createElement('label');
  label.dataset.datasetCardControls = '';
  label.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;gap:6px';
  const title = document.createElement('span');
  title.textContent = 'Dataset';
  const select = document.createElement('select');
  select.setAttribute('aria-label','Dataset 卡片动效');
  for (const [value,text] of [['pixel','Pixel Card'],['original','原版']]) {
    const option = document.createElement('option');
    option.value = value; option.textContent = text; select.append(option);
  }
  label.append(title,select);
  panel.insertBefore(label,panel.querySelector('.m12-current'));
  const storageKey = 'orphlux-m12-dataset-cards';
  let cleanup = [], current;
  function choose(value, write = false, refresh = false) {
    const id = value === 'original' ? 'original' : 'pixel';
    if (id !== current || refresh) {
      cleanup.forEach(stop => stop?.()); cleanup = [];
      current = id;
      document.documentElement.dataset.datasetCards = id;
      if (id === 'pixel') cleanup = cards.map(attachPixelCard);
      requestAnimationFrame(()=>dispatchEvent(new CustomEvent('orphlux:variantchange')));
    }
    select.value = id;
    if (write) {
      const url = new URL(location.href);
      url.searchParams.set('datasetCards',id);
      history.replaceState(null,'',url);
      try { localStorage.setItem(storageKey,id); } catch {}
    }
  }
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch {}
  choose(new URLSearchParams(location.search).get('datasetCards') || saved || 'pixel');
  select.addEventListener('change',()=>choose(select.value,true));
  addEventListener('popstate',()=>choose(new URLSearchParams(location.search).get('datasetCards') || 'pixel'));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>choose(current,false,true));
  let paused = document.documentElement.classList.contains('motion-off');
  new MutationObserver(()=>{
    const next = document.documentElement.classList.contains('motion-off');
    if (next !== paused) { paused = next; choose(current,false,true); }
  }).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
}
