// Seven fixed highlights. Their intensity comes from the same light field as the material.
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,value);return el;};
const clamp=x=>Math.max(0,Math.min(1,x));
export function gainAt(item,time){
 const phase=((time%6)+6)%6*4,index=Math.floor(phase),f=phase-index,tr=item.gain;
 const a=tr[(index+23)%24],b=tr[index],c=tr[(index+1)%24],d=tr[(index+2)%24];
 return b+.5*f*(c-a+f*(2*a-5*b+4*c-d+f*(3*(b-c)+d-a)));
}
export function glintIntensity(item,time){
 const envelope=t=>{const normalized=(gainAt(item,t)-item.low)/Math.max(.01,item.high-item.low);const u=clamp((normalized-.58)/.38);return Math.pow(u*u*(3-2*u),1.4);};
 // A short afterglow follows the actual light peak, never a random blinking clock.
 return .025+.975*Math.max(envelope(time),.6*envelope(time-.22));
}
export class LightGlints {
 constructor(svg){this.svg=svg;this.time=0;this.ready=this.init();}
 async init(){
  const response=await fetch('/glints.json');if(!response.ok)throw new Error('Glint data unavailable');
  this.items=(await response.json()).items;
  const defs=make('defs',{}),gradient=make('radialGradient',{id:'silver-glint-halo'});
  for(const [offset,opacity]of [['0%','.72'],['28%','.24'],['65%','.055'],['100%','0']])gradient.append(make('stop',{offset,'stop-color':'#ecf5ff','stop-opacity':opacity}));
  defs.append(gradient);this.svg.prepend(defs);
  this.groups=this.items.map((item,i)=>{
   const g=make('g',{'data-light-glint':i+1,transform:`translate(${item.x} ${item.y})`,opacity:0,'pointer-events':'none'});
   g.append(make('circle',{r:18,fill:'url(#silver-glint-halo)'}));
   g.append(make('path',{d:'M-12 0 Q-2 -1 -1 -8 Q0 -2 12 0 Q2 1 1 8 Q0 2 -12 0Z',fill:'#eff6ff',opacity:.67}));
   g.append(make('circle',{r:2.2,fill:'#fff'}));this.svg.append(g);return g;
  });this.seek(this.time);
 }
 seek(time,intensity){this.time=time;if(intensity)this.intensity=intensity;if(!this.groups)return;this.groups.forEach((g,i)=>g.setAttribute('opacity',(this.intensity?this.intensity(this.items[i]):glintIntensity(this.items[i],time)).toFixed(4)));}
}
