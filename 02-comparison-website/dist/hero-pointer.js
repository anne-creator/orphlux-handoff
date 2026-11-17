/* Original OrphLux hero pointer field, adapted from public module 22462 in
 * /_next/static/chunks/682c005af6b72f4e.js (2026-10-24).
 * Original density, drift, 190px response radius, colors and smoothing retained. */
(() => {
  const canvas=document.querySelector('.hero-pointer-field');
  const hero=canvas?.closest('.editorial-hero');
  const ctx=canvas?.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,particles=[],frame=0,inView=false,px=-9999,py=-9999;
  const enabled=()=>inView&&!document.hidden&&!reduced.matches;
  function resize(){
    const dpr=Math.min(devicePixelRatio||1,2);
    width=canvas.clientWidth;height=canvas.clientHeight;
    canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    particles=Array.from({length:Math.min(340,Math.round(width*height/3600))},()=>({
      x:Math.random()*width,y:Math.random()*height,
      vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.16,response:0
    }));
  }
  function draw(){
    if(!enabled())return;
    ctx.clearRect(0,0,width,height);
    for(const p of particles){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>width)p.vx*=-1;
      if(p.y<0||p.y>height)p.vy*=-1;
      const distance=Math.hypot(p.x-px,p.y-py),target=distance<190?1-distance/190:0;
      p.response+=(target-p.response)*.1;
      const alpha=.16+.78*p.response,r=Math.round(13+188*p.response),g=Math.round(110-100*p.response),b=Math.round(107-13*p.response);
      ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
      const size=2+1.2*p.response;
      ctx.fillRect(p.x-size/2,p.y-size/2,size,size);
      if(p.response>.45){ctx.strokeStyle=`rgba(201,10,94,${(p.response-.45)*.5})`;ctx.strokeRect(p.x-5.5,p.y-5.5,11,11);}
    }
    frame=requestAnimationFrame(draw);
  }
  function resetPointer(){px=py=-9999;}
  function sync(){
    cancelAnimationFrame(frame);
    if(enabled())frame=requestAnimationFrame(draw);
    else if(reduced.matches)ctx.clearRect(0,0,width,height);
  }
  hero.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    const rect=canvas.getBoundingClientRect();px=event.clientX-rect.left;py=event.clientY-rect.top;
  },{passive:true});
  hero.addEventListener('pointerleave',resetPointer);
  window.addEventListener('blur',resetPointer);
  window.addEventListener('scroll',resetPointer,{passive:true});
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{threshold:0});
  const sizeObserver=new ResizeObserver(resize);
  resize();observer.observe(canvas);sizeObserver.observe(hero);
  reduced.addEventListener('change',()=>{resetPointer();sync();});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();});
})();
