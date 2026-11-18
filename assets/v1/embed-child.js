/* Runs inside a visualization. No WordPress access and no wildcard targetOrigin. */
(() => {
  'use strict';
  if (window.parent === window) return;
  const allowed = new Set(['https://scientias.nl', 'https://www.scientias.nl']);
  // Explicit local preview only. Never enables arbitrary production parents.
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    [8000, 8001].forEach((port) => allowed.add('http://' + location.hostname + ':' + port));
  }
  let peer = null, pending = 0, lastHeight = -1;
  function sendHeight() {
    pending = 0;
    if (!peer) return;
    // Measure content, not documentElement.scrollHeight, which cannot shrink
    // below the current iframe viewport and creates a resize feedback loop.
    const body = document.body;
    const rect = body.getBoundingClientRect();
    const css = getComputedStyle(body);
    const bottom = Math.max(...Array.from(body.children)
      .filter((node) => !['SCRIPT', 'STYLE', 'LINK'].includes(node.tagName))
      .map((node) => node.getBoundingClientRect().bottom), rect.bottom);
    const height = Math.ceil(Math.max(rect.height, bottom + window.scrollY) +
      (parseFloat(css.marginBottom) || 0));
    if (height < 100 || height > 30000 || height === lastHeight) return;
    lastHeight = height;
    window.parent.postMessage({ type: 'scientias:embed:resize', version: 1,
      id: peer.id, height }, peer.origin);
  }
  function queue() { if (!pending) pending = requestAnimationFrame(sendHeight); }
  window.addEventListener('message', (event) => {
    const d = event.data;
    if (event.source !== window.parent || !allowed.has(event.origin) ||
        !d || d.type !== 'scientias:embed:init' || d.version !== 1 ||
        typeof d.id !== 'string' || !d.id.length || d.id.length > 128) return;
    peer = { origin: event.origin, id: d.id }; lastHeight = -1; queue();
  });
  if ('ResizeObserver' in window) new ResizeObserver(queue).observe(document.body);
  else window.addEventListener('resize', queue);
  // Handles expanded details, changing milestones and loaded typefaces.
  new MutationObserver(queue).observe(document.body, {
    childList: true, subtree: true, characterData: true, attributes: true
  });
  window.addEventListener('load', queue);
  if (document.fonts) document.fonts.ready.then(queue);
})();
