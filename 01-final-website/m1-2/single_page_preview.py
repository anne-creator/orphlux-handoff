"""Remove destinations from the served local presentation, preserving design."""
import re
from html import escape
from html.parser import HTMLParser


class AnchorAttributes(HTMLParser):
    def handle_starttag(self, tag, attrs):
        self.attrs = attrs


def apply_single_page_preview(html):
    html = re.sub(r'<a\b[^>]*class="(?:skip|study-return)"[^>]*>.*?</a>', '', html, flags=re.S)

    def without_destination(match):
        parser = AnchorAttributes(convert_charrefs=True)
        parser.feed(match[0])
        values = dict(parser.attrs)
        if 'data-contact' in values and values.get('href', '').startswith('mailto:'):
            return match[0]
        href = values.get('href', '')
        local_sections = {'/': '#hero-title', '/homepage.html': '#hero-title', '/services/': '#services', '/datasets/': '#datasets', '/research/': '#research'}
        if href.startswith('#') or href in local_sections:
            attrs = [(key, local_sections.get(href, href) if key == 'href' else value) for key,value in parser.attrs]
            return '<a' + ''.join(' ' + key if value is None else ' ' + key + '="' + escape(value, quote=True) + '"' for key,value in attrs) + '>'
        removed = {'href', 'target', 'rel', 'download', 'ping', 'data-contact',
                   'data-subject', 'tabindex', 'data-static-link', 'onclick'}
        attrs = [(key, value) for key, value in parser.attrs if key not in removed]
        attrs.extend([('data-static-link', ''), ('tabindex', '-1')])
        return '<a' + ''.join(' ' + key if value is None else
                             ' ' + key + '="' + escape(value, quote=True) + '"'
                             for key, value in attrs) + '>'

    html = re.sub(r'<a\b[^>]*>', without_destination, html)
    if '/single-page-local.css' not in html:
        html = html.replace('</head>', '<link rel="stylesheet" href="/single-page-local.css"></head>', 1)
    if '/single-page-local.js' not in html:
        html = html.replace('</head>', '<script defer src="/single-page-local.js"></script></head>', 1)
    # Fullscreen controller replaces the legacy scroll-driven GenAI stage only here.
    html = html.replace('/genai-scroll-local.js', '/m1-2-fullscreen/index.js')
    if '/m1-2-fullscreen/style.css' not in html:
        html = html.replace('</head>', '<link rel="stylesheet" href="/m1-2-fullscreen/style.css"></head>', 1)
    return html
