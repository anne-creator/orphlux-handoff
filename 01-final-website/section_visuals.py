"""Reuse the canonical SVG family with scoped styles and optional local motion."""
from pathlib import Path
from bs4 import BeautifulSoup

ASSETS = Path(__file__).parent / 'dist/assets/unified'


def service_svg(name):
    soup = BeautifulSoup((ASSETS / f'{name}-dark.svg').read_text(), 'html.parser')
    svg = soup.svg
    svg['viewBox'] = svg.attrs.pop('viewbox')
    svg['class'] = ['service-art', 'service-diagram']
    svg['data-service-motion'] = name
    svg['data-visual-family'] = 'structured-flow'
    svg['focusable'] = 'false'
    # External SVG class names must not affect the document's secondary button.
    style = svg.style
    for cls in ('secondary', 'pane', 'accent-fill', 'accent', 'dot'):
        style.string = str(style.string).replace('.' + cls + '{', '.service-diagram .sf-' + cls + '{')
    for node in svg.select('[class]'):
        node['class'] = ['sf-' + cls for cls in node['class']]
    routes = {
        'collection': ['M127 77C184 77 157 130 203 130', 'M109 140H203', 'M113 208C178 208 165 150 203 150'],
        'annotation': ['M174 111C223 111 218 87 274 87'],
        'evaluation': ['M102 93C140 93 127 132 166 132', 'M102 169C140 169 127 132 166 132'],
    }
    for i, d in enumerate(routes[name]):
        route = soup.new_tag('path', d=d, stroke='none')
        route['data-motion-route'] = str(i)
        svg.append(route)
        packet = soup.new_tag('g', opacity='0')
        packet['data-motion-packet'] = str(i)
        packet.append(soup.new_tag('rect', x='-3', y='-3', width='6', height='6', rx='1', fill='#C9D5DE', stroke='none'))
        svg.append(packet)
    # One focused event per diagram: labels resolve, then checks confirm output.
    accents = svg.select('.sf-accent')
    for i, accent in enumerate(accents):
        accent['data-motion-confirm'] = str(i)
    return str(svg)
