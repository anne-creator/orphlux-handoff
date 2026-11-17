import { mountSmokeFooter } from './m1-2-footer-smoke/smoke.js';
export function mountFooterLayout(panel) {
  const root=document.documentElement;
  const footer=document.querySelector('#contact');
  const inner=footer?.querySelector('.footer-inner');
  const bottom=footer?.querySelector('.footer-bottom');
  if(!inner || !bottom) return;
  const syncSmoke=mountSmokeFooter(footer);
  const wordmark=document.createElement('span');wordmark.className='m12-footer-wordmark';wordmark.textContent='ORPHLUX';
  footer.querySelector('.footer-endcap').prepend(wordmark);
  const css=document.createElement('link');
  css.rel='stylesheet';css.href='/m1-2-footer-layout.css';document.head.append(css);
  const group=document.createElement('div');group.className='m12-footer-choices';
  group.setAttribute('role','group');group.setAttribute('aria-label','Footer');
  const label=document.createElement('span');label.textContent='Footer';group.append(label);
  const buttons=new Map();
  for(const [id,text] of [['sand','流沙'],['smoke','烟雾'],['original','原版'],['compact','紧凑'],['composed','紧凑 2']]) {
    const button=document.createElement('button');button.type='button';button.textContent=text;
    button.addEventListener('click',()=>select(id));buttons.set(id,button);group.append(button);
  }
  panel.insertBefore(group,panel.querySelector('.m12-current'));
  function select(id,updateURL=true) {
    id=['compact','composed','smoke','sand'].includes(id)?id:'original';
    root.dataset.m12Footer=id;
    syncSmoke();
    // Keep keyboard order consistent with the visual order.
    (id==='compact'?footer:inner).append(bottom);
    buttons.forEach((button,key)=>button.setAttribute('aria-pressed',String(key===id)));
    try {localStorage.setItem('orphlux-m12-footer',id);} catch {}
    if(updateURL) {const url=new URL(location.href);url.searchParams.set('footer',id);history.replaceState(null,'',url);}
  }
  let saved='smoke';try {saved=localStorage.getItem('orphlux-m12-footer')||saved;} catch {}
  const fromURL=()=>new URLSearchParams(location.search).get('footer');
  select(fromURL()||saved,false);
  window.addEventListener('popstate',()=>select(fromURL()||'smoke',false));
}
