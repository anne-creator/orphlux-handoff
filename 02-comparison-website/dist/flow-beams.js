// Fixed paths traced in the original 3136×1344 artwork coordinates.
// Only the short illuminated segment advances. Geometry never deforms.
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;};
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export class FlowBeams {
 constructor(svg){
  this.group=make('g',{'data-flow-beams':'','pointer-events':'none',fill:'none','stroke-linecap':'round'});svg.append(this.group);
  this.routes=[
   {delay:0,d:'M-80 413 C300 445 650 568 1000 665 C1160 709 1280 704 1375 713 C1460 720 1474 814 1480 960 C1485 1090 1488 1230 1488 1410'},
   {delay:3,d:'M3216 346 C2860 358 2590 494 2300 611 C2080 700 1900 704 1760 713 C1670 719 1651 824 1645 960 C1639 1100 1637 1240 1637 1410'}
  ].map(route=>{
   const path=make('path',{d:route.d,visibility:'hidden'});this.group.append(path);
   const length=path.getTotalLength();
   // Cache arc-length samples once; frame updates only interpolate coordinates.
   const samples=Array.from({length:Math.ceil(length/3)+1},(_,i)=>path.getPointAtLength(Math.min(length,i*3)));
   const g=make('g',{'data-flow-beam':route.delay===0?'left':'right'});this.group.append(g);
   const segments=Array.from({length:32},()=>{const halo=make('path',{stroke:'#cbdcf3','stroke-width':7}),core=make('path',{stroke:'#f5f9ff','stroke-width':2});g.append(halo,core);return {halo,core};});
   return {...route,path,length,samples,g,segments};
  });
  this.nearby=new Map();this.seek(0);
 }
 point(route,s){s=Math.max(0,Math.min(route.length,s));const i=Math.min(route.samples.length-2,Math.floor(s/3)),f=clamp((s-i*3)/3),a=route.samples[i],b=route.samples[i+1];return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}
 travel(route,time){const phase=((time-route.delay)%6+6)%6;return (phase/4.6)*(route.length+240)-120;}
 seek(time){
  this.group.dataset.time=time.toFixed(3);
  for(const route of this.routes){
   const head=this.travel(route,time),tail=210;
   route.g.dataset.distance=head.toFixed(2);
   for(let i=0;i<32;i++){
    const u=i/32,v=(i+1)/32,s=head-tail*(1-u),e=head-tail*(1-v);
    const a=this.point(route,s),b=this.point(route,e),d=`M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    const fade=smooth(head/100)*smooth((route.length+tail-head)/tail);
    const brightness=Math.pow(v,1.7)*smooth((1-u)/.12)*fade*(s>=0&&e<=route.length?1:0);
    const {halo,core}=route.segments[i];
    halo.setAttribute('d',d);core.setAttribute('d',d);
    halo.setAttribute('opacity',(brightness*.13).toFixed(3));core.setAttribute('opacity',(brightness*.95).toFixed(3));
    core.setAttribute('stroke-width',(1+2.4*Math.sin(Math.PI*v)).toFixed(2));
   }
  }
 }
 intensityAt(item,time){
  if(!this.nearby.has(item))this.nearby.set(item,this.routes.map(route=>{
   let nearest={distance:Infinity,s:0};
   route.samples.forEach((p,i)=>{const distance=Math.hypot(p.x-item.x,p.y-item.y);if(distance<nearest.distance)nearest={distance,s:i*3};});
   return nearest;
  }));
  let intensity=0;
  this.nearby.get(item).forEach((near,i)=>{
   const offset=this.travel(this.routes[i],time)-near.s;
   // Quick arrival and a longer, soft afterglow, driven by the beam's position.
   const envelope=Math.exp(-Math.pow(offset/(offset<0?65:170),2));
   intensity=Math.max(intensity,envelope*Math.exp(-Math.pow(near.distance/180,2)));
  });
  return .025+.975*intensity;
 }
}
