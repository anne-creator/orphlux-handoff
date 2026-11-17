// Preserve fine video detail while removing the broad white corner washes.
// Arithmetic creates 1 - source + blur, then inversion recovers positive detail.
// Keeping alpha at one avoids transparent arithmetic-filter output.
const filterSVG=document.createElementNS('http://www.w3.org/2000/svg','svg');
filterSVG.setAttribute('aria-hidden','true');filterSVG.setAttribute('width','0');filterSVG.setAttribute('height','0');
filterSVG.style.position='absolute';filterSVG.style.pointerEvents='none';
// Apply detail extraction to the full atmosphere. The source's white washes
// travel beyond the corners, so blending any original region restores the haze.
filterSVG.innerHTML=`<defs><filter id="hero-atmosphere-details" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceGraphic" stdDeviation="12" edgeMode="duplicate" result="broad-light"/>
 <feComposite in="SourceGraphic" in2="broad-light" operator="arithmetic" k1="0" k2="-1" k3="1" k4="1" result="inverse-detail"/>
 <feComponentTransfer in="inverse-detail"><feFuncR type="linear" slope="-1.5" intercept="1.496"/><feFuncG type="linear" slope="-1.5" intercept="1.496"/><feFuncB type="linear" slope="-1.5" intercept="1.496"/><feFuncA type="identity"/></feComponentTransfer>
 </filter></defs>`;
document.body.prepend(filterSVG);
document.querySelectorAll('.hero>.reference-atmosphere').forEach(layer=>{
 layer.dataset.detailFilter='ready';
 // The five vertical meteors are baked into the reference video. Mask only
 // their source-image columns, accounting for object-fit:cover at every size.
 const removeMeteors=()=>{
  const {width,height}=layer.getBoundingClientRect();
  const scale=Math.max(width/1920,height/1080),offset=(width-1920*scale)/2;
  const stops=['#000 0px'];
  for(const sourceX of [865,912,956,999,1043]){
   const x=offset+sourceX*scale;
   stops.push(`#000 ${x-13*scale}px`,`transparent ${x-9*scale}px`,`transparent ${x+9*scale}px`,`#000 ${x+13*scale}px`);
  }
  stops.push('#000 100%');
  layer.style.maskImage=layer.style.webkitMaskImage=`linear-gradient(to right,${stops.join(',')})`;
 };
 new ResizeObserver(removeMeteors).observe(layer);removeMeteors();
});

// Reuse the site's existing pause control for both decorative background videos.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const videos = [...document.querySelectorAll('[data-reference-atmosphere] video')];
const visible = new Map(videos.map(video => [video, false]));
let suspended = false;

function sync() {
  for (const video of videos) {
    const play = visible.get(video) && !document.hidden && !suspended && !reduced.matches
      && !root.classList.contains('motion-off') && root.dataset.pageMotion !== 'paused';
    if (play) {
      if (video.paused) video.play().catch(() => {});
    } else video.pause();
  }
}

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
  sync();
}, { threshold: .01 });

for (const video of videos) {
  video.muted = true;
  video.addEventListener('playing', () => { video.dataset.ready = 'true'; });
  video.addEventListener('error', () => { video.dataset.ready = 'false'; });
  observer.observe(video);
}
new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class', 'data-page-motion'] });
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', sync);
window.addEventListener('pagehide', () => { suspended = true; sync(); });
window.addEventListener('pageshow', () => { suspended = false; sync(); });
