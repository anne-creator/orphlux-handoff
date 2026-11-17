(() => {
  const navigation = document.querySelector('.sidebar');
  const navToggle = document.querySelector('.nav-toggle');
  function closeNav() {navigation.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false');}
  navToggle.addEventListener('click', () => {const open = navigation.classList.toggle('open'); navToggle.setAttribute('aria-expanded', String(open));});
  document.querySelectorAll('#guide-navigation a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && navigation.classList.contains('open')) {closeNav();navToggle.focus();}});
  document.addEventListener('click', e => {if (!navigation.contains(e.target) && !navToggle.contains(e.target)) closeNav();});
  const navLinks = [...document.querySelectorAll('#guide-navigation a')];
  const chapters = navLinks.map(a => document.querySelector(a.getAttribute('href')));
  let scrollPending = false;
  function markSection() {let current = chapters[0];for (const section of chapters) if (section.getBoundingClientRect().top < 180) current = section;navLinks.forEach(a => {if (a.hash === '#' + current.id) a.setAttribute('aria-current', 'location');else a.removeAttribute('aria-current');});scrollPending = false;}
  window.addEventListener('scroll', () => {if (!scrollPending) {scrollPending = true;requestAnimationFrame(markSection);}}, {passive: true});markSection();
  const toast = document.getElementById('toast');let toastTimer;
  function notify(message) {toast.textContent = message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);}
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {await navigator.clipboard.writeText(value);notify('已复制 ' + value);}
    catch {const field = document.createElement('textarea');field.value = value;field.style.cssText = 'position:fixed;left:-9999px';document.body.append(field);field.select();const copied = document.execCommand('copy');field.remove();notify(copied ? '已复制 ' + value : '色值：' + value);button.focus();}
  }));
  const preview = document.getElementById('type-preview');
  document.querySelectorAll('[data-type-size]').forEach(button => button.addEventListener('click', () => {document.querySelectorAll('[data-type-size]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));preview.classList.toggle('mobile', button.dataset.typeSize === 'mobile');}));
  document.getElementById('type-input').addEventListener('input', e => {if (e.target.value.trim()) preview.textContent = e.target.value;else preview.innerHTML = 'From Data Chaos<br>to Training Truth';});
  document.getElementById('grid-toggle').addEventListener('click', e => {const on = document.getElementById('layout-stage').classList.toggle('show-grid');e.currentTarget.setAttribute('aria-pressed', String(on));e.currentTarget.textContent = on ? '隐藏网格' : '显示网格';});
  const checks = [...document.querySelectorAll('[data-review]')];
  const reviewKey = 'orphlux-brand-guide-review-v1';
  try {const saved = JSON.parse(localStorage.getItem(reviewKey) || '{}');checks.forEach(input => input.checked = saved[input.dataset.review] === true);} catch {}
  function updateProgress(save = true) {document.getElementById('review-progress').textContent = `${checks.filter(input => input.checked).length} / ${checks.length} 已完成`;if (save) try {localStorage.setItem(reviewKey, JSON.stringify(Object.fromEntries(checks.map(input => [input.dataset.review, input.checked]))));} catch {}}
  checks.forEach(input => input.addEventListener('change', () => updateProgress()));
  document.getElementById('reset-review').addEventListener('click', () => {checks.forEach(input => input.checked = false);updateProgress();notify('清单已重置');});updateProgress(false);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const lab = document.querySelector('.motion-lab');const motionButton = document.getElementById('motion-toggle');
  const motionStatus = document.getElementById('motion-status');
  const paths = [...lab.querySelectorAll('.motion-demo > g:first-child > path')];const nodes = [...document.querySelectorAll('#demo-samples > .demo-sample')];const lengths = paths.map(path => path.getTotalLength());
  let paused = false, visible = true, frame = 0, last = 0, elapsed = 0;
  const canPlay = () => !paused && !media.matches && !document.hidden && visible;
  const blend = (v, a, b) => {const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  function paint(time) {nodes.forEach((node,i) => {const progress=(time/24000+i/6)%1;const point=paths[i].getPointAtLength(progress*lengths[i]);const annotated=blend(progress,.30,.42),resolved=blend(progress,.58,.70);node.setAttribute('transform',`translate(${point.x} ${point.y})`);node.setAttribute('opacity',String(Math.min(blend(progress,0,.08),1-blend(progress,.87,1))*.85));node.querySelector('.demo-raw').setAttribute('opacity',String(1-resolved));node.querySelector('.demo-annotation').setAttribute('opacity',String(annotated*(1-resolved)));node.querySelector('.demo-record').setAttribute('opacity',String(resolved));});}
  document.querySelectorAll('[data-demo-state]').forEach(button=>button.addEventListener('click',()=>{const messages={default:'默认：品牌红建立整个网站统一的联系入口。',hover:'悬停：同色相略微加深，布局和位置保持稳定。',focus:'焦点：外圈让键盘用户清楚知道当前可操作的位置。',active:'按下：颜色进一步加深，给出及时反馈。'};document.getElementById('state-feedback').textContent=messages[button.dataset.demoState];}));
  function tick(now) {if (!canPlay()) {frame = 0;last = 0;return;}if (last) elapsed += Math.min(now - last, 80);last = now;paint(elapsed);frame = requestAnimationFrame(tick);}
  function sync() {if (frame) cancelAnimationFrame(frame);frame = 0;last = 0;motionButton.disabled = media.matches;motionButton.setAttribute('aria-pressed', String(paused));motionButton.textContent = media.matches ? '已减少动态效果' : paused ? '播放动效' : '暂停动效';motionStatus.textContent = media.matches ? '已跟随系统减少动态效果偏好，当前为静态示例。' : paused ? '演示已暂停。' : '演示正在播放。';if (canPlay()) frame = requestAnimationFrame(tick);}
  motionButton.addEventListener('click', () => {paused = !paused;sync();});media.addEventListener('change', sync);document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;sync();}, {threshold: 0}).observe(lab);paint(0);sync();
})();

(() => {
 const copy={mist:'A / 当前尝试：Physical AI 与数据集之间采用低位银雾，柔和衔接深色区块。',arc:'B / 纤细弧光。与 Hero 呼应最直接，建议全页只用一次，保持正文安静。',sheen:'C / 页脚采用金属反光。宽而薄的斜向银色光面，为页面收尾。'};
 document.querySelectorAll('[data-silver]').forEach(button=>button.addEventListener('click',()=>{
  const value=button.dataset.silver;
  document.querySelectorAll('[data-silver]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('[data-silver-image]').forEach(img=>img.hidden=img.dataset.silverImage!==value);
  document.querySelector('.silver-stage').dataset.silverActive=value;
  const footer=value==='sheen';
  document.querySelector('.silver-stage-copy>span').textContent=footer?'RESEARCH':'PHYSICAL AI';
  document.querySelector('.silver-stage-copy h4').innerHTML=footer?'Research<br>Capability':'Various paradigms.<br>One physical world.';
  document.querySelector('.silver-next>span').textContent=footer?'CONTACT':'DATASETS';
  document.querySelector('.silver-next h4').textContent=footer?'Tell us what your model needs to learn.':'Ready for what’s next.';
  document.querySelector('.silver-verdict').textContent=copy[value];
 }));
})();
