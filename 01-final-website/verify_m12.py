from pathlib import Path
import hashlib,importlib.util,json,subprocess
root=Path(__file__).resolve().parent
manifest=json.loads((root/'m1-2/runtime-manifest.json').read_text()); errors=[]
spec=importlib.util.spec_from_file_location('m12',root/'m1-2/single_page_preview.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
comparison=m.apply_single_page_preview((root/'m1-2/homepage.html').read_text())
html=comparison.replace('/meeting-r1-02-typography.js','/final-default.js')
if (root/'dist/compare/index.html').read_text()!=comparison:errors.append('Comparison snapshot differs')
for name in ['index.html','homepage.html']:
 if (root/'dist'/name).read_text()!=html:errors.append(f'Homepage differs: {name}')
for name,info in manifest['files'].items():
 p=root/'dist'/name
 if not p.is_file():errors.append('Missing '+name);continue
 if hashlib.sha256(p.read_bytes()).hexdigest()!=info['sha256']:errors.append('Changed '+name)
 if p.suffix in ['.js','.mjs']:
  result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
  if result.returncode:errors.append(result.stderr)
for name in ['physical-soft','multimodal-soft','reasoning-concept-soft']:
 if f'm1-2-research-stories/assets/{name}.png' not in manifest['files']:errors.append('Research asset missing '+name)
result={'homepage_aliases':2,'runtime_files':len(manifest['files']),'runtime_bytes':sum(x['bytes'] for x in manifest['files'].values()),'errors':errors}
(root/'m1-2/verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));raise SystemExit(bool(errors))
