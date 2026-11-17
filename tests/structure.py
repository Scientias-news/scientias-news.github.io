"""Dependency-free checks: original bytes, local links, IDs and HTML references."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
original = (ROOT / 'interactief/voyager-1/index.html').read_bytes()
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
        for key in ('src', 'href'):
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
        assert page.scripts == ['physics.js', 'visualisatie.js', '../../assets/embed-child.js']
        assert '<style>' not in path.read_text() and '<script>' not in path.read_text()
        code = (path.parent / 'visualisatie.js').read_text()
        for target in re.findall(r"\$\('([^']+)'\)", code):
            assert target in page.ids, f'Missing UI element {target}'

for path in sources('*.md'):
    for target in re.findall(r'\]\(([^\s)]+)\)', path.read_text()):
        url = urlsplit(target)
        if url.scheme or url.netloc or not url.path:
            continue
        assert (path.parent / unquote(url.path)).resolve().exists(), (path, target)

print(f'Structure passed: {len(pages)} HTML pages, Markdown links, UI references and original Git blob verified.')
