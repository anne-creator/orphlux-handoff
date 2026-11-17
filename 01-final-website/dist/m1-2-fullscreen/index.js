/* Shared M1.2 pager. Native document positions retain video/intersection lifecycles. */
(async () => {
  const {WheelGesture} = await import('/m1-2-fullscreen/wheel-gesture.mjs');
  const wheel = new WheelGesture();
  // Opt-in, bounded local diagnostics. Only timing/deltas/decisions, no network or storage.
  const tracing = new URLSearchParams(location.search).has('wheelTrace');
  const traceNode = tracing ? document.createElement('script') : null;
  const trace = [];
  if (traceNode) { traceNode.type = 'application/json'; traceNode.id = 'm12-wheel-trace'; document.body.append(traceNode); }
  let traceTimer;
  function recordWheel(event, result, before) {
    if (!traceNode) return;
    trace.push({t:Math.round(performance.now()),x:event.deltaX,y:event.deltaY,mode:event.deltaMode,result,before,after:root.dataset.pagingScreen});
    if (trace.length > 1500) trace.shift();
    clearTimeout(traceTimer);
    traceTimer = setTimeout(() => { traceNode.textContent = JSON.stringify(trace); }, 40);
  }
  const root = document.documentElement;
  const main = document.querySelector('main');
  const services = document.querySelector('#services');
  if (!main || !services) return;
  const rows = [...services.querySelectorAll('.service-row')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let screens = [], index = 0, enabled = false, scheduled = 0;
  let animation;
  const sections = () => [...main.children].filter(el => el.matches('section,footer'));
  const currentSection = () => screens[index]?.element;
  const genaiCinematic = () => root.dataset.genaiMotion === 'cinematic';
  const nearest = () => sections().reduce((a,b) => Math.abs(a.getBoundingClientRect().top) < Math.abs(b.getBoundingClientRect().top) ? a : b);

  function showService(step) {
    services.dataset.pagingStep = String(step);
    rows.forEach((row,i) => {
      row.hidden = enabled && !genaiCinematic() && i !== step;
      row.inert = enabled && !genaiCinematic() && i !== step;
    });
  }
  function go(next, animate = true) {
    if (!enabled) return;
    next = Math.max(0, Math.min(screens.length - 1, next));
    const old = currentSection();
    index = next;
    const screen = screens[index];
    showService(screen.step ?? 0);
    if (old !== screen.element && old?.contains(document.activeElement)) document.activeElement.blur();
    root.dataset.pagingIndex = String(index);
    root.dataset.pagingScreen = screen.key;
    const top = window.scrollY + screen.element.getBoundingClientRect().top;
    window.scrollTo({top, behavior:'instant'});
    animation?.cancel();
    root.dataset.pagingTransition = animate && !reduced.matches ? 'fade' : 'none';
    if (animate && !reduced.matches && !(genaiCinematic() && screen.element === services)) {
      animation = screen.element.animate([{opacity:0},{opacity:1}], {duration:180,easing:'ease-out'});
    }
    window.dispatchEvent(new CustomEvent('orphlux:screenchange', {detail:{index,section:screen.key}}));
  }
  function markOverflow() {
    // Check real text and controls, not decorative canvases deliberately extending outside a section.
    for (const section of sections()) {
      delete section.dataset.pagingOverflow;
      const bounds = section.getBoundingClientRect();
      const steps = section === services ? rows.length : 1;
      for (let step = 0; step < steps; step++) {
        if (section === services) showService(step);
        const nodes = section.querySelectorAll('h1,h2,h3,p,dt,dd,.button,.pr-method,.footer-bottom,.outline-wordmark,.research-story-status,.research-stories-footer');
        for (const node of nodes) {
          if (!node.getClientRects().length || node.closest('[hidden]')) continue;
          const r = node.getBoundingClientRect();
          const horizontalRail = node.closest('.research-stories-rail, #services .service-rows');
          if (r.top < bounds.top - 2 || r.bottom > bounds.bottom + 2 || (!horizontalRail && (r.right > innerWidth + 2 || r.left < -2))) section.dataset.pagingOverflow = 'true';
        }
      }
    }
    return false;
  }
  function sync() {
    scheduled = 0;
    const prior = enabled ? currentSection() : nearest();
    const priorStep = screens[index]?.step ?? 0;
    enabled = true;
    root.dataset.paging = 'screens';
    screens = sections().flatMap((element,i) => element === services
      ? rows.map((_,step) => ({element,step,key:`services-${step+1}`}))
      : [{element,key:element.id || (element.classList.contains('hero') ? 'hero' : `section-${i}`)}]);
    markOverflow();
    root.dataset.pagingReason = main.querySelector('[data-paging-overflow]') ? 'section-scroll' : 'fits';
    let next = screens.findIndex(s => s.element === prior && (s.step ?? 0) === priorStep);
    if (next < 0) next = Math.max(0, screens.findIndex(s => s.element === prior));
    go(next, false);
  }
  function schedule() { if (!scheduled) scheduled = requestAnimationFrame(sync); }
  function exempt(target, direction = 0) {
    if (document.querySelector('dialog[open]')) return true;
    if (!(target instanceof Element)) return false;
    if (target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),#m12-comparison,dialog')) return true;
    for (let el = target; el && el !== main && el !== document.body; el = el.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 2) {
        if (!direction || (direction < 0 ? el.scrollTop > 1 : el.scrollTop + el.clientHeight < el.scrollHeight - 2)) return true;
      }
    }
    return false;
  }
  window.addEventListener('wheel', event => {
    const before = root.dataset.pagingScreen;
    const skip = !enabled ? 'natural' : event.ctrlKey || event.metaKey ? 'zoom' : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'horizontal' : exempt(event.target, Math.sign(event.deltaY)) ? 'control' : '';
    if (skip) { recordWheel(event, skip, before); return; }
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const direction = wheel.feed(delta, performance.now(), event.deltaMode === 1);
    if (direction) go(index + direction);
    recordWheel(event, direction ? 'page' : 'filtered', before);
  }, {passive:false});
  // Touch gestures use the same screen destinations; inner content can consume a swipe first.
  let touchStart;
  window.addEventListener('touchstart', event => {
    if (!enabled || event.touches.length !== 1) { touchStart = null; return; }
    const touch = event.touches[0];
    touchStart = {x:touch.clientX,y:touch.clientY,up:exempt(event.target,-1),down:exempt(event.target,1)};
  }, {passive:true});
  window.addEventListener('touchmove', event => {
    if (!touchStart || event.touches.length !== 1) return;
    const touch=event.touches[0],dy=touchStart.y-touch.clientY,dx=touchStart.x-touch.clientX;
    if (Math.abs(dy)>Math.abs(dx) && !(dy>0?touchStart.down:touchStart.up)) event.preventDefault();
  }, {passive:false});
  window.addEventListener('touchend', event => {
    const start=touchStart;touchStart=null;if(!start || !event.changedTouches.length)return;
    const touch=event.changedTouches[0],dy=start.y-touch.clientY,dx=start.x-touch.clientX;
    if(Math.abs(dy)>50 && Math.abs(dy)>Math.abs(dx)*1.3 && !(dy>0?start.down:start.up))go(index+Math.sign(dy));
  }, {passive:true});
  window.addEventListener('touchcancel',()=>{touchStart=null},{passive:true});
  window.addEventListener('keydown', event => {
    const direction = /Down/.test(event.key) ? 1 : /Up/.test(event.key) ? -1 : 0;
    if (!enabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || exempt(event.target, direction)) return;
    const destinations = {ArrowDown:index+1,PageDown:index+1,ArrowUp:index-1,PageUp:index-1,Home:0,End:screens.length-1};
    if (!(event.key in destinations)) return;
    event.preventDefault();
    if (!event.repeat) go(destinations[event.key]);
  });
  function anchor(target, animate = true) {
    if (!enabled || !target) return;
    const section = target.closest('main>section,main>footer');
    const row = target.closest('.service-row');
    const step = row ? rows.indexOf(row) : 0;
    const next = screens.findIndex(s => s.element === section && (s.step ?? 0) === step);
    if (next >= 0 && (animate || next !== index)) go(next, animate);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!enabled || !link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
    if (!target || !main.contains(target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    history.pushState(null,'',link.hash);
    anchor(target);
  }, true);
  // Only a pointer press begun on the modal backdrop may close it.
  // Opening from a distant CTA can otherwise deliver its release to the new backdrop.
  let pointerStart, pointerDown = false, settleTimer;
  function settleScroll() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!enabled || pointerDown || document.querySelector('dialog[open]')) return;
      if (Math.abs(currentSection()?.getBoundingClientRect().top || 0) > 1) go(index, false);
    }, 120);
  }
  addEventListener('scroll', settleScroll, {passive:true});
  document.addEventListener('pointerdown', () => { pointerDown = true; }, true);
  document.addEventListener('pointerup', () => { pointerDown = false; settleScroll(); }, true);
  document.addEventListener('pointercancel', () => { pointerDown = false; settleScroll(); }, true);
  document.addEventListener('pointerdown', event => { pointerStart = event.target; }, true);
  document.querySelector('#contact-dialog')?.addEventListener('click', event => {
    if (event.target === event.currentTarget && pointerStart !== event.currentTarget) event.stopImmediatePropagation();
  }, true);
  document.querySelector('#contact-dialog')?.addEventListener('close', () => { if (enabled) go(index, false); });
  document.addEventListener('focusin', event => { if (enabled && main.contains(event.target)) anchor(event.target, false); });
  function fromHash() {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    anchor(target, false);
  }
  addEventListener('hashchange', fromHash);
  addEventListener('popstate', () => { schedule(); requestAnimationFrame(fromHash); });
  addEventListener('resize', schedule, {passive:true});
  addEventListener('orphlux:variantchange', schedule);
  addEventListener('load', schedule);
  document.fonts?.addEventListener('loadingdone', schedule);
  new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['data-m12-hero','data-m12-footer','data-meeting-font','data-reference-font','data-genai-motion']});
  new MutationObserver(schedule).observe(main,{childList:true});
  new MutationObserver(schedule).observe(document.querySelector('#physical'),{attributes:true,attributeFilter:['data-physical-home']});
  // Async variant styles must be included in the fit check.
  document.addEventListener('load', event => { if (event.target.matches?.('link[rel="stylesheet"],img')) schedule(); }, true);
  sync();
  requestAnimationFrame(fromHash);
})();
