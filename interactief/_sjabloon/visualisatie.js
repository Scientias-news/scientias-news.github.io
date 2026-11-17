(() => {
  'use strict';
  const invoer = document.getElementById('frequentie');
  const uitvoer = document.getElementById('uitvoer');
  const getal = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function bijwerken() {
    const mhz = Number(invoer.value);
    const meter = globalThis.ScientiasGolfModel.golflengte(mhz * 1e6);
    uitvoer.value = mhz + ' MHz: ' + getal.format(meter) + ' meter';
    invoer.setAttribute('aria-valuetext', mhz + ' megahertz');
  }
  invoer.addEventListener('input', bijwerken);
  bijwerken();
})();
