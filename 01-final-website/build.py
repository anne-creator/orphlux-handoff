from pathlib import Path
import re, shutil, html, json
from bs4 import BeautifulSoup, Comment
ROOT=Path(__file__).parent
OUT=ROOT/'dist'
def soup(name):return BeautifulSoup((ROOT/'source-content'/f'{name}.html').read_text(),'html.parser')
def clean(el):
 for x in list(el.find_all(['script','canvas'])):x.decompose()
 for x in el.select('.route-progress'):x.decompose()
 for x in el.find_all(string=lambda t:isinstance(t,Comment)):x.extract()
 for x in el.find_all(True):
  if x.name in ['h1','h2','h3','h4'] and x.get('aria-label'):
   t=x['aria-label'];x.clear();x.string=t;del x['aria-label']
  for a in list(x.attrs):
   if a.startswith('data-') or a=='style':del x[a]
  if x.get('class'):x['class']=[('m-'+c.split('__')[-1]) if '-module__' in c else c for c in x['class']]
  if x.name=='img' and x.get('src','').startswith('/'):
   x['src']='/assets/'+Path(x['src']).name
  if x.name=='a' and x.get('href','').startswith('/'):
   parts=x['href'].split('#');parts[0]=parts[0].rstrip('/')+'/' if parts[0]!='/' else '/';x['href']='#'.join(parts)
  if x.name=='button' and ('Contact' in x.get_text() or 'sample' in x.get_text()):
   x['data-contact']='';x['data-subject']=el.find('h1').get_text() if el.find('h1') else '';x['class']=['button']
  if x.name=='svg' and x.get('viewbox'):x['viewBox']=x.attrs.pop('viewbox')
  if x.name=='svg' and x.get('preserveaspectratio'):x['preserveAspectRatio']=x.attrs.pop('preserveaspectratio')
 return el
logo='<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M0 0h32v12h-7V7H7v18h18v-5h7v12H0z"/><path fill="#bc2f5e" d="M18 13h14v6H18z"/></svg><span>ORPH<span class="brand-accent">LUX</span></span>'
def nav(page):
 links=''.join(f'<a href="{url}" '+('aria-current="page" ' if page==p else '')+f'>{t}</a>' for p,t,url in [('home','Home','/'),('services','Services','/services/'),('datasets','Datasets','/datasets/'),('research','Research','/research/')])
 return f'<a class="skip" href="#main-content">Skip to content</a><header class="nav-shell"><div class="nav-inner"><a class="brand" href="/" aria-label="OrphLux home">{logo}</a><nav id="navigation" aria-label="Main navigation">{links}<a href="https://forms.gle/j1FG9QNZJcS1inQP9" target="_blank" rel="noopener">Experts ↗</a></nav><button class="button nav-contact" data-contact>Contact Us <span>↗</span></button><button class="menu" aria-expanded="false" aria-controls="navigation" aria-label="Open navigation">Menu <span>☰</span></button></div></header>'
def footer():return f'<section class="contact-band" id="contact"><div><span class="eyebrow">CONTACT</span><h2>Tell us what your model<br>needs to learn.</h2></div><button class="button" data-contact>Contact Us <span>↗</span></button></section><footer class="site-footer"><a class="brand" href="/" aria-label="OrphLux home">{logo}</a><span>Expert data for next-gen intelligence</span><nav aria-label="Social media"><a href="https://www.linkedin.com/company/orphlux/posts/" target="_blank" rel="noopener">LinkedIn ↗</a><a href="https://www.youtube.com/@OrphLux" target="_blank" rel="noopener">YouTube ↗</a></nav></footer>'
modal='''<dialog id="contact-dialog" aria-labelledby="dialog-title"><form method="dialog" class="dialog-top"><span class="eyebrow">ORPHLUX</span><button class="close" aria-label="Close contact form">×</button></form><h2 id="dialog-title">Let’s talk data.</h2><p>Tell us what your model needs to learn.</p><form id="contact-form"><label>Name<input name="name" autocomplete="name" required></label><label>Work email<input name="email" type="email" autocomplete="email" required></label><label>Organization<input name="company" autocomplete="organization" required></label><label>What are you working on?<textarea name="message" rows="4" required></textarea></label><button class="button" type="submit">Continue in email <span>↗</span></button><p class="form-note">Opens your email app with a draft. Your message is sent only when you send the email.</p></form><p class="direct-email">Or email <a href="mailto:business@orphlux.ai">business@orphlux.ai</a></p></dialog>'''
def motion_head(page):
 return '<script src="/hero-motion.js" defer></script><script src="/hero-pointer.js" defer></script>' if page=='home' else ''
