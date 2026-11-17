import {LightGlints} from '/light-glints.js';
import {FlowBeams} from '/flow-beams.js';
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={})=>{let e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
export class VectorDetails {
 constructor(host){this.host=host;this.time=0;this.svg=make('svg',{viewBox:'0 0 3136 1344',class:'code-detail','aria-hidden':'true',preserveAspectRatio:'none'});host.append(this.svg);this.beams=new FlowBeams(this.svg);this.glints=new LightGlints(this.svg);this.glints.ready.catch(error=>console.warn('Glint fallback:',error.message));this.ready=this.init();}
 async init(){const data=await(await fetch('/details.json')).json();this.items=data.items;
  this.groups=this.items.map((item,i)=>{const g=make('g',{fill:'none',stroke:'#c5c9cd','stroke-width':1.35,'stroke-linecap':'round',opacity:item.kind==='number'?1:.77});this.svg.append(g);
   if(item.kind==='number'){let t=make('text',{x:item.x,y:item.y,fill:'#c5c9cd',stroke:'none','font-family':'Arial, sans-serif','font-size':15,'letter-spacing':.4,'font-weight':500,'text-rendering':'geometricPrecision','data-detail-number':''});t.textContent=item.text;g.append(t);}
   else{let d='';const n=item.profile.length;for(let j=0;j<n;j++){let u=j/(n-1),h=item.profile[j]*item.height*.5;let x=item.x+u*item.width;d+=`M${x.toFixed(2)} ${(item.y-h).toFixed(2)}v${(h*2).toFixed(2)} `;}g.append(make('path',{d}));
    if(item.box)g.append(make('rect',{x:item.x+item.width+6,y:item.y-item.height/2,width:item.height*.63,height:item.height,rx:.5}));
    if(item.end)g.append(make('path',{d:`M${item.x+item.width+5} ${item.y-item.height/2}v${item.height}`}));
   }return g;});this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.svg);this.resize();this.seek(this.time);
 }
 resize(){const width=this.svg.getBoundingClientRect().width;if(!width)return;const scale=width/3136;const size=Math.max(15,10/scale);for(const text of this.svg.querySelectorAll('[data-detail-number]')){text.setAttribute('font-size',size.toFixed(3));text.setAttribute('letter-spacing',(0.35/scale).toFixed(3));}}
 // The data annotations belong to fixed strands, not to estimated per-frame motion.
 seek(t){this.time=t;this.beams.seek(t);this.glints.seek(t,item=>this.beams.intensityAt(item,t));}
}
