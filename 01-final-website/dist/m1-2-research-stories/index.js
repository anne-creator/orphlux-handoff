/* Research story rail: the supplied motion/layout study, adapted to M1.2 dark. */
export function mountResearchStories(panel) {
  const section = document.getElementById('research');
  if (!section || panel.querySelector('[data-research-controls]')) return;
  const original = section.querySelector('.section-wrap');
  const titles = [...original.querySelectorAll('.research-directions h3')].map(n => n.textContent);
  const intro = original.querySelector('.research-layout p').textContent;
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet'; sheet.href = '/m1-2-research-stories/style.css'; document.head.append(sheet);
  const stories = document.createElement('div'); stories.className = 'research-stories';
  const header = document.createElement('header'); header.className = 'research-stories-header';
  const heading = original.querySelector('h2').cloneNode(true);
  heading.querySelector('br')?.replaceWith(document.createTextNode(' '));
  const summary = document.createElement('p'); summary.textContent = intro;
  header.append(heading, summary);
  const rail = document.createElement('div'); rail.className = 'research-stories-rail';
  rail.setAttribute('role','region'); rail.setAttribute('aria-label','Research directions');
  rail.tabIndex = 0;
  const concepts = [
    ['physical','Embodied AI','Muted blue robotic gripper validates contact with a component, accompanied by subtle force and motion annotations','physical-soft',1672],
    ['multimodal','Multimodal consistency','A softly lit sensing rig aligns camera, depth and outline views of the same gripper and cube','multimodal-soft',1671],
    ['reasoning','Long-CoT reasoning','Translucent thought panels connect premises, evidence and intermediate deductions through alternate branches to a coherent outcome','reasoning-concept-soft',1672],
  ];
  const cards = concepts.map(([id, category, alt, artwork, width], i) => {
    const card = document.createElement('article'); card.className = 'research-story'; card.tabIndex = 0;
    card.setAttribute('aria-labelledby',`research-story-${id}`);
    const image = document.createElement('img'); image.className = 'research-story-media';
    image.loading = 'lazy';
    image.src = `/m1-2-research-stories/assets/${artwork}.png`; image.alt = alt;
    image.width = width; image.height = 941; image.decoding = 'async';
    const content = document.createElement('div'); content.className = 'research-story-content';
    const tag = document.createElement('p'); tag.className = 'research-story-category'; tag.textContent = category;
    const title = document.createElement('h3'); title.id = `research-story-${id}`; title.textContent = titles[i];
    const status = document.createElement('span'); status.className = 'research-story-status'; status.textContent = 'COMING SOON';
    content.append(tag,title,status); card.append(image,content); rail.append(card); return card;
  });
  const footer = document.createElement('div'); footer.className = 'research-stories-footer';
  const progress = document.createElement('div'); progress.className = 'research-story-progress'; progress.setAttribute('aria-hidden','true');
  const segments = cards.map(() => {const span=document.createElement('span'); progress.append(span); return span;});
  const count = document.createElement('span'); count.className = 'research-story-count'; count.setAttribute('aria-live','polite'); count.setAttribute('aria-atomic','true');
  const controls = document.createElement('div'); controls.className = 'research-story-controls';
  const prev = document.createElement('button'), next = document.createElement('button');
  prev.type = next.type = 'button'; prev.textContent = '←'; next.textContent = '→';
  prev.setAttribute('aria-label','Previous research direction'); next.setAttribute('aria-label','Next research direction');
  controls.append(prev,next); footer.append(progress,count,controls); stories.append(header,rail,footer);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, selected, raf = 0;
  const quiet = () => reduced.matches || document.documentElement.classList.contains('motion-off');
  function update(index) {
    active = index;
    cards.forEach((card,i) => {card.classList.toggle('is-active',i===index); segments[i].classList.toggle('is-active',i===index);});
    const value = `${String(index+1).padStart(2,'0')} / 03`;
    if (count.textContent !== value) count.textContent = value;
    prev.disabled = index === 0; next.disabled = index === cards.length-1;
  }
  function to(index) {
    index = Math.max(0,Math.min(cards.length-1,index));
    const card = cards[index];
    const gutter = parseFloat(getComputedStyle(rail).paddingLeft);
    rail.scrollTo({left:card.offsetLeft-rail.offsetLeft-gutter,behavior:quiet()?'instant':'smooth'});
    update(index);
  }
  prev.addEventListener('click',()=>to(active-1)); next.addEventListener('click',()=>to(active+1));
  rail.addEventListener('scroll',()=>{
    if (raf) return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      const left=rail.getBoundingClientRect().left+parseFloat(getComputedStyle(rail).paddingLeft);
      let closest=0, distance=Infinity;
      cards.forEach((card,i)=>{const d=Math.abs(card.getBoundingClientRect().left-left); if(d<distance){distance=d;closest=i;}});
      update(closest);
    });
  },{passive:true});
  rail.addEventListener('keydown',event=>{
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    to(event.key==='Home'?0:event.key==='End'?2:active+(event.key==='ArrowRight'?1:-1));
  });
  cards.forEach((card,i)=>card.addEventListener('focus',()=>to(i)));
  const group=document.createElement('label'); group.dataset.researchControls='';
  group.style.cssText='grid-column:1/-1;display:flex;align-items:center;gap:6px';
  const label=document.createElement('span');label.textContent='Research';
  const select=document.createElement('select');select.setAttribute('aria-label','Research 排版');
  for(const [value,text] of [['stories','暗色图文'],['original','原版']]) {const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
  group.append(label,select);panel.insertBefore(group,panel.querySelector('.m12-current'));
  function choose(value,write=true) {
    const id=value==='stories'?'stories':'original';
    if(selected!==id) {
      section.replaceChildren(id==='stories'?stories:original);
      section.dataset.researchLayout=id; selected=id;
      if(id==='stories') requestAnimationFrame(()=>to(active));
      dispatchEvent(new CustomEvent('orphlux:variantchange'));
    }
    select.value=id;
    if(write){const url=new URL(location.href);url.searchParams.set('research',id);history.replaceState(null,'',url);try{localStorage.setItem('orphlux-m12-research',id)}catch{}}
  }
  let saved;try{saved=localStorage.getItem('orphlux-m12-research')}catch{}
  choose(new URLSearchParams(location.search).get('research')||saved||'original',false);
  select.addEventListener('change',()=>choose(select.value));
  addEventListener('popstate',()=>choose(new URLSearchParams(location.search).get('research')||'original',false));
  update(0);
  // Reapply an initial deep link after asynchronous layout/font styles settle.
  if (location.hash === '#research') {
    const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (location.hash !== '#research') return;
      dispatchEvent(new HashChangeEvent('hashchange'));
      if (document.documentElement.dataset.paging === 'natural') section.scrollIntoView({block:'start',behavior:'instant'});
    }));
    sheet.addEventListener('load',reveal,{once:true});
    if(document.readyState !== 'complete') addEventListener('load',reveal,{once:true});
    document.fonts?.ready.then(reveal);
    reveal();
  }
}