def shell(page,title,body):return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Expert data for foundation models, embodied AI, and world models. Explore OrphLux data services and datasets."><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#050607"><title>{html.escape(title)}</title><link rel="icon" href="/assets/logo-original.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/49b9b879d2c785b3.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/styles.css?v=20261105-all-dark"><link rel="stylesheet" href="/design-system.css?v=20261105-all-dark"><script src="/site.js" defer></script>{motion_head(page)}</head><body class="page-{page}">{nav(page)}{body}{modal}</body></html>'
home=soup('home');services=soup('services');datasets=soup('datasets');research=soup('research')
lede=home.select_one('.page-lede').get_text()
process=services.select('#genai article')
physical=services.select('#paradigms article')
# Restore the original homepage canvas animation, without the research diagram.
visual='<div class="original-hero-motion"><canvas role="img" aria-label="Scattered line segments assemble into the OrphLux mark"></canvas><button type="button" class="hero-replay" hidden>REPLAY ↻</button></div>'

hero=f'''<section class="editorial-hero"><canvas class="hero-pointer-field" aria-hidden="true"></canvas><div class="hero-copy"><p class="eyebrow">GROUND TRUTH SYSTEMS</p><h1>From Data Chaos<br>to Training <span>Truth</span></h1><p class="lede">{lede}</p><div class="actions"><button class="button" data-contact>Contact Us <span>↗</span></button><a class="text-link" href="#services">See our services <span>↓</span></a></div></div><div class="hero-visual">{visual}</div></section>'''
service_icon_names=['collection','annotation','evaluation']
def service_icon(index):
 svg=(ROOT/'art-direction'/'service-icons'/f'{service_icon_names[index]}.svg').read_text().strip()
 return svg.replace('<svg ', '<svg class="service-icon" aria-hidden="true" focusable="false" ',1)
stages=''.join(f'<li>{service_icon(i)}<div><h3>{a.h3.get_text()}</h3><p>{a.p.get_text()}</p></div></li>' for i,a in enumerate(process))
method_icon_names=['01-ego','02-gripper','03-robot','04-hand','05-simulation']
def method_icon(index):
 svg=(ROOT/'art-direction'/'method-icons'/f'{method_icon_names[index]}.svg').read_text().strip()
 return svg.replace('<svg ', '<svg class="method-icon" aria-hidden="true" focusable="false" ',1)
methods=''.join(f'<a href="/services/#method-{i+1}">{method_icon(i)}<h3>{a.h4.get_text()}</h3><span aria-hidden="true">↗</span></a>' for i,a in enumerate(physical))
physintro=services.select_one('[class*="__physicalIntro"]').get_text()
service_html=f'''<section class="home-services" id="services"><div class="section-heading"><span class="eyebrow">OUR SERVICES</span><a class="text-link" href="/services/">All services <span>↗</span></a></div><div class="service-feature"><div class="service-intro"><span class="category">GENERATIVE AI</span><h2>Data Services for<br> Generative AI</h2><a class="text-link" href="/services/#genai">Explore Generative AI <span>↗</span></a></div><ol class="stages">{stages}</ol></div><div class="service-feature physical"><div class="service-intro"><span class="category">PHYSICAL AI</span><h2>Data Services for<br> Physical AI</h2><p>{physintro}</p><a class="text-link" href="/services/#physical">Explore Physical AI <span>↗</span></a></div><div class="method-list">{methods}</div></div><div class="metrics" aria-label="OrphLux company metrics">'''+''.join(f'<div><strong>{n}</strong><span>{l}</span></div>' for n,l in [('500','Million frames annotated'),('99.2%','Median QA acceptance'),('12','Delivery centers'),('7','Modalities supported')])+'''</div></section>'''
cards=[]
for idx,number,unit in [(1,'8,000+','Hours in stock · 10,000 hrs / week'),(2,'10 million','Entries'),(5,'50,000','Sets')]:
 a=datasets.select_one(f'#dataset-{idx}');link=a.h3.a['href'];title=a.h3.get_text();img=a.img['src'];cat=a.select_one('dd').get_text()
 cards.append(f'<a class="dataset-card" href="{link}/"><div class="dataset-image"><img src="/assets/{Path(img).name}" alt="" width="2048" height="1152" loading="lazy"></div><div class="dataset-copy"><span class="category">{cat}</span><h3>{title}</h3><div class="dataset-number"><strong>{number}</strong><span>{unit}</span></div><span class="card-link">Explore dataset <span>↗</span></span></div></a>')
