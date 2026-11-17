"""Apply the same illustration and icon vocabulary to every generated route."""
from pathlib import Path
import json, re
from bs4 import BeautifulSoup

ROOT = Path(__file__).parent
ASSETS = ROOT / 'dist/assets/unified'

def icon(name, css='ui-icon'):
    rotated = name in ('arrow-down', 'arrow-left', 'arrow-up')
    markup = (ASSETS / f'icon-{"arrow-right" if rotated else name}.svg').read_text()
    soup = BeautifulSoup(markup, 'html.parser')
    svg = soup.svg
    if rotated:
        group = soup.new_tag('g', transform=f'rotate({90 if name == "arrow-down" else -90 if name == "arrow-up" else 180} 16 16)')
        for child in list(svg.contents): group.append(child.extract())
        svg.append(group)
    svg['viewBox'] = svg.attrs.pop('viewbox', '0 0 32 32')
    svg['aria-hidden'] = 'true'
    svg['focusable'] = 'false'
    svg['class'] = css.split()
    svg['data-ui-icon'] = 'arrow-up-right' if name == 'arrow' else name
    return str(svg)

def apply_system():
    manifest = json.loads((ASSETS/'manifest.json').read_text())
    glyphs = {'↗':'arrow', '→':'arrow-right', '↓':'arrow-down', '↑':'arrow-up', '←':'arrow-left', '☰':'menu', '×':'close'}
    for path in (ROOT/'dist').rglob('*.html'):
        page = BeautifulSoup(path.read_text(), 'html.parser')
        dark = 'dark-home' in page.body.get('class', [])
        for image in page.select('img[src]'):
            original = Path(image['src']).name
            key = manifest['original_mapping'].get(original)
            if original.endswith(('-light.svg', '-dark.svg')):
                key = original.rsplit('-', 1)[0]
            if dark and original.removesuffix('.svg') in manifest['illustrations']:
                key = original.removesuffix('.svg')
            if not key: continue
            spec = manifest['illustrations'][key]
            image['src'] = '/assets/unified/' + spec['dark']
            image['alt'] = spec['alt']
            image['width'], image['height'] = str(spec['width']), str(spec['height'])
            image['data-visual-family'] = 'structured-flow'
        inline_routes = {'terminal-bench-v3':'dataset-coding','deepswe':'dataset-coding','swe-bench-pro-max':'dataset-coding','agents-last-exam':'evaluation','benchmark-targeted-training':'evaluation','humanitys-last-exam':'dataset-reasoning'}
        key = inline_routes.get(path.parent.name)
        if key:
            for svg in page.select('.m-profilePanel svg'):
                spec = manifest['illustrations'][key]
                image = page.new_tag('img', src='/assets/unified/'+spec['dark'], alt=spec['alt'], width='400', height='260', loading='lazy')
                image['class'] = ['profile-illustration']
                image['data-visual-family'] = 'structured-flow'
                svg.replace_with(image)
        graphic = page.select_one('svg.m-graphic')
        if graphic:
            replacement = page.new_tag('img', src='/assets/unified/research-flow-dark.svg', alt='Raw input follows silver paths through verification into ready training data', width='400', height='260', loading='lazy')
            replacement['class'] = ['m-graphic']
            replacement['data-visual-family'] = 'structured-flow'
            graphic.replace_with(replacement)
        methods = ['01-ego','02-gripper','03-robot','04-hand','05-simulation']
        for i, span in enumerate(page.select('.capture-method .method-icon')):
            span.clear(); span.append(BeautifulSoup(icon(methods[i], 'method-icon-svg'),'html.parser'))
        for text in list(page.find_all(string=re.compile('[↗→↓↑←☰×]'))):
            if text.find_parent(['script','style','svg']): continue
            pieces = re.split('([↗→↓↑←☰×])', str(text))
            for part in pieces:
                if part in glyphs:
                    text.insert_before(BeautifulSoup(icon(glyphs[part]),'html.parser'))
                elif part: text.insert_before(part)
            text.extract()
        # Motion labels stay text, but the control uses the same stroke family.
        control = page.select_one('[data-motion-toggle]')
        if control:
            slot = control.find('span')
            slot.clear()
            slot.append(BeautifulSoup(icon('pause','ui-icon motion-pause-icon'),'html.parser'))
            play = BeautifulSoup(icon('play','ui-icon motion-play-icon'),'html.parser').svg
            play['hidden'] = ''
            slot.append(play)
        path.write_text(str(page))
