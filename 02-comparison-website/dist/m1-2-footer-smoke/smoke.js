export function mountSmokeFooter(footer) {
  const css=document.createElement('link');css.rel='stylesheet';css.href='/m1-2-footer-smoke/smoke.css';document.head.append(css);
  const card=footer.querySelector('.footer-cta');
  const story=document.querySelector('#our-story');
  const storyHome=document.createComment('Original brand story position');
  story?.before(storyHome);
  const action=card.querySelector('a');
  action.classList.add('m12-smoke-action');
  const icons={linkedin:'<path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.98 0 3.58 1.96 3.58 4.51Z"/>',youtube:'<path d="M23 7s-.22-1.57-.9-2.26c-.86-.9-1.82-.9-2.26-.96C16.68 3.55 12 3.55 12 3.55s-4.68 0-7.84.23c-.44.06-1.4.06-2.26.96C1.22 5.43 1 7 1 7S.77 8.84.77 10.69v1.73C.77 14.26 1 16.1 1 16.1s.22 1.57.9 2.26c.86.9 1.99.87 2.49.97 1.8.17 7.61.22 7.61.22s4.68 0 7.84-.23c.44-.06 1.4-.06 2.26-.96.68-.69.9-2.26.9-2.26s.23-1.84.23-3.68v-1.73C23.23 8.84 23 7 23 7ZM9.68 15.1V7.97l6.1 3.57Z"/>'};
  footer.querySelectorAll('.footer-social a').forEach(link=>{
    const name=link.textContent.toLowerCase().includes('linkedin')?'linkedin':'youtube';
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');icon.classList.add('m12-social-icon');icon.innerHTML=icons[name];link.prepend(icon);
  });
  const video=document.createElement('video');
  video.className='m12-smoke-video';video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  card.prepend(video);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
  video.addEventListener('loadeddata',()=>video.classList.add('loaded'));
  function sync(){
    const variant=document.documentElement.dataset.m12Footer;
    const active=variant==='smoke'||variant==='sand';
    const source=variant==='sand'?'/m1-2-footer-sand/sand.mp4':'/m1-2-footer-smoke/smoke.mp4';
    if(active&&video.getAttribute('src')&&video.getAttribute('src')!==source){video.pause();video.classList.remove('loaded');video.removeAttribute('src');video.load();}
    if(story && active && story.parentElement!==card.parentElement) card.before(story);
    if(story && !active && story.previousSibling!==storyHome) storyHome.after(story);
    action.classList.toggle('footer-button',!active);
    action.classList.toggle('primary',active);
    if(active&&visible) footer.classList.add('smoke-entered');
    if(active&&visible&&!motion.matches&&!document.hidden){
      if(!video.getAttribute('src'))video.src=source;
      video.play().catch(()=>{});
    }else video.pause();
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(card);
  motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  return sync;
}