dataset_html=f'''<section class="home-datasets" id="datasets"><div class="section-heading"><div><span class="eyebrow">READY TO USE</span><h2>Off-the-Shelf Datasets</h2></div><a class="text-link" href="/datasets/">View all datasets <span>↗</span></a></div><p class="section-lede">{datasets.select_one('.page-lede').get_text()}</p><div class="dataset-grid">{''.join(cards)}</div><div class="open-source"><h3>Open-Source Datasets</h3><a class="text-link" href="https://embodied.orphlux.ai/" target="_blank" rel="noopener">Explore open embodied datasets <span>↗</span></a></div></section>'''
research_titles=[h.get_text(' ',strip=True) for h in home.select('h3') if 'methodology' in h.get_text() or 'Standardized' in h.get_text() or 'adversarial' in h.get_text()]
research_html=f'''<section class="home-research"><div><span class="eyebrow">RESEARCH</span><h2>Research Capability</h2><p>{research.select_one('.page-lede').get_text()}</p><a class="text-link" href="/research/">Research &amp; experts <span>↗</span></a></div><div class="research-list">'''+''.join(f'<div><h3>{t}</h3><span>Coming soon</span></div>' for t in research_titles)+'''</div></section>'''
from dark_home import render_home
(OUT/'index.html').write_text(render_home(modal))
for f in (ROOT/'source-content').glob('*.html'):
 if f.stem=='home':continue
 s=BeautifulSoup(f.read_text(),'html.parser');main=s.main
 for x in main.select('.contact-band,.site-footer'):x.decompose()
 clean(main)
 if f.stem=='services':
  for i,a in enumerate(main.select('#paradigms article')):a['id']=f'method-{i+1}'
 if f.stem=='research':
  for x in main.select('.m-comingSoonOrbit,.m-comingSoonCursor'):x.decompose()
 for x in main.find_all('span',class_='accent'):x.unwrap()
 # All original content remains; remove only purely ornamental serial numbers from section labels.
 for x in main.select('.section-bar > span:first-child,.m-technicalBar h2'):
  text=x.get_text(' ',strip=True);x.clear();x.string=re.sub(r'^[A-Z]?\.?\d+\s*/\s*','',text)
 main.append(BeautifulSoup(footer(),'html.parser'))
 path=f.stem.replace('--','/');folder=OUT/path;folder.mkdir(parents=True,exist_ok=True)
 page='detail' if '--' in f.stem else f.stem
 (folder/'index.html').write_text(shell(page,s.title.get_text(),str(main)))
(OUT/'404.html').write_text(shell('notfound','Page not found | OrphLux','<main id="main-content"><section class="page-hero"><p class="eyebrow">404</p><h1>Page not found.</h1><p>The page you’re looking for isn’t here.</p><a class="text-link" href="/">Return home →</a></section>'+footer()+'</main>'))
# The same reviewed illustration is used on the homepage, catalog and detail page.
# Label generated views as illustrative, never as actual delivered customer data.
illustration_manifest=ROOT/'illustrations.json'
if illustration_manifest.exists():
 illustrations=json.loads(illustration_manifest.read_text())
 for page_path in OUT.rglob('*.html'):
  page=BeautifulSoup(page_path.read_text(),'html.parser');changed=False
  for image in page.select('img[src]'):
   spec=illustrations.get(Path(image['src']).name)
   if not spec:continue
   asset=OUT/'assets'/spec['file']
   if not asset.is_file():raise FileNotFoundError(asset)
   image['src']='/assets/'+spec['file'];image['alt']=spec['alt']
   image['width']=str(spec['width']);image['height']=str(spec['height'])
   image['data-illustration']='true'
   preview=image.parent;preview.attrs.pop('aria-hidden',None)
   preview['class']=preview.get('class',[])+['illustrated-preview']
   caption_text=spec.get('caption','Illustrative data view')
   if caption_text:
    caption=page.new_tag('span',attrs={'class':'illustration-caption'})
    caption.string=caption_text;preview.append(caption)
   card=image.find_parent('a',class_='dataset-card')
   if card:card['class'].append('dataset-card--illustrated')
   changed=True
  if changed:page_path.write_text(str(page))
from visual_system import apply_system
apply_system()
print('Built',len(list(OUT.rglob('*.html'))),'pages')

# Preserve the selected M1.2 homepage after rebuilding retained inner pages.
m12_source=ROOT/'m1-2/homepage.html'
if m12_source.exists():
 import importlib.util
 spec=importlib.util.spec_from_file_location('m12_single_page',ROOT/'m1-2/single_page_preview.py')
 m12=importlib.util.module_from_spec(spec);spec.loader.exec_module(m12)
 rendered=m12.apply_single_page_preview(m12_source.read_text())
 for name in ['index.html','homepage.html']:(OUT/name).write_text(rendered)

# Retain the comparison export and derive the fixed default final delivery.
from build_delivery import build_delivery
build_delivery()
