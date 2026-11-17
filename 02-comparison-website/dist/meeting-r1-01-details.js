import {LightGlints} from '/light-glints.js';
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
// Positions stay fixed. Every visible annotation is an explicit binary sequence.
const labels=[
 [430,410,'01',11,.65],[770,500,'10',10,.54],[1090,610,'011',11,.76],
 [2280,365,'10',11,.65],[2600,280,'01',10,.52],[2040,565,'101',11,.76],
 [1370,845,'0',12,.63],[1750,905,'1',12,.63]
];
export class VectorDetails {
 constructor(host){
  this.svg=make('svg',{viewBox:'0 0 3136 1344',class:'code-detail meeting-r1-01-details','aria-hidden':'true',preserveAspectRatio:'none'});host.append(this.svg);
  // Preserve the separately maintained glints and their shared animation clock.
  this.glints=new LightGlints(this.svg);this.glints.ready.catch(error=>console.warn('Glint fallback:',error.message));
  this.numbers=labels.map(([x,y,text,size,opacity])=>{const e=make('text',{x,y,fill:'#dce1e7',opacity,'font-family':'ui-monospace, SFMono-Regular, Menlo, monospace','font-weight':400,'data-detail-number':'','data-size':size});e.textContent=text;this.svg.append(e);return e;});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.svg);this.resize();this.ready=Promise.resolve();
 }
 resize(){const width=this.svg.getBoundingClientRect().width;if(!width)return;const scale=width/3136;this.numbers.forEach(e=>{e.setAttribute('font-size',(Number(e.dataset.size)/scale).toFixed(3));e.setAttribute('letter-spacing',(1.1/scale).toFixed(3));});}
 seek(t){this.glints.seek(t);}
}
