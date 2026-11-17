/* Independent illustration choices. Fonts, Hero and other services stay unchanged. */
export const evaluationVariants = [
  {id:'compare-simple', label:'双轨简化', alt:'Two paired inputs pass through a model into one compact evaluation card with benchmark, fairness and safety symbols'},
  {id:'bench', label:'全流程测试台', alt:'Silver test cases pass through a model processor to a report covering benchmarking, fairness and safety'},
  {id:'compare', label:'双轨对照', alt:'Paired test cases pass through one model and their responses are compared for capability, bias and safety'},
  {id:'stress', label:'模型压力舱', alt:'An AI model inside an open testing gantry receives benchmark, fairness and adversarial cases and produces an evaluation report'},
  {id:'loop', label:'评估闭环', alt:'Test cases, a model processor, a testing console and an evaluation report form a continuous feedback loop'},
  {id:'original', label:'原版', alt:null},
];

export function mountEvaluationVariants(panel) {
  if (panel.querySelector('[data-evaluation-controls]')) return;
  const row = [...document.querySelectorAll('#services .service-row')].find(row => row.querySelector('h3')?.textContent.trim() === 'End-to-End Evaluation');
  const image = row?.querySelector('img.service-art');
  if (!image) return;
  const original = {src:image.getAttribute('src'), alt:image.getAttribute('alt')};
  if (!row.id) row.id = 'evaluation';
  const group = document.createElement('label');
  group.dataset.evaluationControls = '';
  group.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;gap:6px';
  const label = document.createElement('span');
  label.textContent = 'Evaluation';
  const select = document.createElement('select');
  select.setAttribute('aria-label','Evaluation 配图');
  for (const variant of evaluationVariants) {
    const option = document.createElement('option');
    option.value = variant.id;
    option.textContent = variant.label;
    select.append(option);
  }
  group.append(label,select);
  panel.insertBefore(group,panel.querySelector('.m12-current'));
  const storageKey = 'orphlux-m12-evaluation';
  function choose(id,write=true) {
    const variant = evaluationVariants.find(item=>item.id===id) || evaluationVariants.find(item=>item.id==='original');
    const src = variant.id === 'original' ? original.src : `/m1-2-evaluation/${variant.id}.png`;
    image.setAttribute('src',src);
    image.setAttribute('alt',variant.id==='original' ? original.alt : variant.alt);
    row.dataset.evaluationArtwork = variant.id;
    select.value = variant.id;
    if (write) {
      const url = new URL(location.href);
      url.searchParams.set('evaluation',variant.id);
      history.replaceState(null,'',url);
      try { localStorage.setItem(storageKey,variant.id); } catch {}
    }
  }
  let saved;
  try { saved=localStorage.getItem(storageKey); } catch {}
  choose(new URLSearchParams(location.search).get('evaluation') || saved || 'original',false);
  select.addEventListener('change',()=>choose(select.value));
  addEventListener('popstate',()=>choose(new URLSearchParams(location.search).get('evaluation') || 'original',false));
  // The dynamic anchor uses the existing full-screen controller's navigation path.
  function revealAnchor() {
    if (location.hash !== '#evaluation') return;
    dispatchEvent(new HashChangeEvent('hashchange'));
    if (document.documentElement.dataset.paging === 'natural') row.scrollIntoView({block:'start',behavior:'instant'});
  }
  if (location.hash === '#evaluation') {
    requestAnimationFrame(revealAnchor);
    if (document.readyState !== 'complete') addEventListener('load',()=>requestAnimationFrame(revealAnchor),{once:true});
    document.fonts?.ready.then(()=>requestAnimationFrame(revealAnchor));
  }
}
