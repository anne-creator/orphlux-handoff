"""Complete homepage modules sourced from the retained official-site snapshot."""
from pathlib import Path
from html import escape
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).parent


def render_sections():
    raw = (ROOT / 'source-content/home.html').read_text()
    home = BeautifulSoup(raw, 'html.parser')
    services = BeautifulSoup((ROOT / 'source-content/services.html').read_text(), 'html.parser')
    # Snapshot counters render as zero before JS; use their serialized end values.
    decoded = raw.replace('\\"', '"')
    values = re.findall(r'"end":([\d.]+)', decoded)
    if values != ['500', '99.2', '12', '7']:
        raise ValueError(f'Review changed official homepage metric values: {values}')
    metrics = '<section class="company-proof" aria-label="OrphLux in numbers"><dl>' + ''.join(
        f'<div><dt>{label}</dt><dd>{value}<span>{suffix}</span></dd></div>'
        for value, suffix, label in zip(values, ['', '%', '', ''], ['MILLION FRAMES ANNOTATED', 'MEDIAN QA ACCEPTANCE', 'DELIVERY CENTERS', 'MODALITIES SUPPORTED'])
    ) + '</dl></section>'
    icons = ['01-ego', '02-gripper', '03-robot', '04-hand', '05-simulation']
    methods = []
    for i, article in enumerate(services.select('#paradigms article')):
        icon = (ROOT / 'art-direction/method-icons' / f'{icons[i]}.svg').read_text()
        icon = icon.replace('<svg ', '<svg aria-hidden="true" focusable="false" ', 1)
        title = article.h4.get_text(' ', strip=True)
        methods.append(f'<a class="capture-method" href="/services/#method-{i+1}"><span class="method-icon">{icon}</span><h3>{escape(title)}</h3><span class="link-arrow" aria-hidden="true">{i+1:02}</span></a>')
    physical = '''<section class="physical-section page-section" id="physical" aria-labelledby="physical-title">
      <div class="section-wrap"><div class="section-topline"><span>B · PHYSICAL AI</span><a class="inline-link" href="/services/#physical">Learn more <span aria-hidden="true">→</span></a></div>
      <div class="physical-layout"><div class="physical-copy"><h2 id="physical-title">Data Services<br>for Physical AI</h2><p>Embodied data has no internet-scale corpus to scrape — it has to be manufactured, one interaction at a time, through the right collection paradigms and rigorous quality control.</p><div class="physical-caption"><span class="small-signal" aria-hidden="true"></span></div></div>
      <div class="capture-methods">''' + ''.join(methods) + '''</div></div></div><div class="silver-transition silver-mist-transition" id="silver-transition" aria-hidden="true"><img src="/assets/dark/silver-mist.svg" alt="" width="1200" height="260" loading="lazy"></div></section>'''
    original_datasets = home.select_one('[aria-labelledby="home-datasets"]')
    cards = []
    info = [
        ('world', 'WORLD MODEL', 'Silver relief video frames show sequential object motion above synchronized red action markers'),
        ('reasoning', 'REASONING', 'Silver reasoning units follow a red solution path with a darker alternative branch'),
        ('gui', 'AGENT · COMPUTER USE', 'A red cursor selects a silver interface button and connects to subsequent operation states'),
    ]
    for a, (asset, category, alt) in zip(original_datasets.select('a[class*="__datasetCard"]'), info):
        title = a.h3.get_text(' ', strip=True)
        number = a.strong.get_text(' ', strip=True)
        unit = a.select_one('[class*="__datasetMetric"] .mono-label').get_text(' ', strip=True)
        href = a['href'].rstrip('/') + '/'
        cards.append(f'''<a class="stock-card" href="{href}"><span class="dataset-category">{category}</span><div class="stock-art"><img src="/assets/selected/dataset-{asset}-relief-a.webp" width="1200" height="900" loading="lazy" alt="{alt}"></div><h3>{escape(title)}</h3><div class="stock-metric"><strong>{escape(number)}</strong><span>{escape(unit)}</span></div><span class="stock-link">{escape(a.select_one("[class*=__datasetMeta] .mono-label").get_text(" ",strip=True))}</span></a>''')
    dataset = '''<section class="dataset-section page-section" id="datasets" aria-labelledby="datasets-title"><div class="section-wrap">
      <div class="section-topline"><span>02 / DATASETS OFF-THE-SHELF</span><a class="inline-link" href="/datasets/">View all datasets <span aria-hidden="true">→</span></a></div>
      <div class="section-heading"><h2 id="datasets-title">Off-the-Shelf<br>Datasets</h2><p>Off-the-shelf, high-quality datasets for Generative AI, Physical AI, and World Models — collected in the real world, verified and annotated by domain experts, delivery-ready for large-model training.</p></div>
      <div class="stock-grid">''' + ''.join(cards) + '''</div>
      </div></section>
      <section class="open-data-band" aria-labelledby="open-data-title"><div class="open-data"><div><h3 id="open-data-title">Open-Source Datasets</h3></div><a class="inline-link" href="https://embodied.orphlux.ai/" target="_blank" rel="noopener">Explore open embodied datasets <span aria-hidden="true">↗</span></a></div></section>'''
    research_titles = home.select('[aria-labelledby="home-research"] h3')
    rows = ''.join(f'<li><span class="research-number">R.0{i+1}</span><h3>{escape(h.get_text(" ",strip=True))}</h3><span class="research-status">COMING SOON</span></li>' for i,h in enumerate(research_titles))
    research = '''<section class="research-section page-section" id="research" aria-labelledby="research-title"><div class="section-wrap">
      <div class="section-topline"><span>03 / RESEARCH</span><a class="inline-link" href="/research/">RESEARCH <span aria-hidden="true">→</span></a></div>
      <div class="research-layout"><div><h2 id="research-title">Research<br>Capability</h2><p>OrphLux goes beyond labeling — every benchmark dataset carries the insight of PhDs and industry veterans behind it, the foundation we're building toward a longer-term goal: designing evaluation methodology and defining the boundaries of model capability.</p></div><ol class="research-directions">''' + rows + '''</ol></div>
      </div></section>'''
    return {'METRICS': metrics, 'PHYSICAL': physical, 'DATASETS': dataset, 'RESEARCH': research}
