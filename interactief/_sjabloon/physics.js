(() => {
  'use strict';
  const C_MS = 299792458;
  function golflengte(frequentieHz) {
    if (!Number.isFinite(frequentieHz) || frequentieHz <= 0) throw new RangeError('De frequentie moet positief zijn.');
    return C_MS / frequentieHz;
  }
  globalThis.ScientiasGolfModel = Object.freeze({ C_MS, golflengte });
})();
