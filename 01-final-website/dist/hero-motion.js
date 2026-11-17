/* OrphLux original hero: deterministic strokes assemble into the brand mark.
 * Adapted from www.orphlux.ai /_next/static/chunks/682c005af6b72f4e.js,
 * module 52967, retrieved 2026-10-24. Canvas geometry/timing/colors retained;
 * React lifecycle replaced with local DOM lifecycle and responsive cleanup. */
(() => {
  const root = document.querySelector('.original-hero-motion');
  const canvas = root?.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  const replay = root?.querySelector('.hero-replay');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let seed = 39;
  const random = () => ((seed = 16807 * seed % 2147483647) - 1) / 2147483646;
  const strokes = Array.from({length:360}, (_, i) => ({
    x:random(), y:random(), angle:random()*Math.PI*2, length:8+24*random(), k:i/360
  }));
  let width=0, height=0, frame=0, started=0, visible=false, seen=false, complete=false;
  function draw(now) {
    if (!width) return;
    ctx.clearRect(0,0,width,height);
    const progress = reduced.matches || complete ? 1 : Math.min(1,Math.max(0,((now-started)/1000-.5)/6));
    const ease = 1-Math.pow(1-progress,3);
    const size = Math.min(.68*width,.61*height), cx=.52*width, cy=.48*height;
    ctx.strokeStyle='rgba(201,205,195,0.8)'; ctx.lineWidth=.6;
    ctx.setLineDash([3,5]);
    ctx.strokeRect(cx-.65*size,cy-.65*size,1.3*size,1.3*size);
    ctx.beginPath();ctx.moveTo(cx,cy-.8*size);ctx.lineTo(cx,cy+.8*size);
    ctx.moveTo(cx-.8*size,cy);ctx.lineTo(cx+.8*size,cy);ctx.stroke();ctx.setLineDash([]);
    strokes.forEach((s,i) => {
      let dx=Math.cos(s.k*Math.PI*2),dy=Math.sin(s.k*Math.PI*2);
      const norm=1/Math.max(Math.abs(dx),Math.abs(dy));dx*=norm;dy*=norm;
      const radius=size*(.33+i%9*.016), accent=dx>.95 && Math.abs(dy)<.26;
      let x=cx+dx*radius,y=cy+dy*radius;
      if(accent){x=cx+size*(.18+i%9*.04);y=cy+(i%5-2)*5;}
      const fromX=s.x*width,fromY=60+s.y*(height-135);
      x=fromX+(x-fromX)*ease;y=fromY+(y-fromY)*ease;
      const angle=s.angle*(1-ease)+(accent?0:Math.abs(dx)>Math.abs(dy)?Math.PI/2:0)*ease;
      const length=s.length*(1-ease)+.065*size*ease;
      ctx.strokeStyle=accent?'#c90a5e':`rgba(22,25,26,${.16+.6*ease})`;ctx.lineWidth=.85;
      ctx.beginPath();ctx.moveTo(x-Math.cos(angle)*length/2,y-Math.sin(angle)*length/2);
      ctx.lineTo(x+Math.cos(angle)*length/2,y+Math.sin(angle)*length/2);ctx.stroke();
    });
    root.dataset.motion = progress===1?'complete':'playing';
    if(progress<1 && !reduced.matches && visible) frame=requestAnimationFrame(draw);
    else if(progress===1)complete=true;
  }
  function resize(){
    cancelAnimationFrame(frame);
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    width=rect.width;height=rect.height;canvas.width=width*dpr;canvas.height=height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);draw(performance.now());
  }
  function play(){cancelAnimationFrame(frame);started=performance.now();complete=reduced.matches;draw(started);}
  replay.hidden=false;replay.disabled=reduced.matches;replay.addEventListener('click',play);
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible){if(!seen){seen=true;play();}else{cancelAnimationFrame(frame);draw(performance.now());}}
    else cancelAnimationFrame(frame);
  },{threshold:0});
  complete=reduced.matches;started=performance.now();resize();observer.observe(canvas);
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(root);
  reduced.addEventListener('change',()=>{replay.disabled=reduced.matches;play();});
  document.addEventListener('visibilitychange',()=>{
    cancelAnimationFrame(frame);if(!document.hidden && visible)draw(performance.now());
  });
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();sizeObserver.disconnect();});
})();
