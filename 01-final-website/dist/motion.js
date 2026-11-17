/* OrphLux: progressive enhancement. All reading content is present without JS. */
(() => {
  const G = window.gsap;
  const panel = document.querySelector('.concept-visual');
  if (!G || !panel) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const points = [...panel.querySelectorAll('.m-rawPoints circle')];
  const paths = [...panel.querySelectorAll('.m-paths path')];
  const core = panel.querySelector('.m-core');
  const end = panel.querySelector('.m-end');
  const steps = [...panel.querySelectorAll('.m-bottom span')];
  const targets = [...points, ...paths, core, end, ...steps];
  let manualOff = false, timeline, seen = false;
  
  try { manualOff = localStorage.getItem('orphlux-motion') === 'off'; } catch {}
  const enabled = () => !manualOff && !reduce.matches;
  const clean = () => {
    timeline?.kill();
    G.set(targets, {clearProps:'all'});
    panel.dataset.motion = 'idle';
  };
  const sync = () => {
    document.documentElement.classList.toggle('motion-off', !enabled());
  };
  const stage = (i) => {
    steps.forEach((s,n) => s.style.color = n === i ? '#a63759' : '');
  };
  const play = () => {
    clean();
    if (!enabled()) return;
    panel.dataset.motion = 'playing';
    const lengths = paths.map(p => p.getTotalLength());
    paths.forEach((p,i) => G.set(p, {strokeDasharray:lengths[i],strokeDashoffset:lengths[i]}));
    timeline = G.timeline({defaults:{ease:'power2.out'}, onComplete:clean});
    timeline.call(() => stage(0),[],0)
      .fromTo(points,{opacity:.25,scale:.65,transformOrigin:'50% 50%'},{opacity:1,scale:1,duration:.65,stagger:.035},0)
      .to(paths,{strokeDashoffset:0,duration:1.05,stagger:.065,ease:'power1.inOut'},.6)
      .call(() => stage(1),[],1.25)
      .to(core,{scale:1.18,transformOrigin:'50% 50%',duration:.5},1.25)
      .to(core,{scale:1,duration:.7},1.7)
      .call(() => stage(2),[],2.2)
      .fromTo(end,{scale:.5,transformOrigin:'50% 50%'},{scale:1.12,duration:.5},2.2)
      .to(end,{scale:1,duration:.4},2.7)
      .to({}, {duration:.1});
  };
  reduce.addEventListener('change',() => {clean();sync();});
  const observer = new IntersectionObserver(entries => {
    const inView = entries[0].isIntersecting;
    if (!inView) clean();
    else if (!seen) {seen=true; play();}
  },{threshold:.35});
  observer.observe(panel);
  document.addEventListener('visibilitychange', () => {if (document.hidden) clean();});
  document.querySelector('#contact-dialog')?.addEventListener('toggle',e=>{if(e.newState==='open')clean();});
  window.addEventListener('pagehide',clean);
  sync();
})();
