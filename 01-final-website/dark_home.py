"""Reproducible three-section homepage and code-authored Hero illustration.

Reference: B1 Hero + B4 services + B1 footer, reduced service illustrations,
and no vertical connector in the service section. SVG contains no baked text.
"""
from pathlib import Path
import math
import random
from home_sections import render_sections
from html import escape

ROOT = Path(__file__).parent


def hero_svg():
    rng = random.Random(110204)
    parts = ['''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1170" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e7eef3" stop-opacity=".22"/><stop offset=".57" stop-color="#e7eef3" stop-opacity=".75"/><stop offset="1" stop-color="#d4e4ee" stop-opacity=".04"/></linearGradient>
      <linearGradient id="vertical" gradientUnits="userSpaceOnUse" x1="0" y1="650" x2="0" y2="1170"><stop stop-color="#e9f1f6" stop-opacity=".02"/><stop offset=".28" stop-color="#dbe6ee" stop-opacity=".55"/><stop offset="1" stop-color="#dbe6ee" stop-opacity="0"/></linearGradient>
      <radialGradient id="node"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".2" stop-color="#d9eaf2" stop-opacity=".24"/><stop offset="1" stop-color="#d9eaf2" stop-opacity="0"/></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
      <linearGradient id="glint"><stop stop-color="#e3eef6" stop-opacity="0"/><stop offset=".53" stop-color="#f4f9ff" stop-opacity=".9"/><stop offset="1" stop-color="#b7c5ce" stop-opacity=".05"/></linearGradient>
    </defs>''']
    # Fine distant construction lines, kept out of the central reading area.
    parts.append('<g stroke="#a4b7c5" stroke-width=".6" opacity=".14">')
    for side in (0, 1):
        for i in range(12):
            x = 22 + i * 22 if side == 0 else 1418 - i * 22
            y = 150 + (i * 41) % 220
            parts.append(f'<path d="M{x} {y} V{760 + (i * 37) % 200}"/>')
    parts.append('</g>')
    paths = []
    for side in (0, 1):
        for i in range(16):
            sy = 475 + i * 12
            ex = 570 + i * 9.8
            if side:
                ex = 1440 - ex
            x0 = -60 if side == 0 else 1500
            c1 = 185 if side == 0 else 1255
            c2 = 345 if side == 0 else 1095
            mid = 505 + i * 4 if side == 0 else 935 - i * 4
            ey = 738 + math.sin(i * .27) * 13
            d = f'M{x0} {sy} C{c1} {sy - 18}, {c2} {ey}, {mid} {ey} C{ex} {ey}, {ex} {ey + 68}, {ex} 845 V1170'
            paths.append((d, ex, i, side))
    # Glow is selective, not a broad neon stroke.
    for n, (d, ex, i, side) in enumerate(paths):
        if i in (2, 7, 12):
            parts.append(f'<path d="{d}" stroke="#d9e5ec" stroke-width="3.6" opacity=".14" filter="url(#soft)"/>')
        parts.append(f'<path id="data-route-{n}" d="{d}" stroke="url(#silver)" stroke-width="{.65 if i % 3 else 1.1}" opacity="{.48 if i % 4 else .9}"/>')
    # Sparse irregular real-world samples settle into a consistent central lane.
    for i in range(16):
        x = 604 + i * 15
        y = 652 + rng.random() * 75
        parts.append(f'<path d="M{x} {y:.1f} V1170" stroke="url(#vertical)" stroke-width=".65" opacity=".65"/>')
        for _ in range(2):
            ny = rng.uniform(735, 1105)
            size = rng.choice((1.1, 1.4, 2))
            parts.append(f'<circle cx="{x}" cy="{ny:.1f}" r="{size}" fill="#edf2f5" opacity=".75"/>')
    # The resolved region remains readable when motion is disabled: uniform records
    # sit on a common grid, while the edges retain irregular real-world samples.
    for row in range(3):
        for col in range(4):
            x, y = 626 + col * 60, 865 + row * 74
            parts.append(f'<g transform="translate({x} {y})" opacity=".38"><rect x="-7" y="-8" width="14" height="16" rx="1" stroke="#c4d5e1" stroke-width=".7"/><path d="M-3 -3 H3 M-3 1 H1" stroke="#c4d5e1" stroke-width=".7"/><path d="M2 5 l2 2 4-4" stroke="{("#bc2f5e" if (row + col) % 3 == 0 else "#c4d5e1")}" stroke-width="1"/></g>')
    # Edge nodes and a handful of sample frames, distinct from a starfield.
    for side in (0, 1):
        for i in range(18):
            x = rng.uniform(35, 255) if not side else rng.uniform(1185, 1405)
            y = rng.uniform(480, 650)
            parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.25" fill="#dce6ef" opacity=".7"/>')
        for i in range(3):
            x = 58 + i * 61 if not side else 1364 - i * 61
            y = 430 + i * 72
            parts.append(f'<path d="M{x} {y+14} V{y} H{x+16} M{x+24} {y+10} V{y+24} H{x+8}" stroke="#c3d0db" opacity=".38" stroke-width=".8"/>')
    # Grazing highlights follow the original VEX/B1 reference.
    parts.append('''<path d="M1080 177 L1302 417 Q1370 487 1480 483" stroke="url(#glint)" stroke-width="1.2"/>
    <path d="M1080 177 L1302 417" stroke="url(#glint)" stroke-width="4" filter="url(#soft)"/>
    <path d="M-80 122 L165 369" stroke="url(#glint)" stroke-width=".8" opacity=".5"/>
    <path d="M-70 985 L262 886" stroke="url(#glint)" stroke-width=".6" opacity=".5"/>
    <g id="moving-data">''')
    input_glyphs = (
        '<path d="M-8 5 V-6 H7 V5 Z M-7 3 l5-5 4 3 3-2 2 4"/><circle cx="3" cy="-3" r="1"/>',
        '<path d="M-9 0 H-6 l2-4 3 9 3-12 3 9 2-2 H9"/>',
        '<circle cx="-7" cy="-3" r="1.1"/><circle cx="-3" cy="4" r="1.1"/><circle cx="2" cy="-5" r="1.1"/><circle cx="6" cy="1" r="1.1"/><circle cx="1" cy="2" r="1.1"/>',
    )
    for i, route in enumerate((2, 6, 11, 17, 23, 29)):
        parts.append(f'''<g class="moving-sample" data-route="data-route-{route}" data-phase="{(i+.5)/6:.3f}" opacity="0">
          <g class="sample-raw" stroke="#dbe6ee" stroke-width=".85" stroke-linecap="round" stroke-linejoin="round">{input_glyphs[i % 3]}</g>
          <g class="sample-annotation" opacity="0" stroke="#e4edf2" stroke-width=".85"><path d="M-11 -4 V-10 H-5 M5 -10 H11 V-4 M11 4 V10 H5 M-5 10 H-11 V4"/><path d="M11 -7 H16" stroke="#bc2f5e" stroke-width="1.6"/></g>
          <g class="sample-record" opacity="0"><rect x="-7" y="-8" width="14" height="16" rx="1" fill="#050607" stroke="#dbe6ee" stroke-width=".85"/><path d="M-3 -3 H3 M-3 1 H1" stroke="#dbe6ee" stroke-width=".85"/><path d="M2 5 l2 2 4-4" stroke="#bc2f5e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>
        </g>''')
    parts.append('</g></svg>')
    return ''.join(parts)


