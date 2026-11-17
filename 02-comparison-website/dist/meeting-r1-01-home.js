import {SilverFlow} from '/meeting-r1-01-renderer.js';
import {VectorDetails} from '/meeting-r1-01-details.js';
const canvas=document.querySelector('[data-code-flow]'),hero=canvas.closest('.hero'),root=document.documentElement;
// E-inspired sparse contours. Existing materials remain preserved for comparison.
const base='/meeting-r1-01-material.svg';
const poster=hero.querySelector('img.hero-silk');
if(poster){poster.src=base;poster.width=3136;poster.height=1344;}
canvas.dataset.base=base;
const flow=new SilverFlow(canvas,{base});let visible=true,loaded=false,suspended=false;
const details=new VectorDetails(canvas.parentElement);flow.onframe=t=>details.seek(t);
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
function sync(){const active=loaded&&visible&&!document.hidden&&!suspended&&!reduced.matches&&!root.classList.contains('motion-off')&&root.dataset.pageMotion!=='paused'&&!['video','jimeng','jimeng2','reference-dot'].includes(root.dataset.m12Hero);if(active)flow.play();else flow.pause();canvas.dataset.playing=String(active);if(reduced.matches)flow.seek(0);}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.01}).observe(hero);
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class','data-page-motion','data-m12-hero']});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
window.addEventListener('pagehide',()=>{suspended=true;sync();});window.addEventListener('pageshow',()=>{suspended=false;sync();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();loaded=false;flow.pause();canvas.dataset.ready='false';canvas.dataset.playing='false';});
try{await flow.ready;loaded=true;sync();}catch(error){canvas.dataset.ready='false';canvas.dataset.error=error.message;console.warn('Static artwork fallback:',error.message);}
