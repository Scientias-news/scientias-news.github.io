(() => {
  'use strict';
  const cities = globalThis.ScientiasFijnstofData;
  const chart = document.getElementById('aqmap');
  const input = document.getElementById('city-name');
  const suggestions = document.getElementById('city-names');
  const result = document.getElementById('city-result');
  const tip = document.createElement('div');
  tip.className = 'sc-tip';
  tip.setAttribute('aria-hidden', 'true');
  chart.appendChild(tip);

  const displayName = city => city[0] === 'Bruxelles / Brussel' ? 'Brussel' : city[0];
  const displayCountry = city => ({ Netherlands: 'Nederland', Belgium: 'België' })[city[1]] || city[1];
  const cityText = city => `${displayName(city)} (${displayCountry(city)}) · Fijnstof: ${city[4]} µg/m³ (${city[4] > 5 ? 'boven' : 'binnen'} het WHO-advies van 5) · Stikstofdioxide: ${city[5]} µg/m³ · Ozon: ${city[6]} µg/m³ · Plaats ${city[2]} van ${cities.length} · ${city[3].toLocaleString('nl-NL')} inwoners`;

  for (const city of cities) {
    const option = document.createElement('option');
    option.value = `${displayName(city)} (${displayCountry(city)})`;
    suggestions.appendChild(option);
  }

  let selected = [];
  let selectedIndex = -1;
  function select(index) {
    selectedIndex = index;
    selected.forEach(node => node.classList.remove('selected'));
    selected = Array.from(chart.querySelectorAll(`.city[data-i="${index}"]`));
    selected.forEach(node => node.classList.add('selected'));
    const city = cities[index];
    result.textContent = cityText(city);
    input.value = `${displayName(city)} (${displayCountry(city)})`;
  }

  async function loadMaps() {
    const holders = Array.from(chart.querySelectorAll('.sc-map-svg'));
    await Promise.all(holders.map(async holder => {
      try {
        const response = await fetch(holder.dataset.src);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        if (document.querySelector('parsererror')) throw new Error('Ongeldige SVG');
        holder.replaceChildren(document.documentElement);
      } catch (error) {
        holder.textContent = 'De kaart kon niet geladen worden. De Nederlandse en Belgische cijfers staan in de tabel hieronder.';
        console.error('Fijnstofkaart laden mislukt:', error);
      }
    }));
    if (selectedIndex >= 0) select(selectedIndex);
  }
  loadMaps();

  function show(node, clientX, clientY) {
    const city = cities[Number(node.dataset.i)];
    tip.textContent = cityText(city);
    tip.style.opacity = '1';
    const rect = chart.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    tip.style.left = `${Math.max(4, Math.min(x + 14, rect.width - width - 4))}px`;
    tip.style.top = `${y - height - 12 < 4 ? y + 16 : y - height - 12}px`;
  }

  chart.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const node = event.target.closest('.city');
    if (node && chart.contains(node)) show(node, event.clientX, event.clientY);
    else tip.style.opacity = '0';
  });
  chart.addEventListener('pointerleave', () => { tip.style.opacity = '0'; });
  chart.addEventListener('click', event => {
    const node = event.target.closest('.city');
    if (node && chart.contains(node)) {
      select(Number(node.dataset.i));
      tip.style.opacity = '0';
    }
  });
  function search() {
    const value = input.value.trim().toLocaleLowerCase('nl-NL');
    const index = cities.findIndex(city => `${displayName(city)} (${displayCountry(city)})`.toLocaleLowerCase('nl-NL') === value || city[0].toLocaleLowerCase('nl-NL') === value);
    if (index >= 0) select(index);
    else if (value) result.textContent = 'Geen exacte stad gevonden. Kies een naam uit de suggesties.';
  }
  input.addEventListener('change', search);
  input.addEventListener('input', () => {
    const value = input.value.trim().toLocaleLowerCase('nl-NL');
    if (cities.some(city => `${displayName(city)} (${displayCountry(city)})`.toLocaleLowerCase('nl-NL') === value)) search();
  });
})();
