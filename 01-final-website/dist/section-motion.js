// A single quiet demonstration per service. Static SVG is the default and final state.
(() => {
  const diagrams = [...document.querySelectorAll('[data-service-motion]')];
  if (!diagrams.length || !Element.prototype.animate || !window.IntersectionObserver) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const items = diagrams.map(element => ({element, visible:false, started:false, animations:[]}));
  const manualOff = () => document.documentElement.classList.contains('motion-off');
  const allowed = item => item.visible && !document.hidden && !manualOff() && !media.matches;
  function start(item) {
    item.started = true;
    const packets = [...item.element.querySelectorAll('[data-motion-packet]')];
    packets.forEach((packet, i) => {
      const path = item.element.querySelector(`[data-motion-route="${packet.dataset.motionPacket}"]`);
      const length = path.getTotalLength();
      const frames = Array.from({length:25}, (_, n) => {
        const progress = n / 24, point = path.getPointAtLength(progress * length);
        return {transform:`translate(${point.x}px, ${point.y}px)`, opacity:Math.min(progress * 8, (1-progress) * 8, .8)};
      });
      item.animations.push(packet.animate(frames, {duration:1800, delay:i * 180, easing:'ease-in-out'}));
    });
    item.element.querySelectorAll('[data-motion-confirm]').forEach((check, i) => {
      item.animations.push(check.animate([{opacity:.2},{opacity:1}], {
        duration:700, delay:1400 + i * 180, easing:'cubic-bezier(.22,1,.36,1)'
      }));
    });
  }
  function sync() {
    items.forEach(item => {
      if (media.matches) {
        item.animations.forEach(animation => animation.cancel());
        item.animations = [];
        // Reduced motion always presents the complete illustration, without a later replay.
        item.started = true;
        return;
      }
      if (allowed(item) && !item.started) start(item);
      item.animations.forEach(animation => {
        if (animation.playState === 'finished' || animation.playState === 'idle') return;
        if (allowed(item)) animation.play(); else animation.pause();
      });
    });
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {items.find(item => item.element === entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= .35;});
    sync();
  }, {threshold:[0,.35]});
  items.forEach(item => observer.observe(item.element));
  new MutationObserver(sync).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', sync);
  sync();
})();
