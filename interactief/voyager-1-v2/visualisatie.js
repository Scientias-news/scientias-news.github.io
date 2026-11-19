(() => {
'use strict';
const {
  AU_KM, C_KMS, LD_AU, LY_AU, DAY_MS, YEAR_MS, J2000, D2R, v3, PLANETS, planetPos, earthPos,
  T_LAUNCH, T_JUP, T_LD, V_DIR, dsdt, voyagerPos, STARS, starPos, C_AU_MS, T_MAX, T_JOIN_MS,
  yearOf, tOfYear, distEarth, OORT_IN, OORT_OUT, closest, whenAt, whenCloserThanSun, makeSignal,
  tToFrac, fracToT
} = globalThis.ScientiasVoyagerPhysics;
var raf = 0, timer = 0, dirty = true, visible = true, last = 0, uiTick = 0, drawTick = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = (id) => document.getElementById(id);
const canvas = $('map'), ctx = canvas.getContext('2d');
const nf0 = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ramp = (x, a, b) => clamp((x - a) / (b - a), 0, 1);
const pad = (n) => String(n).padStart(2, '0');
// ---------- afgeleide mijlpalen ----------
const starByName = (n) => STARS.find((s) => s.name === n);
const [gDist, gT] = closest(starByName('Gliese 445'));
const [pDist, pT] = closest(starByName('Proxima Centauri'));
const fmtYear = (y) => (y < 10000 ? String(y) : nf0.format(y));
const roundYear = (t, r) => fmtYear(Math.round(yearOf(t) / r) * r);

const gFirst = whenCloserThanSun(starByName('Gliese 445'));

const MS = [
  { t: T_LAUNCH, title: 'Lancering', v: 3.5, sp: 5,
    text: 'Een Titan-raket lanceert Voyager 1 vanaf Cape Canaveral in Florida. De sonde vertrekt zestien dagen na zijn tweeling Voyager 2, maar op een snellere route. Daardoor komt Voyager 1 als eerste bij Jupiter en Saturnus aan.' },
  { t: T_JUP, title: 'Langs Jupiter', v: 8, sp: 4,
    text: 'Voyager 1 scheert langs Jupiter, op zo\'n 350.000 kilometer van het midden van de planeet. Vier dagen later ontdekken onderzoekers op zijn foto\'s uitbarstende vulkanen op de maan Io: de eerste actieve vulkanen die ooit buiten de aarde zijn gezien. De zwaartekracht van Jupiter geeft de sonde een zwieper richting Saturnus.' },
  { t: Date.UTC(1980, 10, 12, 12), title: 'Saturnus en Titan', v: 14, sp: 5,
    text: 'NASA wil de grote maan Titan, met haar dikke dampkring, van dichtbij bekijken. Die route slingert Voyager 1 schuin omhoog, weg uit het vlak waarin de planeten draaien. Andere planeten kan hij daarna niet meer bezoeken.' },
  { t: Date.UTC(1990, 1, 14, 12), title: 'Pale Blue Dot', v: 55, sp: 6,
    text: 'Op 6 miljard kilometer draait Voyager 1 zijn camera nog één keer om. De aarde is op de foto een stipje van minder dan een pixel: de beroemde Pale Blue Dot. Kort daarna gaan de camera\'s voorgoed uit om stroom te sparen.' },
  { t: Date.UTC(1998, 1, 17, 12), title: 'Verder dan ooit', v: 90, sp: 6,
    text: 'Voyager 1 haalt de oudere sonde Pioneer 10 in, op 69 keer de afstand tussen aarde en zon. Sindsdien is hij het verste voorwerp dat mensen ooit de ruimte in hebben gestuurd.' },
  { t: Date.UTC(2004, 11, 16, 12), title: 'De zonnewind remt af', v: 130, sp: 6,
    text: 'De zon blaast voortdurend geladen deeltjes uit: de zonnewind. Op 94 keer de afstand tussen aarde en zon begint het gas tussen de sterren tegen te duwen, en remt die wind abrupt af: van zo\'n 1,6 miljoen naar 400.000 kilometer per uur. Die grens heet de terminatieschok.' },
  { t: Date.UTC(2012, 7, 25, 12), title: 'Tussen de sterren', v: 180, sp: 6,
    text: 'Voyager 1 verlaat de bel die de zonnewind rond het zonnestelsel blaast: de heliosfeer. Op zo\'n 122 keer de afstand tussen aarde en zon wordt hij het eerste mensgemaakte voorwerp in de interstellaire ruimte, de ruimte tussen de sterren. Formeel hoort hij nog bij het zonnestelsel, want de zwaartekracht van de zon reikt veel verder.' },
  { t: Date.UTC(2023, 10, 14, 12), title: 'Onleesbare berichten', v: 230, sp: 5,
    text: 'Voyager 1 stuurt plots onleesbare gegevens door. Na maanden speurwerk blijkt één geheugenchip defect. De ingenieurs verspreiden de getroffen software over andere stukjes geheugen, op ruim 24 miljard kilometer afstand. Op 20 april 2024 komt er weer bruikbare informatie binnen.' },
  { t: Date.UTC(2026, 3, 17, 12), title: 'Nog twee instrumenten', v: 230, sp: 4,
    text: 'De kernbatterij levert elk jaar minder stroom. Daarom schakelde NASA in februari 2025 en april 2026 nog twee meetinstrumenten uit. Van de oorspronkelijke tien werken er nog twee: een meter voor magnetische velden en een instrument dat golven opvangt in het ijle, elektrisch geladen gas tussen de sterren.' },
  { t: T_LD, label: '18 nov 2026, 11.16 uur', title: 'Eén lichtdag', v: 260, sp: 2,
    text: 'Om 11.16 uur Nederlandse en Belgische tijd staat Voyager 1 zo\'n 25,9 miljard kilometer van de aarde: zo ver als licht in precies 24 uur reist. Een commando van NASA doet er nu een volle dag over, een vraag en een antwoord samen twee dagen. Geen ander mensgemaakt voorwerp kwam ooit zo ver. Door de baan van de aarde schommelt de afstand nog wat, maar onder één lichtdag zakt hij niet meer. Voyager 2 bereikt die afstand pas rond november 2035.' },
  { t: Date.UTC(2036, 0, 1), label: 'rond 2036', title: 'Buiten bereik (verwacht)', v: 300, sp: 7,
    text: 'De stroom raakt stilaan op. Volgens NASA kunnen de grote antennes op aarde Voyager 1 nog tot ongeveer 2036 horen, als hij dan nog genoeg stroom heeft om een signaal te sturen. Daarna reist hij koud en zwijgend verder.' },
  { t: whenAt(OORT_IN), label: 'rond ' + roundYear(whenAt(OORT_IN), 100), title: 'De Oortwolk begint', v: 4000, sp: 8,
    text: 'Na zo\'n 300 jaar bereikt Voyager 1 de binnenrand van de Oortwolk: een reusachtige schil van ijsbrokken die vermoedelijk rond het zonnestelsel ligt en waar veel kometen vandaan komen. Niemand heeft de Oortwolk ooit rechtstreeks gezien; de grenzen zijn schattingen.' },
  { t: pT, label: 'rond ' + roundYear(pT, 100), title: 'Dichtst bij Proxima Centauri', v: 6 * LY_AU, sp: 9,
    text: 'Proxima Centauri, nu de ster die het dichtst bij de zon staat, komt het dichtst bij Voyager 1: op ' + nf1.format(pDist / LY_AU) + ' lichtjaar. Dat is amper dichter dan vandaag (4,2 lichtjaar), want Voyager vliegt een heel andere richting uit.' },
  { t: whenAt(OORT_OUT), label: 'rond ' + roundYear(whenAt(OORT_OUT), 1000), title: 'Uit de Oortwolk', v: 4 * LY_AU, sp: 9,
    text: 'Na zo\'n 30.000 jaar door de Oortwolk verlaat Voyager 1 het gebied waar de zwaartekracht van de zon nog iets vasthoudt. Pas nu laat hij het zonnestelsel echt achter zich.' },
  { t: gFirst, label: 'rond ' + roundYear(gFirst, 100), title: 'Dichter bij een andere ster', v: 7 * LY_AU, sp: 9,
    text: 'Voor het eerst staat Voyager 1 dichter bij een andere ster dan bij de zon: de rode dwerg Gliese 445, die met ruim 110 kilometer per seconde op het zonnestelsel af raast. Dit is het moment waar NASA "over 40.000 jaar" voor noemt.' },
  { t: gT, label: 'rond ' + roundYear(gT, 100), title: 'Langs Gliese 445', v: 7 * LY_AU, sp: 9,
    text: 'Voyager 1 passeert Gliese 445 op zijn dichtst, op ' + nf1.format(gDist / LY_AU) + ' lichtjaar. NASA noemt doorgaans 1,6 à 1,7 lichtjaar; deze kaart volgt een nieuwere berekening met metingen van de Gaia-satelliet, die op 1,9 lichtjaar uitkomt.' },
  { t: T_LD + 302700 * YEAR_MS, label: 'rond 305.000', title: 'Dichtste bekende ontmoeting', v: 25 * LY_AU, sp: 10,
    text: 'Volgens dezelfde Gaia-studie volgt de dichtste ontmoeting die we nu kennen pas over ruim 300.000 jaar: de ster TYC 3135-52-1, op net geen lichtjaar. Die ster staat niet op deze kaart.' },
  { t: T_MAX, label: '+ 1 miljoen jaar', title: 'Een miljoen jaar onderweg', v: 75 * LY_AU, sp: 10,
    text: 'Voyager 1 is nu zo\'n 55 lichtjaar van de zon. Aan boord zit nog altijd de gouden plaat met geluiden en beelden van de aarde. Samen met de zon draait de sonde rond het centrum van de Melkweg; één rondje duurt ongeveer 230 miljoen jaar.' }
];

// ---------- toestand ----------
const SPEEDS = [
  ['echte tijd', 1], ['1 minuut/s', 60], ['1 uur/s', 3600], ['1 dag/s', 86400], ['1 week/s', 604800],
  ['1 maand/s', 2629800], ['1 jaar/s', 31557600], ['10 jaar/s', 315576000], ['100 jaar/s', 3155760000],
  ['1.000 jaar/s', 31557600000], ['10.000 jaar/s', 315576000000]
];
const V_LON = Math.atan2(V_DIR[1], V_DIR[0]);
const YAW0 = 32 * D2R - V_LON, PITCH0 = 1.0;
const S = { t: Date.now(), live: true, playing: true, sp: 0, dir: 1, yaw: YAW0, pitch: PITCH0,
  zoom: 0, tz: 0, follow: true, dragSlider: false, signals: [] };

let W = 0, H = 0, CX = 0, CY = 0;
function resize() {
  const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  W = r.width; H = r.height;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  CX = W * (W < 560 ? 0.34 : 0.4); CY = H * 0.64;
  invalidate();
}
if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
else window.addEventListener('resize', resize);
resize();

// ---------- projectie ----------
const F = { cy: 1, sy: 0, cp: 1, sp: 0, k: 1 };
function setFrame() {
  F.cy = Math.cos(S.yaw); F.sy = Math.sin(S.yaw); F.cp = Math.cos(S.pitch); F.sp = Math.sin(S.pitch); F.k = Math.pow(10, S.zoom);
}
function proj(p) {
  const x1 = p[0] * F.cy - p[1] * F.sy, y1 = p[0] * F.sy + p[1] * F.cy;
  return [CX + x1 * F.k, CY - (y1 * F.cp + p[2] * F.sp) * F.k];
}
function offsetAU(p) {
  const x1 = p[0] * F.cy - p[1] * F.sy, y1 = p[0] * F.sy + p[1] * F.cy;
  return Math.hypot(x1, y1 * F.cp + p[2] * F.sp);
}
const zoomForRadius = (r) => Math.log10(0.42 * Math.min(W, H) / r);
const ZMIN = -5.2, ZMAX = 3.2;
function followZoom() {
  const off = offsetAU(voyagerPos(S.t));
  const avail = Math.min(W - CX - 70, CY - 30);
  return Math.log10(0.82 * Math.max(60, avail) / Math.max(off, 12));
}

// ---------- vaste geometrie ----------
const ORBITS = PLANETS.map((p) => {
  const per = 360 / p.n * 36525 * DAY_MS, pts = [];
  for (let i = 0; i <= 180; i++) pts.push(planetPos(p, J2000 + per * i / 180));
  return pts;
});
const PATH = [];
for (let i = 0; i <= 400; i++) { const t = T_LAUNCH + (Date.UTC(1982, 6, 1) - T_LAUNCH) * i / 400; PATH.push([t, voyagerPos(t)]); }
const OORT = (() => {
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts = [], a = Math.log10(OORT_IN), b = Math.log10(OORT_OUT);
  for (let i = 0; i < 1600; i++) {
    const r = Math.pow(10, a + Math.pow(rnd(), 0.7) * (b - a));
    const z = 2 * rnd() - 1, ph = 2 * Math.PI * rnd(), q = Math.sqrt(1 - z * z);
    pts.push([r * q * Math.cos(ph), r * q * Math.sin(ph), r * z]);
  }
  return pts;
})();
const LH = C_KMS * 3600 / AU_KM;
const RINGS = [
  [LH / 6, '10 lichtminuten'], [LH, '1 lichtuur'], [LD_AU * 7, '1 lichtweek'], [LD_AU * 30.44, '1 lichtmaand'],
  [LY_AU, '1 lichtjaar'], [2 * LY_AU, '2 lichtjaar'], [5 * LY_AU, '5 lichtjaar'], [10 * LY_AU, '10 lichtjaar'],
  [20 * LY_AU, '20 lichtjaar'], [50 * LY_AU, '50 lichtjaar']
];
const PCOL = { Jupiter: '#7A7A7A', Saturnus: '#999999', Mars: '#666666' };

// ---------- tekenen ----------
function label(x, y, txt, col, align = 'left', size = 11, weight = 400) {
  ctx.font = `${weight} ${size}px Montserrat,"Helvetica Neue",Arial,sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width, left = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  if (left < 6) x += 6 - left; else if (left + w > W - 6) x -= left + w - (W - 6);
  ctx.save(); ctx.lineWidth = 3; ctx.setLineDash([]); ctx.strokeStyle = PAL.halo; ctx.strokeText(txt, x, y);
  ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore();
}
const onScreen = (p, m = 40) => p[0] > -m && p[0] < W + m && p[1] > -m && p[1] < H + m;
function clipSeg(a, b, lim = 40000) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  return L > lim ? [a[0] + dx * lim / L, a[1] + dy * lim / L] : b;
}

const PAL_L = { oort: [120, 120, 120], oortA: 0.7, ring: [140, 140, 140], ringA: 0.8, ringLbl: [89, 89, 89], helioFillA: 0.2, helio: [79, 163, 111],
  orbit: [0, 0, 0], orbitA: 0.22, trail: [0, 0, 0], star: [0, 0, 0], gl: [44, 89, 65], starLbl: [51, 51, 51], glLbl: [44, 89, 65],
  near: [44, 89, 65], nearLbl: '#2C5941', sunLbl: '#000000', pLbl: [89, 89, 89], earth: '#000000', earthLbl: '#000000', ld: [0, 0, 0],
  voy: '#2C5941', voyRGB: [44, 89, 65], voyLbl: '#2C5941', dotStroke: '#fff', halo: 'rgba(255,255,255,.92)', sig: [0, 0, 0], sigDot: '#000000', sigLbl: '#000000' };
const PAL_D = { oort: [179, 179, 179], oortA: 0.75, ring: [255, 255, 255], ringA: 0.3, ringLbl: [179, 179, 179], helioFillA: 0.2, helio: [79, 163, 111],
  orbit: [255, 255, 255], orbitA: 0.24, trail: [255, 255, 255], star: [255, 255, 255], gl: [201, 224, 208], starLbl: [204, 204, 204], glLbl: [201, 224, 208],
  near: [79, 163, 111], nearLbl: '#C9E0D0', sunLbl: '#ffffff', pLbl: [179, 179, 179], earth: '#ffffff', earthLbl: '#ffffff', ld: [255, 255, 255],
  voy: '#4FA36F', voyRGB: [79, 163, 111], voyLbl: '#C9E0D0', dotStroke: '#000000', halo: 'rgba(0,0,0,.9)', sig: [255, 255, 255], sigDot: '#ffffff', sigLbl: '#ffffff' };
let PAL = PAL_L;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function draw() {
  const t = S.t, k = F.k, maxD = Math.hypot(W, H);
  ctx.clearRect(0, 0, W, H);
  const V = voyagerPos(t), E = earthPos(t), vp = proj(V);

  // Oortwolk
  if (OORT_IN * k < maxD * 2 && OORT_OUT * k > 30) {
    const a = PAL.oortA * ramp(OORT_OUT * k, 30, 200);
    ctx.fillStyle = rgba(PAL.oort, a);
    for (const p of OORT) { const q = proj(p); if (onScreen(q, 2)) ctx.fillRect(q[0], q[1], 1.4, 1.4); }
    const r = Math.max(OORT_IN * k * 1.5, Math.min(W, H) * 0.12);
    const lp = [CX - r * 0.72, CY + r * 0.72 * F.cp + 14];
    if (OORT_IN * k * 1.5 < Math.min(W, H) * 0.6 && onScreen(lp, -20)) label(lp[0], lp[1], 'Oortwolk (vermoedelijk)', rgba(PAL.ringLbl, Math.min(1, a * 1.5)), 'center');
  }

  // afstandsringen in het vlak van de planeten
  ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
  for (const [au, txt] of RINGS) {
    const rp = au * k; if (rp < 26 || rp > maxD * 4) continue;
    const a = ramp(rp, 26, 70) * (1 - ramp(rp, maxD * 1.2, maxD * 4));
    ctx.strokeStyle = rgba(PAL.ring, PAL.ringA * a);
    ctx.beginPath(); ctx.ellipse(CX, CY, rp, rp * F.cp, 0, 0, 2 * Math.PI); ctx.stroke();
    const lp = [CX - rp * 0.82, CY + rp * F.cp * 0.57];
    if (onScreen(lp, -10)) label(lp[0], lp[1], txt, rgba(PAL.ringLbl, a), 'center', 11);
  }
  ctx.setLineDash([]);

  // heliosfeer (vereenvoudigd als bol)
  const hr = 121.6 * k;
  if (hr > 18 && hr < maxD * 2) {
    const a = ramp(hr, 18, 60) * (1 - ramp(hr, maxD * 0.8, maxD * 2));
    const g = ctx.createRadialGradient(CX, CY, hr * 0.2, CX, CY, hr);
    g.addColorStop(0, rgba(PAL.helio, 0)); g.addColorStop(1, rgba(PAL.helio, PAL.helioFillA * a));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, hr, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = rgba(PAL.helio, 0.45 * a); ctx.beginPath(); ctx.arc(CX, CY, hr, 0, 2 * Math.PI); ctx.stroke();
    if (hr > 50) label(CX - hr * 0.71, CY - hr * 0.71 - 8, 'heliopauze (rand van de zonnewind)', rgba(PAL.helio, a), 'center', 11, 500);
  }

  // planeetbanen
  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i], rp = p.a * k; if (rp < 5 || rp > maxD * 6) continue;
    ctx.strokeStyle = rgba(PAL.orbit, PAL.orbitA * ramp(rp, 5, 25));
    ctx.beginPath();
    ORBITS[i].forEach((q, j) => { const s2 = proj(q); j ? ctx.lineTo(s2[0], s2[1]) : ctx.moveTo(s2[0], s2[1]); });
    ctx.stroke();
  }

  // sterren
  const lyk = LY_AU * k;
  let near = null;
  for (const s of STARS) {
    const p = starPos(s, t), d = v3.len(v3.sub(p, V));
    if (!near || d < near.d) near = { s, p, d };
    if (lyk < 3) continue;
    const q = proj(p); if (!onScreen(q, 60)) continue;
    const q0 = clipSeg(q, proj(starPos(s, t - 30000 * YEAR_MS)));
    const a = ramp(lyk, 3, 12);
    ctx.strokeStyle = rgba(PAL.trail, 0.2 * a); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    const special = s.name === 'Gliese 445';
    ctx.fillStyle = rgba(special ? PAL.gl : PAL.star, a);
    ctx.beginPath(); ctx.arc(q[0], q[1], special ? 3.4 : 2.4, 0, 2 * Math.PI); ctx.fill();
    const nearV = Math.hypot(q[0] - vp[0], q[1] - vp[1]) < 60 && q[1] <= vp[1] + 14;
    if (lyk > 10) label(q[0] + (nearV ? -7 : 7), q[1] + (nearV ? 4 : 0) + (s.name === 'Proxima Centauri' ? 12 : 0), s.name,
      rgba(special ? PAL.glLbl : PAL.starLbl, a), nearV ? 'right' : 'left', 11, special ? 700 : 500);
  }
  if (near && lyk > 6) {
    const q = proj(near.p);
    ctx.setLineDash([3, 5]); ctx.strokeStyle = rgba(PAL.near, 0.55);
    ctx.beginPath(); ctx.moveTo(vp[0], vp[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.setLineDash([]);
    const m = [(vp[0] + q[0]) / 2, (vp[1] + q[1]) / 2];
    if (onScreen(m, -10)) label(m[0], m[1] - 9, nf1.format(near.d / LY_AU) + ' lichtjaar', PAL.nearLbl, 'center', 11, 700);
  }

  // zon
  const sg = ctx.createRadialGradient(CX, CY, 0, CX, CY, 13);
  sg.addColorStop(0, 'rgba(236,160,48,1)'); sg.addColorStop(0.3, 'rgba(240,176,74,.65)'); sg.addColorStop(1, 'rgba(240,176,74,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(CX, CY, 13, 0, 2 * Math.PI); ctx.fill();
  if (30 * k < 30) label(CX + 10, CY + 12, 'Zon', PAL.sunLbl, 'left', 11, 500);

  // planeten
  for (const p of PLANETS) {
    const rp = p.a * k; if (rp < 5) continue;
    const q = proj(planetPos(p, t)); if (!onScreen(q)) continue;
    const a = ramp(rp, 5, 18);
    ctx.globalAlpha = a; ctx.fillStyle = p.name === 'Aarde' ? PAL.earth : (PCOL[p.name] || '#808080');
    ctx.beginPath(); ctx.arc(q[0], q[1], p.r, 0, 2 * Math.PI); ctx.fill(); ctx.globalAlpha = 1;
    const pv = Math.hypot(q[0] - vp[0], q[1] - vp[1]) < 40;
    if (rp > 24 || (p.name === 'Aarde' && rp > 8)) label(pv ? q[0] - p.r - 4 : q[0] + p.r + 4, q[1] + (pv ? 10 : -1), p.name,
      p.name === 'Aarde' ? PAL.earthLbl : rgba(PAL.pLbl, a), pv ? 'right' : 'left', 11, 500);
  }

  // één lichtdag rond de aarde
  const ldr = LD_AU * k;
  if (ldr > 30 && ldr < maxD * 2.5) {
    const ep = proj(E), a = ramp(ldr, 30, 80) * (1 - ramp(ldr, maxD, maxD * 2.5));
    ctx.setLineDash([5, 5]); ctx.strokeStyle = rgba(PAL.ld, 0.6 * a);
    ctx.beginPath(); ctx.arc(ep[0], ep[1], ldr, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    const lp = [ep[0] - ldr * 0.94, ep[1] + ldr * 0.34];
    if (lp[1] > 70 && lp[1] < H - 40 && lp[0] > -200) label(lp[0] - 6, lp[1], '1 lichtdag van de aarde', rgba(PAL.ld, a), 'right', 11, 700);
  }

  // baan van Voyager
  ctx.lineWidth = 2.2; ctx.strokeStyle = PAL.voy; ctx.beginPath();
  let started = false, prev = null;
  for (const [pt, pp] of PATH) {
    if (pt > t) break;
    const q = proj(pp); started ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); started = true; prev = q;
  }
  if (started) { const e = clipSeg(prev, vp); ctx.lineTo(e[0], e[1]); }
  ctx.stroke();
  const viewAU = maxD / k * 3;
  const tFut = Math.min(T_MAX, Math.max(t, T_JOIN_MS) + (viewAU / V_INF_AUYR()) * YEAR_MS);
  ctx.lineWidth = 1.6; ctx.setLineDash([5, 6]); ctx.strokeStyle = rgba(PAL.voyRGB, 0.5); ctx.beginPath();
  ctx.moveTo(vp[0], vp[1]); let last = vp;
  for (const [pt, pp] of PATH) { if (pt <= t) continue; const q = proj(pp); ctx.lineTo(q[0], q[1]); last = q; }
  if (tFut > t) { const e = clipSeg(last, proj(voyagerPos(tFut))); ctx.lineTo(e[0], e[1]); }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;

  for (const sg2 of S.signals) drawSignal(sg2, t, k, maxD);

  // hoogte boven het vlak van de planeten
  const foot = proj([V[0], V[1], 0]);
  if (Math.hypot(foot[0] - vp[0], foot[1] - vp[1]) > 8 && onScreen(vp, 0)) {
    ctx.setLineDash([2, 3]); ctx.strokeStyle = rgba(PAL.voyRGB, 0.4);
    ctx.beginPath(); ctx.moveTo(vp[0], vp[1]); ctx.lineTo(foot[0], foot[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(foot[0], foot[1], 4, 4 * F.cp + 0.5, 0, 0, 2 * Math.PI); ctx.stroke();
  }

  // Voyager zelf
  const vg = ctx.createRadialGradient(vp[0], vp[1], 0, vp[0], vp[1], 16);
  vg.addColorStop(0, rgba(PAL.voyRGB, 0.4)); vg.addColorStop(1, rgba(PAL.voyRGB, 0));
  ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(vp[0], vp[1], 16, 0, 2 * Math.PI); ctx.fill();
  ctx.fillStyle = PAL.voy; ctx.strokeStyle = PAL.dotStroke; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(vp[0], vp[1], 4.5, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
  label(vp[0] + 10, vp[1] - 11, 'Voyager 1', PAL.voyLbl, 'left', 13, 700);

  updateScale(k);
  return near;
}

const V_INF_AUYR = () => dsdt(1e9);

// lichtsignaal: heen naar Voyager, en het antwoord terug
function drawSignal(s, t, k, maxD) {
  if (t < s.te || t > s.tr) return;
  const out = t < s.ta;
  const c0 = out ? earthPos(s.te) : voyagerPos(s.ta);
  const c1 = out ? voyagerPos(s.ta) : earthPos(s.tr);
  const f = out ? (t - s.te) / (s.ta - s.te) : (t - s.ta) / (s.tr - s.ta);
  const r = C_AU_MS * (t - (out ? s.te : s.ta)) * k;
  const p0 = proj(c0), p1 = proj(c1);
  if (r > 1 && r < maxD * 3) {
    ctx.strokeStyle = rgba(PAL.sig, out ? 0.55 : 0.3);
    ctx.setLineDash(out ? [] : [3, 4]);
    ctx.beginPath(); ctx.arc(p0[0], p0[1], r, 0, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.strokeStyle = rgba(PAL.sig, out ? 0.4 : 0.22);
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
  const x = p0[0] + (p1[0] - p0[0]) * f, y = p0[1] + (p1[1] - p0[1]) * f;
  ctx.fillStyle = PAL.sigDot; ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI); ctx.fill();
  if (s.msg && out) label(x + 8, y + 10, '“' + s.msg + '”', PAL.sigLbl, 'left', 12, 700);
}

// schaalbalk
function niceNum(x) { const e = Math.pow(10, Math.floor(Math.log10(x))), m = x / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }
function kmDec(km) {
  if (km >= 1e12) return nf1.format(km / 1e12) + ' biljoen km';
  if (km >= 1e9) return nf1.format(km / 1e9) + ' miljard km';
  if (km >= 1e6) return nf0.format(km / 1e6) + ' miljoen km';
  return nf0.format(Math.round(km / 1000) * 1000) + ' km';
}
function kmWords(km) {
  if (km >= 1e15) return nf0.format(km / 1e15) + ' biljard km';
  if (km >= 1e12) return nf0.format(km / 1e12) + ' biljoen km';
  if (km >= 1e9) return nf0.format(km / 1e9) + ' miljard km';
  if (km >= 1e6) return nf0.format(km / 1e6) + ' miljoen km';
  return nf0.format(km) + ' km';
}
let lastScale = '';
function updateScale(k) {
  const target = 110 / k; let au, txt;
  if (target < 4000) { const km = niceNum(target * AU_KM); au = km / AU_KM; txt = kmWords(km); }
  else { const ly = niceNum(target / LY_AU); au = ly * LY_AU; txt = (ly < 1 ? nf1.format(ly) : nf0.format(ly)) + (ly === 1 ? ' lichtjaar' : ' lichtjaar'); }
  const px = Math.round(au * k), key = px + txt;
  if (key !== lastScale) { $('scaleBar').style.width = px + 'px'; $('scaleLbl').textContent = txt; lastScale = key; }
}

// ---------- tekst en opmaak ----------
function fmtDate(t, o = {}) {
  const y = yearOf(t);
  if (y >= 9999.5) return 'jaar ' + nf0.format(Math.floor(y));
  const opt = { day: 'numeric', month: 'short', year: 'numeric' };
  if (o.wd) opt.weekday = 'short';
  if (o.time) { opt.hour = '2-digit'; opt.minute = '2-digit'; if (o.sec) opt.second = '2-digit'; }
  return new Date(t).toLocaleString('nl-BE', opt);
}
function fmtDay(t) {
  if (yearOf(t) >= 9999.5) return 'jaar ' + nf0.format(Math.floor(yearOf(t)));
  return new Date(t).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function fmtLight(sec, withSec = true) {
  sec = Math.round(sec);
  if (sec < 259200) {
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.floor(sec % 60);
    if (h === 0 && m === 0) return `${s} s`;
    if (h === 0) return withSec ? `${m} min ${pad(s)} s` : `${m} min`;
    return withSec ? `${h} u ${pad(m)} min ${pad(s)} s` : `${h} u ${pad(m)} min`;
  }
  const d = sec / 86400; if (d < 730) return nf1.format(d) + ' dagen';
  const y = d / 365.25; return (y < 100 ? nf1.format(y) : nf0.format(y)) + ' jaar';
}
function countdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  return (d ? d + ' d ' : '') + `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
}
function elapsed(t) {
  const yrs = (t - T_LAUNCH) / YEAR_MS; if (yrs < 0) return '';
  if (yrs < 5000) {
    const L = new Date(T_LAUNCH), y0 = L.getUTCFullYear();
    const ann = (n) => Date.UTC(y0 + n, L.getUTCMonth(), L.getUTCDate(), L.getUTCHours(), L.getUTCMinutes());
    let y = new Date(t).getUTCFullYear() - y0; if (ann(y) > t) y--;
    const d = Math.floor((t - ann(y)) / DAY_MS);
    const dd = `${d} ${d === 1 ? 'dag' : 'dagen'}`;
    if (y === 0) return d === 0 ? 'Lanceerdag' : dd + ' onderweg';
    return `${y} jaar en ${dd} onderweg`;
  }
  return nf0.format(Math.round(yrs)) + ' jaar onderweg';
}

const ui = {};
['dKm', 'dSub', 'lt', 'ltSub', 'dSun', 'dSunSub', 'star', 'starSub', 'date', 'since', 'badge', 'badgeTxt', 'ld',
 'play', 'live', 'speedLbl', 'rev', 'slider', 'follow', 'ticks', 'axis', 'msList', 'sigList', 'side'].forEach((id) => ui[id] = $(id));
const setText = (el, s) => { if (el.textContent !== s) el.textContent = s; };

function updateReadout(near) {
  const t = S.t, h = 1800 * 1000, approx = t < T_JOIN_MS && t > T_LAUNCH + DAY_MS, ca = approx ? 'ca. ' : '';
  const D = distEarth(t), km = D * AU_KM;
  setText(ui.dKm, km >= 1e13 ? nf2.format(D / LY_AU) + ' lichtjaar' : approx ? ca + kmDec(km) : nf0.format(km) + ' km');
  const rate = (distEarth(t + h) - distEarth(t - h)) / (2 * h) * AU_KM * 1000;
  const y = yearOf(t);
  let sub = t <= T_LAUNCH + DAY_MS ? 'net gelanceerd' : t < T_JOIN_MS ? 'benaderde positie (zie uitleg)' : (rate >= 0 ? 'neemt nu toe met ' : 'neemt nu af met ') + nf1.format(Math.abs(rate)) + ' km/s';
  if (rate < 0 && y > 1990 && y < 2200) sub += ': de aarde beweegt naar Voyager toe';
  setText(ui.dSub, sub);
  const sec = km / C_KMS;
  setText(ui.lt, ca + fmtLight(sec));
  setText(ui.ltSub, sec < 1 ? '\u00a0' : 'heen en terug: ' + fmtLight(2 * sec, false));
  const R = v3.len(voyagerPos(t));
  const vh = v3.len(v3.sub(voyagerPos(t + h), voyagerPos(t - h))) / (2 * h) * AU_KM * 1000;
  const times = R < 10 ? nf1.format(R) : nf0.format(R);
  if (R < 0.05 * LY_AU) setText(ui.dSun, ca + kmDec(R * AU_KM));
  else setText(ui.dSun, nf2.format(R / LY_AU) + ' lichtjaar');
  setText(ui.dSunSub, times + ' keer zo ver als de aarde' + (t < T_JOIN_MS ? '' : ' · vliegt ' + nf1.format(vh) + ' km/s'));
  if (near) {
    setText(ui.star, near.s.name);
    setText(ui.starSub, nf2.format(near.d / LY_AU) + ' lichtjaar van Voyager');
  }
  setText(ui.date, fmtDate(t, { wd: true, time: y < 3000, sec: S.live || S.sp < 3 }));
  setText(ui.since, elapsed(t));
  const run = S.playing && !S.live;
  ui.badge.className = 'badge' + (S.live ? ' live' : run ? ' run' : '');
  setText(ui.badgeTxt, S.live ? 'Live' : run ? (S.dir < 0 ? 'Achteruit · ' : S.sp === 0 ? 'Afspelen · ' : 'Versneld · ') + SPEEDS[S.sp][0] : 'Gepauzeerd');
  let ld = '';
  if (y > 2020 && t < T_LD) ld = 'Nog ' + countdown(T_LD - t) + ' tot één lichtdag';
  else if (t >= T_LD && y < 2032) ld = 'Sinds 18 nov 2026 verder dan één lichtdag';
  setText(ui.ld, ld);
}

// ---------- tijdlijn ----------
const tickEls = MS.map((m, i) => {
  const b = document.createElement('button');
  b.style.left = (tToFrac(m.t) * 100) + '%';
  b.title = m.title + ' · ' + (m.label || fmtDay(m.t));
  b.setAttribute('aria-label', b.title);
  b.addEventListener('click', () => goTo(i));
  ui.ticks.appendChild(b); return b;
});
[[1977.68, '1977'], [1980, '1980', 1], [2000, '2000'], [2100, '2100'], [3000, '3000'], [10000, '10.000', 1], [100000, '100.000', 1], [1001977, '1 mln jaar']]
  .forEach(([y, txt, opt]) => {
    const s = document.createElement('span'); s.textContent = txt; if (opt) s.className = 'opt';
    s.style.left = (tToFrac(tOfYear(y)) * 100) + '%'; ui.axis.appendChild(s);
  });


// tabel met de cijfers bij de mijlpalen
(function () {
  const body = $('cijfersBody'); if (!body) return;
  for (const m of MS) {
    const R = v3.len(voyagerPos(m.t)), approx = m.t < T_JOIN_MS && m.t > T_LAUNCH + DAY_MS;
    let d;
    if (m.t <= T_LAUNCH + DAY_MS) d = '0 km';
    else if (R < 0.05 * LY_AU) d = (approx ? 'ca. ' : '') + kmDec(R * AU_KM);
    else d = nf2.format(R / LY_AU) + ' lichtjaar';
    const tr = document.createElement('tr');
    [m.label || fmtDay(m.t), m.title, d].forEach((x) => { const td = document.createElement('td'); td.textContent = x; tr.appendChild(td); });
    body.appendChild(tr);
  }
})();

// mijlpalenlijst
const msEls = MS.map((m, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button><span class="pt"></span><span><span class="d"></span><span class="t"></span></span></button><div class="desc"></div>`;
  li.querySelector('.d').textContent = m.label || fmtDay(m.t);
  li.querySelector('.t').textContent = m.title;
  li.querySelector('.desc').textContent = m.text;
  li.querySelector('.desc').id = 'mijlpaal-' + i;
  li.querySelector('button').setAttribute('aria-controls', 'mijlpaal-' + i);
  li.querySelector('button').addEventListener('click', () => goTo(i));
  ui.msList.appendChild(li); return li;
});
let activeIdx = -1;
function updateMilestones() {
  let idx = -1; for (let i = 0; i < MS.length; i++) if (S.t >= MS[i].t - 1000) idx = i;
  if (idx === activeIdx) return;
  activeIdx = idx;
  msEls.forEach((li, i) => {
    li.className = (i <= idx ? 'past' : 'future') + (i === idx ? ' active' : '');
    tickEls[i].classList.toggle('past', i <= idx);
    li.querySelector('button').setAttribute('aria-expanded', String(i === idx));
    if (i === idx) li.querySelector('button').setAttribute('aria-current', 'step');
    else li.querySelector('button').removeAttribute('aria-current');
  });
  const li = msEls[idx];
  if (li && ui.side.scrollHeight > ui.side.clientHeight + 4 && getComputedStyle(ui.side).overflowY === 'auto') {
    const top = li.offsetTop - 60;
    if (top < ui.side.scrollTop || top > ui.side.scrollTop + ui.side.clientHeight - 160) ui.side.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
}

// vorige / volgende / alles tonen
$('msPrev').addEventListener('click', () => { let i = -1; MS.forEach((m, j) => { if (m.t < S.t - 1000) i = j; }); goTo(Math.max(0, i)); });
$('msNext').addEventListener('click', () => { const i = MS.findIndex((m) => m.t > S.t + 1000); goTo(i < 0 ? MS.length - 1 : i); });
const narrowMQ = window.matchMedia('(max-width: 980px)');
let showAll = false;
function syncCompact() {
  ui.msList.classList.toggle('compact', narrowMQ.matches && !showAll);
  $('msAll').textContent = showAll ? 'Toon minder' : 'Alle mijlpalen';
  $('msAll').setAttribute('aria-expanded', String(!narrowMQ.matches || showAll));
}
$('msAll').addEventListener('click', () => { showAll = !showAll; syncCompact(); });
narrowMQ.addEventListener ? narrowMQ.addEventListener('change', syncCompact) : narrowMQ.addListener(syncCompact);
syncCompact();
const HASH = location.hash.toLowerCase();
const EMBED = window.parent !== window || HASH.startsWith('#embed');
if (EMBED) document.body.classList.add('embed');
// donkere modus: knop, onthouden per browser, of via #donker / #embed-donker
const THEME_KEY = 'voyager1-v2-thema';
function setTheme(dark, save) {
  document.body.classList.toggle('dark', dark);
  PAL = dark ? PAL_D : PAL_L;
  const b = $('themeBtn'); b.setAttribute('aria-pressed', String(dark)); b.textContent = dark ? 'Licht' : 'Donker';
  if (save) { try { localStorage.setItem(THEME_KEY, dark ? 'donker' : 'licht'); } catch (e) {} }
}
let startDark = HASH.includes('donker');
if (!HASH.includes('donker') && !HASH.includes('licht')) { try { startDark = localStorage.getItem(THEME_KEY) === 'donker'; } catch (e) {} }
setTheme(startDark, false);
$('themeBtn').addEventListener('click', () => setTheme(!document.body.classList.contains('dark'), true));
if (EMBED) $('hintBr').textContent = 'Sleep om te draaien · Ctrl + scroll om te zoomen';
let zt = 0;
function zoomHint() { const z = $('zhint'); z.classList.add('on'); clearTimeout(zt); zt = setTimeout(() => z.classList.remove('on'), 1300); }

// ---------- bediening ----------
function setLive(on) {
  S.live = on;
  if (on) { S.t = Date.now(); S.playing = true; S.sp = 0; S.dir = 1; setFollow(true); }
  syncButtons();
}
function setFollow(on) { S.follow = on; ui.follow.setAttribute('aria-pressed', String(on)); }
function syncButtons() {
  ui.live.classList.toggle('on', S.live);
  ui.live.setAttribute('aria-pressed', String(S.live));
  ui.play.textContent = S.playing ? 'Pauze' : 'Afspelen';
  ui.speedLbl.textContent = SPEEDS[S.sp][0];
  ui.rev.setAttribute('aria-pressed', String(S.dir < 0));
}
function goTo(i) {
  const m = MS[i];
  S.live = false; S.playing = false; S.t = clamp(m.t, T_LAUNCH, T_MAX);
  S.sp = m.sp; S.dir = 1; setFollow(false); S.tz = zoomForRadius(m.v);
  syncButtons();
  $('status').textContent = m.title + '. ' + (m.label || fmtDay(m.t));
}
ui.play.addEventListener('click', () => {
  if (S.live) { S.live = false; S.playing = false; }
  else { if (S.t >= T_MAX && S.dir > 0) S.t = T_LAUNCH; S.playing = !S.playing; }
  syncButtons();
});
ui.live.addEventListener('click', () => setLive(true));
$('slower').addEventListener('click', () => { S.sp = Math.max(0, S.sp - 1); S.live = false; S.playing = true; syncButtons(); });
$('faster').addEventListener('click', () => { S.sp = Math.min(SPEEDS.length - 1, S.sp + 1); S.live = false; S.playing = true; syncButtons(); });
ui.rev.addEventListener('click', () => { S.dir *= -1; S.live = false; S.playing = true; syncButtons(); });
ui.follow.addEventListener('click', () => setFollow(!S.follow));
$('resetView').addEventListener('click', () => { S.yaw = YAW0; S.pitch = PITCH0; setFollow(true); });
document.querySelectorAll('button[data-r]').forEach((b) => b.addEventListener('click', () => {
  setFollow(false); S.tz = zoomForRadius(+b.dataset.r);
}));
ui.slider.addEventListener('input', () => {
  S.live = false; S.dragSlider = true; S.t = fracToT(+ui.slider.value / 10000); syncButtons();
});
ui.slider.addEventListener('change', () => { S.dragSlider = false; });
ui.slider.addEventListener('blur', () => { S.dragSlider = false; invalidate(); });
canvas.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 0.2 : 0.06;
  if (e.key === 'ArrowLeft') S.yaw -= step;
  else if (e.key === 'ArrowRight') S.yaw += step;
  else if (e.key === 'ArrowUp') S.pitch = clamp(S.pitch - step, 0, 1.52);
  else if (e.key === 'ArrowDown') S.pitch = clamp(S.pitch + step, 0, 1.52);
  else if (e.key === '+' || e.key === '=') { setFollow(false); S.tz = clamp(S.tz + 0.15, ZMIN, ZMAX); }
  else if (e.key === '-') { setFollow(false); S.tz = clamp(S.tz - 0.15, ZMIN, ZMAX); }
  else if (e.code === 'Space') ui.play.click();
  else return;
  e.preventDefault(); invalidate();
});

// slepen, zoomen, knijpen
// Muis en pen lopen via pointer events. Vingers lopen via touch events: die
// blijven binnenkomen als de browser een gebaar overneemt, en alleen daar kan
// preventDefault het zoomen van de pagina (of van het artikel rond de iframe)
// tegenhouden. Eén vinger: opzij vegen draait, omhoog/omlaag scrolt het
// artikel. Twee vingers: knijpen zoomt, samen omhoog/omlaag schuiven kantelt.
const ptrs = new Map();
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') return;
  canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); canvas.style.cursor = 'grabbing';
});
canvas.addEventListener('pointermove', (e) => {
  const p = ptrs.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p[0], dy = e.clientY - p[1]; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  S.yaw += dx * 0.005; S.pitch = clamp(S.pitch + dy * 0.005, 0, 1.52);
});
const endPtr = (e) => { ptrs.delete(e.pointerId); if (!ptrs.size) canvas.style.cursor = 'grab'; };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);

let tg = null; // lopend touchgebaar
const touchPair = (list) => {
  const a = list[0], b = list[1];
  return { d: Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)), y: (a.clientY + b.clientY) / 2 };
};
function touchStart(e) {
  if (e.touches.length >= 2) {
    if (e.cancelable) e.preventDefault();
    const p = touchPair(e.touches);
    tg = { mode: 'pinch', d: p.d, z: S.zoom, y: p.y, pitch: S.pitch };
    setFollow(false);
  } else if (e.touches.length === 1) {
    const t = e.touches[0];
    tg = { mode: 'wait', x0: t.clientX, y0: t.clientY, x: t.clientX };
  }
  invalidate();
}
canvas.addEventListener('touchstart', touchStart, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  if (!tg) return;
  if (tg.mode === 'pinch' && e.touches.length >= 2) {
    if (e.cancelable) e.preventDefault();
    const p = touchPair(e.touches);
    S.zoom = S.tz = clamp(tg.z + Math.log10(p.d / tg.d), ZMIN, ZMAX);
    S.pitch = clamp(tg.pitch + (p.y - tg.y) * 0.005, 0, 1.52);
  } else if (e.touches.length === 1) {
    const t = e.touches[0];
    if (tg.mode === 'wait') {
      const ax = Math.abs(t.clientX - tg.x0), ay = Math.abs(t.clientY - tg.y0);
      if (ax < 8 && ay < 8) return;
      tg.mode = ax > ay ? 'rotate' : 'scroll';
    }
    if (tg.mode === 'rotate') {
      if (e.cancelable) e.preventDefault();
      S.yaw += (t.clientX - tg.x) * 0.005;
    }
    tg.x = t.clientX;
  }
  invalidate();
}, { passive: false });
const touchEnd = (e) => {
  if (e.touches.length >= 2) touchStart(e);
  else if (e.touches.length === 1 && tg && tg.mode === 'pinch') { const t = e.touches[0]; tg = { mode: 'rotate', x: t.clientX }; }
  else if (!e.touches.length) tg = null;
};
canvas.addEventListener('touchend', touchEnd); canvas.addEventListener('touchcancel', touchEnd);
// Safari: blokkeer paginazoom op de kaart; trackpad-knijpen op de Mac komt alleen hier binnen.
let gz = null;
canvas.addEventListener('gesturestart', (e) => { e.preventDefault(); gz = tg ? null : S.tz; });
canvas.addEventListener('gesturechange', (e) => {
  e.preventDefault();
  if (gz === null || !(e.scale > 0)) return;
  setFollow(false); S.tz = clamp(gz + Math.log10(e.scale), ZMIN, ZMAX); invalidate();
});
canvas.addEventListener('gestureend', (e) => { e.preventDefault(); gz = null; });
canvas.addEventListener('wheel', (e) => {
  if (!(e.ctrlKey || e.metaKey)) { zoomHint(); return; }
  e.preventDefault(); setFollow(false);
  S.tz = clamp(S.tz - e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016), ZMIN, ZMAX);
}, { passive: false });

// ---------- signalen ----------
const STORE = 'voyager1-v2-lichtsignalen';
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || '[]');
  if (Array.isArray(saved)) S.signals = saved.filter((s) => s &&
    ['te', 'ta', 'tr'].every((k) => Number.isFinite(s[k])) &&
    s.te >= T_LAUNCH && s.te <= T_MAX && s.ta >= s.te && s.tr >= s.ta &&
    typeof s.msg === 'string' && s.msg.length <= 60 &&
    typeof s.id === 'string' && s.id.length <= 100).slice(-4);
} catch (e) {}
const saveSignals = () => { try { localStorage.setItem(STORE, JSON.stringify(S.signals)); } catch (e) {} };
$('sigForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const inp = $('sigMsg');
  S.signals.push(makeSignal(S.t, inp.value)); S.signals = S.signals.slice(-4);
  inp.value = ''; saveSignals(); renderSignals(true);
  $('status').textContent = 'Signaal verstuurd in deze simulatie.';
});
let sigKey = '';
function renderSignals(force) {
  const key = S.signals.map((s) => s.id).join();
  if (force || key !== sigKey) {
    sigKey = key; ui.sigList.innerHTML = '';
    for (const s of S.signals.slice().reverse()) {
      const li = document.createElement('li'); li.dataset.id = s.id;
      li.innerHTML = `<div class="h"><span class="m"></span><button class="x" aria-label="Verwijder">×</button></div><div class="bar"><i></i></div><div class="st"></div><div class="sub"></div><div class="tip"></div>`;
      li.querySelector('.m').textContent = s.msg ? '“' + s.msg + '”' : 'Signaal';
      li.querySelector('.x').addEventListener('click', () => { S.signals = S.signals.filter((x) => x.id !== s.id); saveSignals(); renderSignals(true); $('sigMsg').focus(); });
      ui.sigList.appendChild(li);
    }
  }
  const t = S.t;
  for (const li of ui.sigList.children) {
    const s = S.signals.find((x) => x.id === li.dataset.id); if (!s) continue;
    let st, sub, tip = '', f;
    if (t < s.te) { f = 0; st = 'Nog niet verstuurd'; sub = 'Vertrekt ' + fmtDate(s.te, { time: true }) + ' (je spoelde terug)'; }
    else if (t < s.ta) {
      f = (t - s.te) / (s.ta - s.te);
      st = 'Onderweg · aankomst over ' + countdown(s.ta - t);
      sub = 'Bij Voyager op ' + fmtDate(s.ta, { wd: true, time: true });
      if (S.live) tip = 'Tip: zet de snelheid op 1 uur/s om het signaal te zien aankomen.';
    } else if (t < s.tr) {
      f = 1; st = 'Aangekomen ' + fmtDate(s.ta, { time: true });
      sub = 'Een antwoord zou terug zijn over ' + countdown(s.tr - t);
    } else { f = 1; st = 'Heen en terug: ' + fmtLight((s.tr - s.te) / 1000); sub = 'Verstuurd ' + fmtDate(s.te, { time: true }); }
    const width = (f * 100).toFixed(2) + '%';
    if (li.querySelector('.bar i').style.width !== width) li.querySelector('.bar i').style.width = width;
    setText(li.querySelector('.st'), st); setText(li.querySelector('.sub'), sub); setText(li.querySelector('.tip'), tip);
  }
}

// ---------- hoofdlus ----------
// One scheduler owns both RAF and the one-second live timer.
function invalidate() { dirty = true; schedule(); }
function schedule() {
  if (raf || timer || !visible || document.hidden) return;
  raf = requestAnimationFrame(frame);
}
function suspend() {
  cancelAnimationFrame(raf); clearTimeout(timer); raf = timer = 0; last = drawTick = 0;
}
function frame(now) {
  raf = 0;
  if (!visible || document.hidden) { last = 0; return; }
  if (!dirty && now - drawTick < 1000 / 30) { schedule(); return; }
  drawTick = now;
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
  if (S.live) S.t = Date.now();
  else if (S.playing && !S.dragSlider) {
    S.t += S.dir * SPEEDS[S.sp][1] * dt * 1000;
    if (S.t >= T_MAX || S.t <= T_LAUNCH) { S.t = clamp(S.t, T_LAUNCH, T_MAX); S.playing = false; syncButtons(); }
  }
  setFrame();
  if (S.follow) S.tz = followZoom();
  if (reducedMotion.matches || (S.live && !dirty)) S.zoom = S.tz;
  else S.zoom += (S.tz - S.zoom) * Math.min(1, dt * 5);
  if (Math.abs(S.tz - S.zoom) < 0.0001) S.zoom = S.tz;
  setFrame();
  const near = draw();
  if (dirty || !S.playing || now - uiTick >= 100) {
    uiTick = now;
    updateReadout(near); updateMilestones(); renderSignals(false);
    const valueText = fmtDate(S.t, { time: yearOf(S.t) < 3000 });
    if (ui.slider.getAttribute('aria-valuetext') !== valueText) ui.slider.setAttribute('aria-valuetext', valueText);
    if (!S.dragSlider) { const f = tToFrac(S.t); ui.slider.value = Math.round(f * 10000); ui.slider.style.setProperty('--p', (f * 100) + '%'); }
    else ui.slider.style.setProperty('--p', (+ui.slider.value / 100) + '%');
  }
  dirty = false;
  if ((S.playing && !S.live && !S.dragSlider) || S.zoom !== S.tz) schedule();
  else if (S.live) timer = setTimeout(() => { timer = 0; schedule(); }, 1000);
  else last = 0;
}
// Wake a paused scene for each interaction without introducing parallel loops.
['click', 'input', 'change', 'pointermove', 'wheel'].forEach((type) => {
  document.addEventListener(type, (event) => {
    if (type === 'pointermove' && !ptrs.size) return;
    if (type === 'wheel' && event.target !== canvas) return;
    clearTimeout(timer); timer = 0; invalidate();
  }, { passive: true });
});
document.addEventListener('visibilitychange', () => { suspend(); invalidate(); });
if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting; suspend(); invalidate();
}).observe(document.querySelector('.frame'));
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) { S.live = false; S.playing = false; syncButtons(); }
  suspend(); invalidate();
});
S.zoom = S.tz = (setFrame(), followZoom());
if (reducedMotion.matches) { S.live = false; S.playing = false; }
syncButtons();
renderSignals(true);
invalidate();
})();
