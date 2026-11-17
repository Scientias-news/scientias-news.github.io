/* Proposal: install ONCE on Scientias.nl, not inside an article or an iframe. */
(() => {
  'use strict';
  if (window.ScientiasEmbedsInstalled) return;
  window.ScientiasEmbedsInstalled = true;
  const production = 'https://scientias-news.github.io';
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const frames = new Map();
  function originFor(frame) {
    try {
      const url = new URL(frame.src, location.href);
      if (url.origin === production || (local && url.hostname === location.hostname &&
          url.protocol === 'http:' && ['8000', '8001'].includes(url.port))) return url.origin;
    } catch (_) { /* Invalid URLs do not participate. */ }
    return null;
  }
  function init(frame) {
    const origin = originFor(frame), state = frames.get(frame);
    if (origin && state && frame.contentWindow) frame.contentWindow.postMessage({
      type: 'scientias:embed:init', version: 1, id: state.id
    }, origin);
  }
  function register(frame) {
    if (frames.has(frame) || !originFor(frame)) return;
    const id = window.crypto.randomUUID();
    frames.set(frame, { id });
    frame.addEventListener('load', () => init(frame));
    init(frame); // Also handles scripts loaded after an iframe has finished.
  }
  function scan() {
    document.querySelectorAll('iframe[data-scientias-embed]').forEach(register);
    for (const frame of frames.keys()) if (!frame.isConnected) frames.delete(frame);
  }
  window.addEventListener('message', (event) => {
    const d = event.data;
    if (!d || d.type !== 'scientias:embed:resize' || d.version !== 1 ||
        !Number.isFinite(d.height) || d.height < 100 || d.height > 30000) return;
    for (const [frame, state] of frames) {
      if (event.source !== frame.contentWindow || event.origin !== originFor(frame) ||
          d.id !== state.id) continue;
      const value = Math.ceil(d.height) + 'px';
      if (frame.style.height !== value) frame.style.height = value;
      return;
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
  // Gutenberg, lazy loaders and articles containing more than one visualization.
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
