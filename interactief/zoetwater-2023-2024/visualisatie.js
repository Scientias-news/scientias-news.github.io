(() => {
  'use strict';
  const D = globalThis.ScientiasZoetwaterData;
  const JAREN = D.jaren;
  const REGIO = { 1: 'Afrika', 2: 'Europa', 3: 'Noord-Azië en Siberië', 4: 'Azië', 5: 'Australië en Oceanië', 6: 'Zuid-Amerika', 7: 'Noord- en Midden-Amerika', 8: 'Arctisch Noord-Amerika' };
  const OORZAAK = { P: 'minder regen', ET: 'meer verdamping', S: 'bodem en grondwater hielden water vast', meer: 'geen daling: er stroomde meer water' };
  const DROOG_MM = 10;

  const bekkens = D.bekkens.map(r => ({
    id: r[0], regio: r[1], opp: r[2], basis: r[3], hoogte: r[4], p2324: r[5], dq: r[6],
    perJaar: r[7].split(',').map(v => (v === '' ? null : Number(v))),
    oorzaak: r[8], aandeel: r[9] ? r[9].split(',').map(Number) : null, naam: r[10]
  }));

  const $ = id => document.getElementById(id);
  const kaart = $('kaart');
  const status = $('status');
  const jaar = $('jaar');
  const jaarUit = $('jaar-uit');
  const knop2324 = $('periode-2324');
  const afspelen = $('afspelen');
  const period = $('period');
  const tip = document.createElement('div');
  tip.className = 'sc-tip';
  tip.setAttribute('aria-hidden', 'true');
  kaart.appendChild(tip);

  const state = { view: 'afvoer', samen: true, jaar: 2023, gekozen: -1 };
  let paden = [];

  const fmt = (v, d = 0) => v.toLocaleString('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const teken = v => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v), Math.abs(v) < 10 && v % 1 ? 1 : 0);

  function waarde(b) {
    if (state.samen) return b.p2324;
    return b.perJaar[JAREN.indexOf(state.jaar)];
  }
  function klasse(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return 'var(--n0)';
    if (v <= -30) return 'var(--d3)';
    if (v <= -15) return 'var(--d2)';
    if (v <= -5) return 'var(--d1)';
    if (v < 5) return 'var(--n0)';
    if (v < 15) return 'var(--w1)';
    if (v < 30) return 'var(--w2)';
    return 'var(--w3)';
  }
  function kleur(b) {
    if (state.view === 'oorzaak') return b.oorzaak ? `var(--c${b.oorzaak === 'meer' ? 'Meer' : b.oorzaak})` : '#F4F4F2';
    if (b.hoogte < DROOG_MM) return 'url(#droog)';
    return klasse(waarde(b));
  }
  function periodeTekst() { return state.samen ? '2023 en 2024' : `In ${state.jaar}`; }
  function omschrijving(b) {
    const plaats = b.naam ? `Bekken van de ${b.naam}` : `Rivierbekken in ${REGIO[b.regio]}`;
    const regels = [plaats];
    if (state.view === 'oorzaak') {
      if (!b.oorzaak) regels.push('Geen oorzaakberekening voor dit gebied.');
      else {
        regels.push(`Belangrijkste oorzaak: ${OORZAAK[b.oorzaak]}`);
        if (b.aandeel) regels.push(`Aandelen: regen ${b.aandeel[0]}%, verdamping ${b.aandeel[1]}%, bodem en grondwater ${b.aandeel[2]}%`);
      }
      regels.push(`2023 en 2024: ${richting(b.p2324)}`);
    } else {
      const v = waarde(b);
      if (b.hoogte < DROOG_MM) regels.push('Nauwelijks rivierwater: percentages zeggen hier weinig.');
      regels.push(`${state.samen ? '2023 en 2024' : 'In ' + state.jaar}: ${v === null ? 'geen gegevens' : richting(v)}`);
      if (state.samen) regels.push(`Dat is ${teken(b.dq)} kubieke kilometer per jaar`);
    }
    regels.push(`Oppervlakte: ${fmt(b.opp)} km²`);
    return regels.join('\n');
  }
  function richting(v) {
    if (Math.abs(v) < 0.5) return 'ongeveer normaal';
    return `${fmt(Math.abs(v), Math.abs(v) < 10 ? 1 : 0)}% ${v < 0 ? 'minder' : 'meer'} water dan normaal`;
  }

  function kleurAlles() {
    for (let i = 0; i < paden.length; i++) paden[i].style.fill = kleur(bekkens[i]);
    tekenTijdlijn();
    if (state.gekozen >= 0) status.textContent = omschrijving(bekkens[state.gekozen]).replace(/\n/g, ' · ');
  }

  function kies(i) {
    if (state.gekozen >= 0 && paden[state.gekozen]) paden[state.gekozen].classList.remove('selected');
    state.gekozen = i;
    if (i < 0) return;
    const p = paden[i];
    if (p) { p.classList.add('selected'); p.parentNode.appendChild(p); }
    status.textContent = omschrijving(bekkens[i]).replace(/\n/g, ' · ');
  }

  async function laadKaart() {
    const holder = kaart.querySelector('.sc-map-svg');
    try {
      const r = await fetch(holder.dataset.src);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const doc = new DOMParser().parseFromString(await r.text(), 'image/svg+xml');
      if (doc.querySelector('parsererror')) throw new Error('Ongeldige SVG');
      const svg = doc.documentElement;
      const ns = 'http://www.w3.org/2000/svg';
      const defs = doc.createElementNS(ns, 'defs');
      defs.innerHTML = '<pattern id="droog" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#F4F4F2"/><line x1="0" y1="0" x2="0" y2="4" stroke="#C8C8C4" stroke-width="1.2"/></pattern>';
      svg.insertBefore(defs, svg.firstChild);
      holder.replaceChildren(document.importNode(svg, true));
      paden = Array.from(holder.querySelectorAll('.bekken'));
      paden.sort((a, b) => a.dataset.i - b.dataset.i);
      kleurAlles();
    } catch (e) {
      holder.textContent = 'De kaart kon niet geladen worden. De cijfers per regio staan in de tabel hieronder.';
      console.error('Zoetwaterkaart laden mislukt:', e);
    }
  }

  function toonTip(node, x, y) {
    tip.textContent = omschrijving(bekkens[Number(node.dataset.i)]);
    tip.style.opacity = '1';
    const rect = kaart.getBoundingClientRect();
    const lx = x - rect.left, ly = y - rect.top;
    tip.style.left = `${Math.max(4, Math.min(lx + 14, rect.width - tip.offsetWidth - 4))}px`;
    tip.style.top = `${ly - tip.offsetHeight - 12 < 4 ? ly + 16 : ly - tip.offsetHeight - 12}px`;
  }
  kaart.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const n = e.target.closest('.bekken');
    if (n) toonTip(n, e.clientX, e.clientY); else tip.style.opacity = '0';
  });
  kaart.addEventListener('pointerleave', () => { tip.style.opacity = '0'; });
  kaart.addEventListener('click', e => {
    const n = e.target.closest('.bekken');
    if (n) { kies(Number(n.dataset.i)); tip.style.opacity = '0'; }
  });

  // Weergave
  function zetView(v) {
    state.view = v;
    $('view-afvoer').setAttribute('aria-pressed', String(v === 'afvoer'));
    $('view-oorzaak').setAttribute('aria-pressed', String(v === 'oorzaak'));
    $('legenda-afvoer').hidden = v !== 'afvoer';
    $('legenda-oorzaak').hidden = v !== 'oorzaak';
    period.hidden = v !== 'afvoer';
    if (v === 'oorzaak') { stop(); state.samen = true; zetPeriodeKnop(); }
    kleurAlles();
  }
  $('view-afvoer').addEventListener('click', () => zetView('afvoer'));
  $('view-oorzaak').addEventListener('click', () => zetView('oorzaak'));

  // Periode
  function zetPeriodeKnop() {
    knop2324.setAttribute('aria-pressed', String(state.samen));
    period.classList.toggle('dim', state.samen);
  }
  knop2324.addEventListener('click', () => { stop(); state.samen = true; zetPeriodeKnop(); kleurAlles(); });
  function zetJaar(j) {
    state.jaar = j; state.samen = false;
    jaar.value = String(j); jaarUit.textContent = String(j);
    zetPeriodeKnop(); kleurAlles();
  }
  jaar.addEventListener('input', () => { stop(); zetJaar(Number(jaar.value)); });

  // Afspelen: enkel op verzoek van de lezer
  let timer = null;
  const traag = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    afspelen.setAttribute('aria-pressed', 'false');
    afspelen.textContent = '▶';
    afspelen.setAttribute('aria-label', 'Speel de jaren 1991 tot 2025 af');
  }
  afspelen.addEventListener('click', () => {
    if (timer) { stop(); return; }
    let j = state.samen || state.jaar >= 2025 ? 1991 : state.jaar + 1;
    zetJaar(j);
    afspelen.setAttribute('aria-pressed', 'true');
    afspelen.textContent = '❚❚';
    afspelen.setAttribute('aria-label', 'Pauzeer');
    timer = setInterval(() => {
      if (document.hidden) return;
      j += 1;
      if (j > 2025) { stop(); return; }
      zetJaar(j);
    }, traag ? 1400 : 650);
  });

  // Tijdlijn: wereldwijde afwijking per jaar
  const T = { w: 720, h: 160, l: 36, r: 6, t: 14, b: 22 };
  let laatsteBreedte = 0;
  function tekenTijdlijn() {
    const holder = $('tijdlijn');
    T.w = Math.max(300, Math.round(holder.clientWidth || 720));
    laatsteBreedte = T.w;
    const smal = T.w < 520;
    const min = -8, max = 8;
    const y = v => T.t + (max - v) / (max - min) * (T.h - T.t - T.b);
    const bw = (T.w - T.l - T.r) / JAREN.length;
    let s = `<svg viewBox="0 0 ${T.w} ${T.h}" aria-hidden="true">`;
    for (const g of [-6, -3, 3, 6]) s += `<line class="grid" x1="${T.l}" x2="${T.w - T.r}" y1="${y(g)}" y2="${y(g)}"/><text x="${T.l - 6}" y="${y(g) + 4}" text-anchor="end">${g > 0 ? '+' : '−'}${Math.abs(g)}%</text>`;
    D.wereld.forEach((v, i) => {
      const j = JAREN[i];
      const x = T.l + i * bw + 1.5;
      const top = Math.min(y(v), y(0)), hgt = Math.max(1, Math.abs(y(v) - y(0)));
      const sel = state.view === 'afvoer' && (state.samen ? (j === 2023 || j === 2024) : j === state.jaar);
      const fill = v <= -5 ? 'var(--d2)' : v < 0 ? 'var(--d1)' : v < 5 ? 'var(--w1)' : 'var(--w2)';
      s += `<rect class="bar${sel ? ' sel' : ''}" data-j="${j}" x="${x}" y="${top}" width="${bw - 3}" height="${hgt}" rx="2" fill="${fill}"><title>${j}: ${teken(v)}%</title></rect>`;
      if ((smal ? j % 10 === 0 : j % 5 === 0) || j === 1991) s += `<text x="${x + (bw - 3) / 2}" y="${T.h - 6}" text-anchor="middle">${j}</text>`;
      if (j === 2023 || j === 2024) s += `<text class="lab" x="${x + (bw - 3) / 2 + (j === 2023 ? 2 : -2)}" y="${y(v) + 13}" text-anchor="${j === 2023 ? 'end' : 'start'}">${teken(v)}%</text>`;
    });
    s += `<line class="zero" x1="${T.l}" x2="${T.w - T.r}" y1="${y(0)}" y2="${y(0)}"/></svg>`;
    holder.innerHTML = s;
  }
  $('tijdlijn').addEventListener('click', e => {
    const b = e.target.closest('.bar');
    if (!b) return;
    if (state.view !== 'afvoer') zetView('afvoer');
    stop(); zetJaar(Number(b.dataset.j));
  });

  // Rivierkeuze
  const sel = $('rivier');
  const rivieren = [];
  bekkens.forEach((b, i) => { if (b.naam) rivieren.push([b.naam, i]); });
  rivieren.sort((a, b) => a[0].localeCompare(b[0], 'nl'));
  for (const [n, i] of rivieren) { const o = document.createElement('option'); o.value = String(i); o.textContent = n; sel.appendChild(o); }
  sel.addEventListener('change', () => { if (sel.value !== '') kies(Number(sel.value)); });

  // Tabellen
  const regio = {};
  for (const b of bekkens) { const r = regio[b.regio] || (regio[b.regio] = { basis: 0, dq: 0 }); r.basis += b.basis; r.dq += b.dq; }
  const somAbs = Object.values(regio).reduce((s, r) => s + Math.abs(r.dq), 0);
  const tbR = $('tabel-regio').querySelector('tbody');
  Object.entries(regio).sort((a, b) => a[1].dq - b[1].dq).forEach(([k, r]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${REGIO[k]}</td><td class="n">${teken(100 * r.dq / r.basis)}%</td><td class="n">${teken(r.dq)}</td><td class="n">${teken(100 * r.dq / somAbs)}%</td>`;
    tbR.appendChild(tr);
  });
  const tbV = $('tabel-rivier').querySelector('tbody');
  for (const [n, i] of rivieren) {
    const b = bekkens[i];
    const pj = j => { const v = b.perJaar[JAREN.indexOf(j)]; return v === null ? '–' : teken(v) + '%'; };
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${n}</td><td class="n">${teken(b.p2324)}%</td><td class="n">${pj(2023)}</td><td class="n">${pj(2024)}</td><td class="n">${pj(2025)}</td>`;
    tbV.appendChild(tr);
  }

  if ('ResizeObserver' in window) new ResizeObserver(() => { if (Math.abs($('tijdlijn').clientWidth - laatsteBreedte) > 4) tekenTijdlijn(); }).observe($('tijdlijn'));
  zetPeriodeKnop();
  tekenTijdlijn();
  laadKaart();
})();
