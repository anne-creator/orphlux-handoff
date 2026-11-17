/* Original Canvas implementations: Onda-inspired wave and diagonal numeric sand.
   No remote runtime, downloaded template bundle, or generated video. */
(() => {
  const canvas=document.querySelector('.wave'), hero=document.querySelector('.hero');
  const ctx=canvas.getContext('2d'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.querySelector('.motion-toggle');
  let width=0,height=0,raf=0,last=0,time=0,visible=true,suspended=false,paused=false;
  try {paused=localStorage.getItem('orphlux-onda-paused')==='true';} catch {}
  const pointer={x:-1000,y:-1000};
  const ramp=['#f5e9ed','#ecd0da','#dba0b4','#ce7693','#bc2f5e','#a72752'];
  function drawWave(t) {
    if(!ctx)return;
    ctx.clearRect(0,0,width,height);
    const step=width<640?7:8;
    for(let x=4;x<width;x+=step) {
      const u=x/width;
      const center=height*(.5-.25*Math.sin(u*5.2-1.2+t*.23));
      const spread=height*(.035+.035*(.5+.5*Math.sin(u*7+t*.28)));
      for(let y=4;y<height;y+=step) {
        const dy=(y-center)/spread;
        const secondary=(y-center-height*.11*Math.sin(u*8+t*.19))/(spread*.68);
        let energy=Math.exp(-dy*dy*.5)*(.66+.17*Math.sin(u*11-t*.5)) + .22*Math.exp(-secondary*secondary*.5);
        energy*=Math.min(1,Math.max(0,(height*.86-y)/(height*.28)));
        const distance=Math.hypot(x-pointer.x,y-pointer.y);
        if(distance<120)energy+=.22*(1-distance/120);
        if(energy<.035){ctx.fillStyle='#eee9ec';ctx.fillRect(x,y,1,1);continue;}
        const level=Math.min(5,Math.max(0,Math.floor(energy*6)));
        const size=step*(.22+level*.115);
        ctx.fillStyle=ramp[level];ctx.fillRect(x-size/2,y-size/2,size,size);
      }
    }
  }
  const effectControl=document.querySelector('[data-effect]');
  let effect=new URLSearchParams(location.search).get('effect')==='wave'?'wave':'sand';
  effectControl.value=effect;
  const atlas=document.createElement('canvas');atlas.width=320;atlas.height=40;
  const ink=atlas.getContext('2d');
  if(ink){ink.font='500 26px monospace';ink.fillStyle='#bc2f5e';ink.textAlign='center';ink.textBaseline='middle';for(let n=0;n<10;n++)ink.fillText(String(n),n*32+16,20);}
  // Fixed seeds make resize/reduced-motion deterministic. Particles travel on
  // independent streamlines; the field deforms locally without reversing flow.
  let seed=917;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.0001,random())))*Math.cos(random()*Math.PI*2);
  const particles=Array.from({length:24000},()=>({start:random()*1.4, speed:.024+random()*.026, offset:gaussian()*.44, depth:random(), lane:random()*6.283, size:2.6+random()*3.2, digit:Math.floor(random()*10), alpha:.34+random()*.46, dust:random()<.27}));
  const smooth=(a,b,v)=>{const k=Math.max(0,Math.min(1,(v-a)/(b-a)));return k*k*(3-2*k);};
  function drawSand(t){
    if(!ctx||!ink)return;
    ctx.clearRect(0,0,width,height);
    const count=width<640?6400:24000;
    const stretch=width<640?.88:1;
    for(let i=0;i<count;i++){
      const p=particles[i];
      const u=((p.start+t*p.speed)%1.4)-.2;
      // A broad sheet gently folds and narrows, with coherent slow waves.
      // Each grain advects independently through it instead of oscillating in place.
      const phase=u*7.2-t*.2;
      const breath=.57+.43*Math.pow(Math.sin(u*3.8+.9-t*.055),2);
      const thickness=(width<640?76:144)*breath;
      const roll=Math.cos(phase)*.28+.72;
      const center=Math.sin(u*6.1-t*.24)*(width<640?15:28);
      const fold=Math.sin(phase+p.depth*1.7)*thickness*.28;
      const drift=Math.sin(u*12-t*.33+p.lane)*(p.dust?12:3);
      const spread=p.offset*thickness*(p.dust?2.65:1)*roll;
      const x=u*width+Math.sin(phase)*p.offset*8;
      const y=height*(.045+u*.86)+center+spread+fold+drift;
      if(x< -16||x>width+16||y< -16||y>height+16)continue;
      const size=p.size*stretch*(p.dust?.74:1);
      // Gaussian tails and depth fading create a feathered edge, not a cutoff.
      let opacity=p.alpha*(p.dust?.38:1)*Math.exp(-Math.abs(p.offset)*(p.dust?.6:.18));
      opacity*=.74+.26*Math.sin(phase+p.depth*2)**2;
      opacity*=.32+.68*smooth(64,152,y);
      // Smooth reading-space masks avoid the previous rectangular opacity steps.
      const titleMask=smooth(height*.40,height*.67,y)*(1-smooth(width*.48,width*.68,x));
      const copyMask=smooth(height*.57,height*.73,y)*smooth(width*.56,width*.68,x)*(1-smooth(width*.90,width*.99,x));
      opacity*=1-.62*titleMask;
      opacity*=1-.70*copyMask;
      ctx.globalAlpha=opacity;
      ctx.drawImage(atlas,p.digit*32,0,32,40,x,y,size,size*1.25);
    }
    ctx.globalAlpha=1;
  }
  function draw(t){canvas.dataset.effect=effect;effect==='sand'?drawSand(t):drawWave(t);}
  effectControl.addEventListener('change',()=>{effect=effectControl.value;const url=new URL(location.href);url.searchParams.set('effect',effect);history.replaceState(null,'',url);draw(reduced.matches?0:time);document.dispatchEvent(new Event('onda-effect'));});
  window.addEventListener('popstate',()=>{effect=new URLSearchParams(location.search).get('effect')==='wave'?'wave':'sand';effectControl.value=effect;draw(time);document.dispatchEvent(new Event('onda-effect'));});
  function resize(){const rect=hero.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);draw(time);}
  function frame(now){raf=0;if(!last)last=now;if(now-last>=32){time+=Math.min(now-last,80)/1000;last=now;draw(time);}raf=requestAnimationFrame(frame);}
  function sync(){const active=!!ctx&&visible&&!document.hidden&&!suspended&&!paused&&!reduced.matches;canvas.dataset.playing=String(active);toggle.textContent=paused?'播放动效':'暂停动效';toggle.setAttribute('aria-pressed',String(paused));toggle.disabled=reduced.matches;toggle.title=reduced.matches?'已遵循系统减少动态效果设置':'';if(active&&!raf){last=0;raf=requestAnimationFrame(frame);}else if(!active&&raf){cancelAnimationFrame(raf);raf=0;}if(reduced.matches)draw(0);}
  toggle.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('orphlux-onda-paused',String(paused));}catch{}sync();});
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;},{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-1000;});
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(hero);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  window.addEventListener('pagehide',()=>{suspended=true;sync();});window.addEventListener('pageshow',()=>{suspended=false;sync();});
  resize();sync();
  // Sample existing OrphLux artwork into brand-colour squares. Original remains
  // beneath the canvas and is revealed by hover or keyboard focus.
  document.querySelectorAll('.halftone').forEach(box=>{
    const image=box.querySelector('img'), surface=box.querySelector('canvas'), target=surface.getContext('2d');
    if(!target)return;
    function paint(){if(!image.complete||!image.naturalWidth)return;
      const w=Math.max(1,Math.round(box.clientWidth)),h=Math.max(1,Math.round(box.clientHeight));surface.width=w;surface.height=h;
      const sample=document.createElement('canvas');sample.width=Math.ceil(w/6);sample.height=Math.ceil(h/6);const sampleCtx=sample.getContext('2d',{willReadFrequently:true});if(!sampleCtx)return;
      sampleCtx.fillStyle='#fff';sampleCtx.fillRect(0,0,sample.width,sample.height);
      const scale=Math.min(sample.width/image.naturalWidth,sample.height/image.naturalHeight);const iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;sampleCtx.drawImage(image,(sample.width-iw)/2,(sample.height-ih)/2,iw,ih);
      let data;try{data=sampleCtx.getImageData(0,0,sample.width,sample.height).data;}catch{return;}
      target.fillStyle='#faf7f8';target.fillRect(0,0,w,h);
      for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){const i=(y*sample.width+x)*4;const darkness=1-(.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])/255;const size=Math.max(.7,Math.pow(darkness,.7)*5.5);target.fillStyle=ramp[Math.min(5,Math.floor(darkness*7))];if(effect==='wave'){target.fillRect(x*6+(6-size)/2,y*6+(6-size)/2,size,size);}else if(darkness>.025){target.font='6px monospace';target.fillText(String((x*7+y*3)%10),x*6,y*6+5);}}
      surface.dataset.ready='true';
    }
    document.addEventListener('onda-effect',paint);image.addEventListener('load',paint);new ResizeObserver(paint).observe(box);paint();
  });
  document.querySelector('[data-original]').addEventListener('click',()=>{
    let url='/homepage.html';try{const saved=new URL(sessionStorage.getItem('orphlux-overall-original')||url,location.origin);if(saved.origin===location.origin&&['/','/homepage.html','/index.html'].includes(saved.pathname))url=saved.pathname+saved.search;}catch{}
    location.assign(url);
  });
})();
