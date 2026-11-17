"""Separate the existing default presentation from its unchanged comparison page."""
from pathlib import Path
import importlib.util


def build_delivery():
    root = Path(__file__).resolve().parent
    spec = importlib.util.spec_from_file_location('m12_delivery', root / 'm1-2/single_page_preview.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    comparison = module.apply_single_page_preview((root / 'm1-2/homepage.html').read_text())
    (root / 'dist/compare').mkdir(exist_ok=True)
    (root / 'dist/compare/index.html').write_text(comparison)
    final = comparison.replace('/meeting-r1-02-typography.js', '/final-default.js')
    for name in ['index.html', 'homepage.html']:
        (root / 'dist' / name).write_text(final)
    return final, comparison


if __name__ == '__main__':
    build_delivery()
