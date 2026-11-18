"""Dependency-free checks: original bytes, local links, IDs and HTML references."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
original = (ROOT / 'tests/fixtures/voyager-1-origineel.html.txt').read_bytes()
assert hashlib.sha1(b'blob ' + str(len(original)).encode() + b'\0' + original).hexdigest() == '971558a2a0b6ee0aa1f87a12ec4c1b896a46246c'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []
        self.aria = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('src', 'href', 'data-src'):
            if key in attrs:
                self.references.append(attrs[key])
        for key in ('aria-describedby', 'aria-labelledby'):
            self.aria.extend(attrs.get(key, '').split())
        if tag == 'script' and 'src' in attrs:
            self.scripts.append(attrs['src'])
        if tag == 'iframe':
            assert attrs.get('title'), 'Iframe needs a descriptive title'

def sources(pattern):
    return [p for p in ROOT.rglob(pattern)
            if not {'.git', 'node_modules', 'test-results'}.intersection(p.relative_to(ROOT).parts)]

pages = sources('*.html')
for path in pages:
    page = Page()
    page.feed(path.read_text())
    for target in page.references:
        url = urlsplit(target)
        if url.scheme or url.netloc:
            continue
        if not url.path:
            # JS-generated IDs in the original are not expected here.
            if url.fragment:
                assert unquote(url.fragment) in page.ids, (path, target)
            continue
        resolved = (path.parent / unquote(url.path)).resolve()
        assert resolved.is_relative_to(ROOT), (path, target)
        assert resolved.exists(), (path, target)
    for target in page.aria:
        assert target in page.ids, (path, target)
    if path.parent.name == 'voyager-1-v2':
        assert page.scripts == ['physics.js', 'visualisatie.js', '../../assets/v1/embed-child.js']
        assert '<style>' not in path.read_text() and '<script>' not in path.read_text()
        code = (path.parent / 'visualisatie.js').read_text()
        for target in re.findall(r"\$\('([^']+)'\)", code):
            assert target in page.ids, f'Missing UI element {target}'
    if path.parent.name == 'fijnstof-europese-steden':
        assert page.scripts == ['data.js', 'visualisatie.js', '../../assets/v1/embed-child.js']
        assert '<style>' not in path.read_text() and '<script>' not in path.read_text()
        for svg in ('kaart-europa.svg', 'kaart-benelux.svg'):
            assert ET.parse(path.parent / svg).getroot().tag == '{http://www.w3.org/2000/svg}svg'
        for font in re.findall(r'url\(["\']?(fonts/[^)"\']+)', (path.parent / 'style.css').read_text()):
            assert (path.parent / font).read_bytes().startswith(b'wOF2'), font

for path in sources('*.md'):
    for target in re.findall(r'\]\(([^\s)]+)\)', path.read_text()):
        url = urlsplit(target)
        if url.scheme or url.netloc or not url.path:
            continue
        assert (path.parent / unquote(url.path)).resolve().exists(), (path, target)

def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

# Shared files that live embeds load. A published version is frozen: put changes in a
# new folder (assets/v2/) instead, so old articles never change unnoticed.
FROZEN = {
    'assets/v1/basis.css': '2780c167fb840565fdc8efc23f3673475751347c',
    'assets/v1/embed-child.js': '433e63e573c5819b06392f9f9a5967217d02df01',
    'assets/v1/style.css': 'a094e2d9976aeb99d3eadcf64b7b9ca54ac20810',
}
for name, expected in FROZEN.items():
    assert blob((ROOT / name).read_bytes()) == expected, f'{name} is frozen; create assets/v2/ instead'
assert sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'assets/v1').iterdir()) == sorted(FROZEN), 'assets/v1 is frozen'

# Every published element lives directly under interactief/ and is self-contained.
# Elements deliberately left off the overview page go in NIET_IN_INDEX.
NIET_IN_INDEX = set()
elements = sorted(p for p in (ROOT / 'interactief').iterdir() if p.is_dir() and not p.name.startswith('_'))
overview = Page(); overview.feed((ROOT / 'index.html').read_text())
linked = {urlsplit(r).path.strip('/') for r in overview.references}
for element in elements:
    html = element / 'index.html'
    assert html.exists(), f'{element.name} needs its own index.html'
    text = html.read_text()
    assert '<html lang="nl">' in text and '<title>' in text and 'name="viewport"' in text, f'{element.name}: lang, title and viewport'
    page = Page(); page.feed(text)
    for target in page.scripts + page.references:
        url = urlsplit(target)
        if not (url.scheme or url.netloc):
            assert '/assets/' not in url.path or re.match(r'(\.\./)+assets/v\d+/', url.path), f'{element.name}: shared files only from assets/vN/ ({target})'
    for target in page.scripts:
        assert not urlsplit(target).netloc, f'{element.name}: no external scripts ({target})'
    if element.name not in NIET_IN_INDEX:
        assert f'interactief/{element.name}' in linked, f'{element.name} is missing from index.html (or add it to NIET_IN_INDEX in tests/structure.py)'
for name in NIET_IN_INDEX:
    assert (ROOT / 'interactief' / name).is_dir(), f'NIET_IN_INDEX lists unknown element {name}'

print(f'Elements passed: {len(elements)} elements, overview links and frozen assets verified.')
print(f'Structure passed: {len(pages)} HTML pages, Markdown links, UI references and original Git blob verified.')