def render_home(modal):
    current = ROOT / "templates/current-home.html"
    if current.exists():
        return current.read_text().replace("{{CONTACT_MODAL}}", modal)
    hero = '''<img class="hero-silk" src="/assets/selected/hero-P-hd-poster.png" width="2206" height="946" alt="" fetchpriority="high">
      <video class="hero-silk hero-video" data-hero-video data-desktop="/assets/selected/hero-P-hd-original.mp4" data-mobile="/assets/selected/hero-P-hd-original.mp4" width="2206" height="946" muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"></video>'''
    service_rows = []
    for number, title, description, asset, alt in (
        ('01', 'Real-World Data Collection', 'Multimodal, diverse, and high-quality data collection tailored for generative foundation models.', 'collection', 'Silver image, audio and sampled signals flow along a red ribbon into an organized dataset'),
        ('02', 'Domain-Expert Annotation', 'Specialized human-in-the-loop labeling, RLHF, and custom data curation.', 'annotation', 'Silver car and person linked by a brand-red data arc and annotation records'),
        ('03', 'End-to-End Evaluation', 'Robust benchmarking, bias mitigation, and model safety testing.', 'evaluation', 'Silver test records flow through a shield with a red check into verified outputs'),
    ):
        service_rows.append(f'''<article class="service-row"><span class="row-number" aria-hidden="true">{number}</span><div class="row-copy"><h3>{title}</h3><p>{description}</p></div><img class="service-art selected-service-art" src="/assets/selected/{asset}-alpha.webp" width="1200" height="900" loading="lazy" alt="{escape(alt, quote=True)}"></article>''')
    template = (ROOT / 'templates/dark-home.html').read_text()
    logo = (ROOT / 'dist/assets/logo-original.svg').read_text().replace('<svg ', '<svg class="brand-mark" focusable="false" ', 1)
    template = template.replace('{{LOGO_MARK}}', logo)
    for name, section in render_sections().items():
        template = template.replace('{{' + name + '}}', section)
    return template.replace('{{HERO_SVG}}', hero).replace('{{SERVICE_ROWS}}', ''.join(service_rows)).replace('{{CONTACT_MODAL}}', modal)
