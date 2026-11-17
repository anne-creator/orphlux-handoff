from pathlib import Path
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
import json,re
root=Path(__file__).parent/'dist'
pages=list(root.rglob('*.html'));errors=[];links=0;assets=0
for path in pages:
 if path.name=='qa.html':continue
 s=BeautifulSoup(path.read_text(),'html.parser')
 if len(s.select('h1'))!=1:errors.append(f'{path}: expected one H1')
 if not s.select_one('main#main-content'):errors.append(f'{path}: no accessible main')
 for e in s.select('[src],a[href],link[href]'):
  value=e.get('src') or e.get('href');u=urlsplit(value)
  if u.scheme or u.netloc or value.startswith('data:'):continue
  target=root/u.path.lstrip('/') if u.path else path
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{path.relative_to(root)}: missing {value}');continue
  if u.fragment:
   ts=BeautifulSoup(target.read_text(),'html.parser') if target.suffix=='.html' else None
   if ts and not ts.find(id=unquote(u.fragment)):errors.append(f'{path.name}: missing anchor {value}')
  if e.name=='a':links+=1
  else:assets+=1
 for video in s.select('video[data-hero-video]'):
  for attr in ('data-desktop','data-mobile'):
   value=video.get(attr,'')
   if not value or not (root/value.lstrip('/')).is_file():errors.append(f'{path.name}: missing video source {attr}')
   else:assets+=1
  if video.get('preload')!='none' or video.has_attr('src'):errors.append(f'{path.name}: hero video must defer network loading')
 for e in s.select('button'):
  if e.has_attr('data-video-toggle'):
   if e.has_attr('hidden'):continue  # M1.2 deliberately removes the visible stop control.
   if not any(urlsplit(script['src']).path=='/hero-video.js' for script in s.select('script[src]')):errors.append(f'{path.name}: video control without script')
   continue
  if e.has_attr('data-motion-toggle'):
   scripts={urlsplit(script['src']).path for script in s.select('script[src]')}
   if not ({'/dark-home.js','/home-motion.js'} & scripts):errors.append(f'{path.name}: dark motion control without script')
   if '/home-motion.js' in scripts and '/assets/vendor/gsap-3.15.0.min.js' not in scripts:errors.append(f'{path.name}: page motion without GSAP')
   continue
  if 'hero-replay' in e.get('class',[]):
   if not s.select_one('script[src="/hero-motion.js"]'):errors.append(f'{path.name}: hero replay without animation')
   continue
  if set(e.get('class',[])) & {'motion-replay','motion-toggle'}:
   if not s.select_one('script[src="/motion.js"]') or not e.find_parent(class_='concept-visual'):
    errors.append(f'{path.name}: motion control without its script/diagram')
   continue
  if e.get('type')=='submit' or e.find_parent('form') or e.has_attr('data-contact') or 'menu' in e.get('class',[]):continue
  errors.append(f'{path.name}: unhandled button {e.get_text()}')
# The existing service descriptions and dataset descriptions must survive the transformation.
for source in (root.parent/'source-content').glob('*.html'):
 if source.stem=='home':continue
 before=BeautifulSoup(source.read_text(),'html.parser');dest=root/source.stem.replace('--','/')/'index.html';after=BeautifulSoup(dest.read_text(),'html.parser')
 norm=lambda x:re.sub(r'\s+([.,;:!?])',r'\1',' '.join(x.split()))
 body=norm(after.main.get_text(' ',strip=True))
 for p in before.main.select('p,blockquote'):
  text=norm(p.get_text(' ',strip=True))
  if len(text)>80 and text not in body:errors.append(f'{source.name}: lost source paragraph: {text[:70]}')
result={'pages':len([p for p in pages if p.name!='qa.html']),'internal_links_checked':links,'asset_references_checked':assets,'errors':errors}
print(json.dumps(result,indent=2));(root.parent/'verification.json').write_text(json.dumps(result,indent=2));raise SystemExit(bool(errors))
