try{document.documentElement.classList.toggle('motion-off',localStorage.getItem('orphlux-motion')==='off')}catch{}
const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});
function closeMenu(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');nav?.classList.remove('open')}
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const dialog=document.querySelector('#contact-dialog'),form=document.querySelector('#contact-form');
let returnFocus;
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();returnFocus=button;const subject=button.dataset.subject||'';form.elements.message.value=subject?'I would like to learn more about '+subject+'.':'';dialog.classList.toggle('pointer-open',e.detail>0);dialog.showModal()}));
dialog?.addEventListener('close',()=>returnFocus?.focus());
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
form?.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const subject='OrphLux inquiry: '+data.get('company');const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nOrganization: ${data.get('company')}\n\n${data.get('message')}`;location.href='mailto:business@orphlux.ai?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)});
