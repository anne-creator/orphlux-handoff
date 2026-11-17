export function mountOverallComparison(panel){
  if(panel.querySelector('.overall-choices'))return;
  const group=document.createElement('div');group.className='m12-choices overall-choices';group.style.cssText='grid-column:1/-1;align-items:center;padding-top:4px;border-top:1px solid #ffffff0d';group.setAttribute('role','group');group.setAttribute('aria-label','整体对比');
  const label=document.createElement('span');label.className='m12-hero-label';label.textContent='整体对比';group.append(label);
  const current=document.createElement('button');current.type='button';current.textContent='现有版';current.setAttribute('aria-pressed','true');group.append(current);
  const onda=document.createElement('button');onda.type='button';onda.textContent='Onda 参考版';onda.setAttribute('aria-pressed','false');onda.addEventListener('click',()=>{try{sessionStorage.setItem('orphlux-overall-original',location.href);}catch{}location.assign('/onda/index.htm');});group.append(onda);
  panel.insertBefore(group,panel.querySelector('.m12-choices'));
}
