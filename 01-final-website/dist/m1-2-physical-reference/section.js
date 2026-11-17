/* The homepage's original content is the only copy source. */
export function mountPhysicalReference(panel) {
  const section=document.querySelector('.physical-section#physical');
  if(!section || section.querySelector('.pr-content'))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='/m1-2-physical-reference/section.css';const cssReady=new Promise(resolve=>{css.onload=resolve;css.onerror=resolve;});document.head.append(css);
  const original=section.querySelector(':scope > .section-wrap');
  const originalLabel=section.getAttribute('aria-labelledby');
  const content=document.createElement('div');content.className='pr-content';content.hidden=true;
  const videoURL='https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4';
  const background=document.createElement('video');background.className='pr-background';
  background.muted=true;background.defaultMuted=true;background.loop=true;background.playsInline=true;
  background.disablePictureInPicture=true;background.preload='none';background.poster='/m1-2-physical-reference/video-poster.jpg';
  background.setAttribute('aria-hidden','true');background.tabIndex=-1;
  const source=document.createElement('source');source.src=videoURL;source.type='video/mp4';background.append(source);
  const inner=document.createElement('div');inner.className='pr-inner';
  const top=document.createElement('div');top.className='pr-top';
  const title=document.createElement('h2');title.id='physical-reference-title';
  const titleLink=original.querySelector('h2 a').cloneNode(true);titleLink.replaceChildren(document.createTextNode('Data Services for '));
  const accent=document.createElement('em');accent.textContent='Physical AI';titleLink.append(accent);title.append(titleLink);
  const intro=document.createElement('p');intro.className='pr-intro';intro.textContent=original.querySelector('.physical-copy p').textContent;
  top.append(title,intro);
  const grid=document.createElement('div');grid.className='pr-grid';
  original.querySelectorAll('.capture-method').forEach(source=>{
    const card=document.createElement('a');card.className='pr-method';card.href=source.getAttribute('href');card.dataset.contentLink='';
    const icon=source.querySelector('.method-icon').cloneNode(true);icon.className='pr-icon';
    // UMI uses the approved shared homepage icon; retain the reference Simulation.
    const symbol=icon.querySelector('svg');
    const iconId=symbol?.getAttribute('data-ui-icon');
    if(iconId==='05-simulation') {
      symbol.innerHTML='<rect x="3" y="4" width="26" height="21" rx="2"/><path d="M12 29h8M16 25v4M5 21h22M8 18h16M11 16 7 23M21 16l4 7" opacity=".55"/><path d="m16 8 5 3v6l-5 3-5-3v-6Zm-5 3 5 3 5-3M16 14v6"/>';
      symbol.dataset.referenceIcon='simulation-viewport-grid';
    }

    const h=document.createElement('h3');h.textContent=source.querySelector('h3').textContent;
    card.append(icon,h);grid.append(card);
  });
  inner.append(top,grid);content.append(background,inner);section.append(content);
  const group=document.createElement('div');group.className='m12-physical-choices';group.setAttribute('role','group');group.setAttribute('aria-label','Physical');
  group.innerHTML='<span>Physical</span>';
  const buttons=new Map();
  for(const [id,label] of [['reference','参考版'],['original','原版']]){
    const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>select(id));buttons.set(id,b);group.append(b);
  }
  panel.insertBefore(group,panel.querySelector('.m12-current'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const seen=new WeakSet(),animations=new Set();let mode='original',visible=false;
  const animate=(el,frames,options)=>{const a=el.animate(frames,options);animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));};
  function type(el,delay=0){
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    // Preserve readable words and a single accessible label per text block.
    el.setAttribute('aria-label',el.textContent);
    let n=0;
    nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{
      if(/^\s+$/.test(word)){fragment.append(document.createTextNode(word));return;}
      const wrap=document.createElement('span');wrap.className='pr-word';wrap.setAttribute('aria-hidden','true');
      [...word].forEach(char=>{const c=document.createElement('span');c.textContent=char;wrap.append(c);animate(c,[{opacity:0},{opacity:1}],{duration:100,delay:delay+n++*12,fill:'backwards'});});fragment.append(wrap);
    });node.replaceWith(fragment);});
  }
  function reveal(el){
    if(mode!=='reference'||reduced.matches||seen.has(el))return;seen.add(el);
    const isTop=el===top,index=isTop?0:[...grid.children].indexOf(el);
    animate(el,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:isTop?0:100+index*100,easing:'ease-out',fill:'backwards'});
    if(isTop){type(titleLink);type(intro,100);}else type(el.querySelector('h3'),100+index*100);
  }
  const items=[top,...grid.children];
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)reveal(e.target);}),{rootMargin:'0px 0px -100px 0px'});items.forEach(el=>observer.observe(el));
  // One viewport-anchored layer spans both sections, outside pager fades.
  const datasets=document.getElementById('datasets');
  const shared=document.createElement('div');shared.className='pr-shared-background';shared.setAttribute('aria-hidden','true');
  const originalBackground=getComputedStyle(section).background;
  shared.style.background=originalBackground;
  shared.append(background);section.before(shared);
  section.dataset.sharedBackground='';datasets.dataset.sharedBackground='';
  function positionBackground(){
    const start=section.getBoundingClientRect().top,end=datasets.getBoundingClientRect().bottom;
    visible=start<innerHeight&&end>0;
    shared.hidden=!visible;
    shared.style.clipPath=`inset(${Math.max(0,start)}px 0 ${Math.max(0,innerHeight-end)}px 0)`;
    sync();
  }
  let backgroundFrame=0;
  function scheduleBackground(){if(!backgroundFrame)backgroundFrame=requestAnimationFrame(()=>{backgroundFrame=0;positionBackground();});}
  addEventListener('scroll',scheduleBackground,{passive:true});
  addEventListener('resize',scheduleBackground);
  addEventListener('orphlux:screenchange',positionBackground);
  const backgroundResize=new ResizeObserver(scheduleBackground);backgroundResize.observe(section);backgroundResize.observe(datasets);
  function sync(){
    const active=mode==='reference'&&visible&&!document.hidden&&!reduced.matches;
    section.classList.toggle('pr-running',active);
    if(active){if(background.paused)background.play().catch(()=>{});}else background.pause();
  }
  background.addEventListener('playing',()=>{if(mode!=='reference'||!visible||document.hidden||reduced.matches)background.pause();});
  cssReady.then(positionBackground);
  document.addEventListener('visibilitychange',()=>{sync();animations.forEach(a=>document.hidden?a.pause():a.play());});
  reduced.addEventListener('change',()=>{animations.forEach(a=>a.cancel());sync();});
  function select(id,write=true){
    mode=id==='reference'?'reference':'original';section.dataset.physicalHome=mode;
    original.hidden=mode==='reference';content.hidden=mode!=='reference';
    shared.dataset.mode=mode;shared.style.background=mode==='reference'?'#000':originalBackground;
    background.hidden=mode!=='reference';positionBackground();
    section.setAttribute('aria-labelledby',mode==='reference'?title.id:originalLabel);
    if(mode==='original')animations.forEach(a=>a.cancel());
    buttons.forEach((b,key)=>b.setAttribute('aria-pressed',String(key===mode)));
    if(write){const u=new URL(location.href);u.searchParams.set('physical',mode);history.replaceState(null,'',u);try{localStorage.setItem('orphlux-m12-physical',mode);}catch{}}
    sync();items.forEach(el=>{const r=el.getBoundingClientRect();if(r.height&&r.top<innerHeight-100&&r.bottom>0)reveal(el);});
  }
  let saved;try{saved=localStorage.getItem('orphlux-m12-physical');}catch{}
  select(new URLSearchParams(location.search).get('physical')||saved,false);
  // Anne retained the current Simulation icon; retired candidates cannot override it.
  const cleanURL=new URL(location.href);
  if(cleanURL.searchParams.has('simulation')){cleanURL.searchParams.delete('simulation');history.replaceState(null,'',cleanURL);}
  try{localStorage.removeItem('orphlux-m12-simulation');}catch{}
  // Re-align the requested anchor after async styles and local fonts settle.
  let userMoved=false;const stopAlignment=()=>{userMoved=true;};
  ['wheel','touchstart','keydown'].forEach(name=>addEventListener(name,stopAlignment,{once:true,passive:true}));
  cssReady.then(()=>Promise.all([document.fonts.load('500 56px Barlow'),document.fonts.load('italic 56px \"Instrument Serif\"')])).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(!userMoved && location.hash==='#physical')section.scrollIntoView({block:'start',behavior:'instant'});
  }))).catch(()=>{});
  addEventListener('popstate',()=>select(new URLSearchParams(location.search).get('physical'),false));
}
