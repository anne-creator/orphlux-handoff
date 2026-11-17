import {mountReferenceDot} from '/m1-2-reference-dot/index.js';
// Native MP4 playback is independent of the typography comparison axis.
export function mountHeroComparison(panel) {
  const media={
    'reference-dot':{src:'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4',poster:'/m1-2-reference-dot/poster.jpg'},
    video:{src:'/m1-2-hero-video/hero-flow-v2.mp4',poster:'/m1-2-hero-video/poster-v2.jpg'},
    jimeng:{src:'/m1-2-jimeng-video/hero-jimeng.mp4',poster:'/m1-2-jimeng-video/poster.png'},
    jimeng2:{src:'/m1-2-jimeng-staggered/hero-jimeng-10s.mp4',poster:'/m1-2-jimeng-staggered/poster.png'},
  };
  const root=document.documentElement, hero=document.querySelector('.hero');
  if(!hero || hero.querySelector('.m12-original-video')) return;
  const css=document.createElement('link');
  css.rel='stylesheet';css.href='/m1-2-hero-video.css';document.head.append(css);
  const layer=document.createElement('div');layer.className='m12-original-video';layer.setAttribute('aria-hidden','true');
  const video=document.createElement('video');
  video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
  video.setAttribute('playsinline','');video.setAttribute('muted','');video.setAttribute('aria-hidden','true');
  video.preload='metadata';video.poster='/m1-2-hero-video/poster-v2.jpg';
  layer.append(video);hero.prepend(layer);
  const controls=document.createElement('div');controls.className='m12-hero-choices';
  controls.setAttribute('role','group');controls.setAttribute('aria-label','Hero');
  const heroLabel=document.createElement('span');heroLabel.className='m12-hero-label';heroLabel.textContent='Hero';controls.append(heroLabel);
  const buttons=new Map();
  for(const [id,label] of [['reference-dot','D'],['video','A'],['jimeng','B'],['jimeng2','C']]) {
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.addEventListener('click',()=>select(id));controls.append(button);buttons.set(id,button);
  }
  const retry=document.createElement('button');retry.type='button';retry.textContent='点击播放';retry.hidden=true;
  retry.addEventListener('click',()=>{if(video.error)video.load();sync();});controls.append(retry);
  panel.insertBefore(controls,panel.querySelector('.m12-current'));
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let visible=true,suspended=false,playbackRequest=0;
  let initial='video';
  try {initial=localStorage.getItem('orphlux-m12-hero')||initial;} catch {}
  const fromURL=()=>new URLSearchParams(location.search).get('hero');
  initial=fromURL()||initial;
  const backgrounds=[...hero.querySelectorAll('.reference-atmosphere video')];
  backgrounds.forEach(v=>v.addEventListener('play',()=>{if(media[root.dataset.m12Hero])v.pause();}));
  function sync() {
    const request=++playbackRequest;
    const selected=media[root.dataset.m12Hero];
    video.defaultPlaybackRate=video.playbackRate=root.dataset.m12Hero==='reference-dot'?1:0.5;
    const active=!!selected&&visible&&!document.hidden&&!suspended&&!reduced.matches&&!root.classList.contains('motion-off')&&root.dataset.pageMotion!=='paused';
    video.autoplay=active;
    if(active) {
      if(!video.getAttribute('src')) video.src=selected.src;
      video.play().catch(error=>{if(error.name!=='AbortError'&&request===playbackRequest&&active)retry.hidden=false;});
    } else {video.pause();retry.hidden=true;}
  }
  function select(id,updateURL=true) {
    id=Object.hasOwn(media,id)?id:'current';
    const selected=media[id];
    if(selected && video.getAttribute('poster')!==selected.poster) {
      video.pause();video.dataset.ready='false';retry.hidden=true;
      video.removeAttribute('src');video.poster=selected.poster;video.load();
    }
    if(selected)layer.style.backgroundImage=`url("${selected.poster}")`;
    root.dataset.m12Hero=id;
    buttons.forEach((button,key)=>button.setAttribute('aria-pressed',String(key===id)));
    try {localStorage.setItem('orphlux-m12-hero',id);} catch {}
    if(updateURL) {const url=new URL(location.href);url.searchParams.set('hero',id);history.replaceState(null,'',url);}
    if(selected) backgrounds.forEach(v=>v.pause());
    else if(visible&&!document.hidden&&!reduced.matches&&!root.classList.contains('motion-off')&&root.dataset.pageMotion!=='paused') backgrounds.forEach(v=>v.play().catch(()=>{}));
    sync();
  }
  video.addEventListener('playing',()=>{video.dataset.ready='true';retry.hidden=true;});
  video.addEventListener('error',()=>{video.dataset.ready='false';retry.hidden=!media[root.dataset.m12Hero];});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(hero);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class','data-page-motion']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>{suspended=true;sync();});
  window.addEventListener('pageshow',()=>{suspended=false;sync();});
  window.addEventListener('popstate',()=>select(fromURL()||'video',false));
  mountReferenceDot(panel);
  select(initial,false);
}
