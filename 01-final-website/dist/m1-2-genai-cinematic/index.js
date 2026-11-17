/* Local cinematic GenAI study, driven by the existing pager, not a second wheel handler. */
export function mountGenaiCinematic(panel) {
  if (panel.querySelector('[data-genai-motion-controls]')) return;
  const root=document.documentElement, section=document.getElementById('services');
  const rows=[...section.querySelectorAll('.service-row')];
  const title=section.querySelector('#services-title a');
  const sheet=document.createElement('link'); sheet.rel='stylesheet'; sheet.href='/m1-2-genai-cinematic/style.css'; document.head.append(sheet);
  const label=document.createElement('label'); label.dataset.genaiMotionControls='';
  label.style.cssText='grid-column:1/-1;display:flex;align-items:center;gap:6px';
  const name=document.createElement('span'); name.textContent='GenAI';
  const select=document.createElement('select'); select.setAttribute('aria-label','GenAI 动效');
  for(const [value,text] of [['cinematic','玻璃叙事'],['original','原版']]) {const option=document.createElement('option'); option.value=value;option.textContent=text;select.append(option);}
  label.append(name,select);panel.insertBefore(label,panel.querySelector('.m12-current'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let selected,dispose;
  function install() {
    const background=document.createElement('div');background.className='gc-background';background.setAttribute('aria-hidden','true');
    const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';video.tabIndex=-1;
    background.append(video);section.prepend(background);
    const progress=document.createElement('div');progress.className='gc-progress';progress.setAttribute('aria-hidden','true');
    const count=document.createElement('span');const track=document.createElement('span');track.className='gc-progress-track';
    const fill=document.createElement('span');fill.className='gc-progress-fill';track.append(fill);progress.append(count,track);section.querySelector('.service-intro').append(progress);
    const restores=[],effects=new Set();let lastKey='',visible=false,alive=true;
    const quiet=()=>reduced.matches||root.classList.contains('motion-off')||root.dataset.pageMotion==='paused';
    function split(node) {
      const html=node.innerHTML,aria=node.getAttribute('aria-label'),text=node.textContent;
      restores.push(()=>{node.innerHTML=html;if(aria===null)node.removeAttribute('aria-label');else node.setAttribute('aria-label',aria)});
      node.setAttribute('aria-label',text);node.replaceChildren();
      text.split(/(\s+)/).forEach(part=>{
        if(/^\s+$/.test(part)){node.append(document.createTextNode(part));return;}
        const word=document.createElement('span');word.className='gc-word';word.setAttribute('aria-hidden','true');
        for(const character of part){const letter=document.createElement('span');letter.className='gc-letter';letter.textContent=character;word.append(letter)}node.append(word);
      });
    }
    rows.forEach((row,i)=>{
      const hadId=row.id;if(!row.id)row.id=`genai-service-${i+1}`;restores.push(()=>{if(!hadId)row.removeAttribute('id');delete row.dataset.gcActive});
      const number=document.createElement('span');number.className='gc-index';number.textContent=String(i+1).padStart(2,'0');number.setAttribute('aria-hidden','true');row.prepend(number);restores.push(()=>number.remove());
      split(row.querySelector('h3'));split(row.querySelector('p'));
      const image=row.querySelector('.service-art');const frame=document.createElement('div');frame.className='gc-art-frame';image.before(frame);frame.append(image);restores.push(()=>{frame.before(image);frame.remove()});
    });
    const rail=section.querySelector('.service-rows');
    const positionCard=(smooth=false)=>{
      const step=Number(section.dataset.pagingStep)||0;
      const offset=rows[step].getBoundingClientRect().left-rail.getBoundingClientRect().left+rail.scrollLeft;
      rail.scrollTo({left:offset,behavior:smooth&&!quiet()?'smooth':'instant'});
    };
    const railResize=new ResizeObserver(()=>positionCard());railResize.observe(rail);restores.push(()=>railResize.disconnect());
    function animate(node,keyframes,options={}) {
      if(quiet())return;
      const effect=node.animate(keyframes,{duration:650,easing:'cubic-bezier(.2,.7,.15,1)',...options});effects.add(effect);
      effect.finished.catch(()=>{}).finally(()=>effects.delete(effect));return effect;
    }
    function stop(){effects.forEach(effect=>effect.cancel());effects.clear();}
    function playVideo(){
      if(!alive)return;
      // Reuse the selected Hero's existing media as atmosphere. Never mutate the Hero itself.
      const source=document.querySelector('.hero .m12-original-video video');
      const src=source?.getAttribute('src')||'/m1-2-hero-video/hero-flow-v2.mp4';
      const poster=source?.getAttribute('poster')||'/m1-2-hero-video/poster-v2.jpg';
      if(video.getAttribute('poster')!==poster)video.poster=poster;
      if(visible&&!document.hidden&&!quiet()){
        if(video.getAttribute('src')!==src){video.src=src;video.load();}
        video.playbackRate=source?.playbackRate||.5;video.play().catch(()=>{});
      }else video.pause();
    }
    function reveal(row,direction=1){
      [...row.querySelectorAll('h3 .gc-word')].forEach((word,i)=>animate(word,[{opacity:.4,transform:`translateY(${direction*18}px)`},{opacity:1,transform:'translateY(0)'}],{delay:i*55,duration:550,fill:'backwards'}));
      const letters=[...row.querySelectorAll('p .gc-letter')];
      letters.forEach((letter,i)=>animate(letter,[{opacity:.3},{opacity:1}],{duration:50,delay:100+(i/letters.length)*1500,fill:'backwards'}));
      animate(row.querySelector('.gc-art-frame'),[{transform:'translateY(16px)'},{transform:'translateY(0)'}],{duration:800});
    }
    function screenChange(){
      if(root.dataset.paging!=='screens'){rows.forEach(r=>r.dataset.gcActive='true');playVideo();return;}
      const key=root.dataset.pagingScreen||'';if(key===lastKey){playVideo();return;}
      const previous=lastKey;lastKey=key;stop();
      if(!key.startsWith('services-')){playVideo();return;}
      const step=Number(section.dataset.pagingStep)||0;const before=Number(previous.split('-')[1])-1;
      rows.forEach((row,i)=>row.dataset.gcActive=String(i===step));count.textContent=`${String(step+1).padStart(2,'0')} / 03`;fill.style.transform=`scaleX(${step+1})`;
      positionCard(previous.startsWith('services-'));
      if(!previous.startsWith('services-')){
        animate(title,[{opacity:.3,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:800});
        rows.forEach((row,i)=>animate(row.querySelector('.gc-art-frame'),[{opacity:.2,transform:'translateY(35px)'},{opacity:i===step?1:.72,transform:'translateY(0)'}],{duration:800,delay:i*90}));
      }
      reveal(rows[step],step>=before?1:-1);playVideo();
    }
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playVideo()},{threshold:.08});observer.observe(section);
    const seen=new WeakSet();const naturalObserver=new IntersectionObserver(entries=>{if(root.dataset.paging!=='natural')return;for(const entry of entries)if(entry.isIntersecting&&!seen.has(entry.target)){seen.add(entry.target);reveal(entry.target)}},{threshold:.3});rows.forEach(row=>naturalObserver.observe(row));
    const onMotion=()=>{if(quiet())stop();playVideo()};
    const modeObserver=new MutationObserver(()=>{onMotion();screenChange()});modeObserver.observe(root,{attributes:true,attributeFilter:['class','data-page-motion','data-paging','data-m12-hero']});
    addEventListener('orphlux:screenchange',screenChange);document.addEventListener('visibilitychange',playVideo);reduced.addEventListener('change',onMotion);requestAnimationFrame(screenChange);
    return()=>{alive=false;stop();video.pause();background.remove();progress.remove();observer.disconnect();naturalObserver.disconnect();modeObserver.disconnect();removeEventListener('orphlux:screenchange',screenChange);document.removeEventListener('visibilitychange',playVideo);reduced.removeEventListener('change',onMotion);restores.reverse().forEach(restore=>restore());};
  }
  function choose(value,write=false){
    const id=value==='cinematic'?'cinematic':'original';
    if(selected!==id){dispose?.();dispose=undefined;selected=id;root.dataset.genaiMotion=id;if(id==='cinematic')dispose=install();dispatchEvent(new CustomEvent('orphlux:variantchange'));}
    select.value=id;
    if(write){const url=new URL(location.href);url.searchParams.set('genaiMotion',id);history.replaceState(null,'',url);try{localStorage.setItem('orphlux-m12-genai-motion',id)}catch{}}
  }
  let saved;try{saved=localStorage.getItem('orphlux-m12-genai-motion')}catch{}
  choose(new URLSearchParams(location.search).get('genaiMotion')||saved||'original');
  select.addEventListener('change',()=>choose(select.value,true));
  addEventListener('popstate',()=>choose(new URLSearchParams(location.search).get('genaiMotion')||'original'));
  sheet.addEventListener('load',()=>dispatchEvent(new CustomEvent('orphlux:variantchange')));
  // Resolve the initial deep link after asynchronous styles and fonts finish changing layout.
  const sheetReady=sheet.sheet?Promise.resolve():new Promise(resolve=>sheet.addEventListener('load',resolve,{once:true}));
  const pageReady=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>addEventListener('load',resolve,{once:true}));
  Promise.all([sheetReady,pageReady,document.fonts.ready]).then(()=>{
    if(selected==='cinematic' && /^#(?:services|evaluation|genai-service-[123])$/.test(location.hash)) {
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(root.dataset.paging==='natural')document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'});
        else dispatchEvent(new HashChangeEvent('hashchange'));
      }));
    }
  });
}
