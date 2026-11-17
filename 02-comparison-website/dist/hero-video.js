// The poster is first-screen content; video is an optional enhancement.
(() => {
  const hero = document.querySelector('.hero');
  const video = hero?.querySelector('[data-hero-video]');
  if (!video) return;
  const poster = hero.querySelector('img.hero-silk');
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shared = root.dataset.pageMotion ? document.querySelector('[data-motion-toggle]') : null;
  const own = hero.querySelector('[data-video-toggle]');
  const button = shared || own;
  if (shared) own.hidden = true;
  let paused = false;
  try { paused = localStorage.getItem('orphlux-motion') === 'off'; } catch {}
  let visible = false, ready = false, failed = false, requested = false;
  let saveData = navigator.connection?.saveData === true;
  const allowed = () => ready && visible && !document.hidden && !reduced.matches && !paused && !saveData && !failed;
  function updateButton() {
    if (shared) return;
    button.hidden = reduced.matches || failed;
    button.setAttribute('aria-pressed', String(paused || saveData));
    button.textContent = paused || saveData ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-label', paused || saveData ? 'Play background animation' : 'Pause background animation');
  }
  function showPoster() { hero.classList.remove('video-playing'); }
  function sync() {
    updateButton();
    if (!allowed()) {
      video.pause();
      if (reduced.matches || failed) showPoster();
      return;
    }
    if (!requested) {
      requested = true;
      video.src = matchMedia('(max-width: 720px)').matches ? video.dataset.mobile : video.dataset.desktop;
      video.load();
    }
    video.play().catch(() => {
      if (!allowed()) return;
      paused = true; showPoster(); updateButton();
    });
  }
  video.muted = true;
  video.addEventListener('playing', () => {
    if (!allowed()) { video.pause(); return; }
    hero.classList.add('video-playing');
  });
  video.addEventListener('error', () => { failed = true; sync(); });
  if (!shared) button.addEventListener('click', () => {
    if (saveData) { saveData = false; paused = false; } else paused = !paused;
    try { localStorage.setItem('orphlux-motion', paused ? 'off' : 'on'); } catch {}
    sync();
  });
  else new MutationObserver(() => {
    paused = root.classList.contains('motion-off') || root.dataset.pageMotion === 'paused';
    sync();
  }).observe(root, {attributes:true, attributeFilter:['class','data-page-motion']});
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:.01}).observe(hero);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', sync);
  const enable = () => {
    const start = () => { ready = true; sync(); };
    if ('requestIdleCallback' in window) requestIdleCallback(start, {timeout:1500});
    else setTimeout(start, 100);
  };
  // Waiting for this image prevents video bandwidth from delaying the poster.
  const afterLoad = () => poster.complete ? enable() : poster.addEventListener('load', enable, {once:true});
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, {once:true});
  updateButton();
})();
