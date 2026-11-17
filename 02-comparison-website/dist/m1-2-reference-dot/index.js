import {mountDotScatter} from './scatter.js';
// A scoped Hero experiment: preserve the rest of the page and prior motion choice.
export function mountReferenceDot(panel) {
  const root=document.documentElement, hero=document.querySelector('.hero');
  const metrics=document.querySelector('.company-proof');
  const anchor=document.createComment('Original metrics position');
  metrics?.before(anchor);
  const css=document.createElement('link');css.rel='stylesheet';css.href='/m1-2-reference-dot/style.css';document.head.append(css);
  const status=document.createElement('span');status.className='m12-reference-status';status.setAttribute('role','status');
  const credit=document.createElement('a');credit.className='m12-reference-credit';credit.href='https://www.onlinewebfonts.com/fonts';
  credit.target='_blank';credit.rel='noopener';credit.textContent='字体来源';credit.title='BubbledotICG-FinePos via OnlineWebFonts';
  panel.querySelector('.m12-hero-choices').append(status,credit);
  let loading=false,active=false;
  const previousKey='orphlux-m12-reference-previous-motion';
  let previous;
  try {previous=localStorage.getItem(previousKey);} catch {}
  function loadFont() {
    if(loading)return;loading=true;status.textContent='字体加载中';
    const font=document.createElement('link');font.rel='stylesheet';
    font.href='https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos';
    const failed=()=>{root.dataset.referenceFont='failed';status.textContent='点阵字体未加载';};
    font.onerror=failed;
    font.onload=()=>document.fonts.load('400 64px "BubbledotICG-FinePos"').then(faces=>{
      if(!faces.length){failed();return;}
      root.dataset.referenceFont='ready';status.textContent='';
      window.dispatchEvent(new Event('resize'));
    }).catch(failed);
    document.head.append(font);
  }
  function motionButtons() {
    const group=panel.querySelector('[role="group"][aria-label="标题动效"], [role="group"][aria-label="动效 section"]');
    return [...(group?.querySelectorAll('button')||[])];
  }
  function sync() {
    const next=root.dataset.m12Hero==='reference-dot';
    const buttons=motionButtons(), original=buttons.find(b=>b.textContent==='原版'), tech=buttons.find(b=>b.textContent==='Tech Text');
    if(next) {
      if(!active) {
        if(!previous) {
          previous=root.dataset.m12Motion;
          try {previous=previous||localStorage.getItem('orphlux-m12-motion')||'tech-text';localStorage.setItem(previousKey,previous);} catch {}
        }
        active=true;
        if(metrics)hero.append(metrics);
        loadFont();
      }
      if(tech){tech.disabled=true;tech.title='Hero D 使用静态点阵标题';}
      if(original&&root.dataset.m12Motion!=='original')original.click();
    } else if(active) {
      active=false;
      if(metrics)anchor.after(metrics);
      if(tech){tech.disabled=false;tech.removeAttribute('title');}
      const restore=previous;previous=null;
      try {localStorage.removeItem(previousKey);} catch {}
      if(restore==='tech-text')tech?.click();
    }
  }
  // Guard clicks before motion handlers, including newly mounted controls.
  panel.addEventListener('click',event=>{
    if(root.dataset.m12Hero==='reference-dot'&&event.target.closest('button')?.textContent==='Tech Text') {
      event.preventDefault();event.stopImmediatePropagation();
    }
  },true);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-m12-hero','data-m12-motion']});
  new MutationObserver(sync).observe(panel,{childList:true,subtree:true});
  mountDotScatter(hero);
  sync();
}
