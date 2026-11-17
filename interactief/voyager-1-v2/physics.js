(function (root) {
'use strict';

// ===== Fysica: posities van planeten, Voyager 1 en nabije sterren =====
// Eenheden intern: AE (astronomische eenheid) en jaren / milliseconden.
const AU_KM = 149597870.7;
const C_KMS = 299792.458;
const LD_AU = C_KMS * 86400 / AU_KM;           // één lichtdag in AE (≈173,14)
const LY_AU = 63241.077;
const DAY_MS = 86400000;
const YEAR_MS = 365.25 * DAY_MS;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
const GM = 4 * Math.PI * Math.PI;              // zon, in AE^3 / jaar^2
const KMS_AUYR = 365.25 * 86400 / AU_KM;       // 1 km/s in AE per jaar
const D2R = Math.PI / 180;
const EPS = 23.4392911 * D2R;                  // helling ecliptica

const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
};
function eqToEcl(p) {
  const c = Math.cos(EPS), s = Math.sin(EPS);
  return [p[0], p[1] * c + p[2] * s, -p[1] * s + p[2] * c];
}
function radecVec(raDeg, decDeg) {
  const a = raDeg * D2R, d = decDeg * D2R;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}

// --- Planeten: benaderde baanelementen van JPL (Standish), geldig ca. 1800-2050 ---
// a [AE], e, I [°], L [°], lengte perihelium [°], klimmende knoop [°], L-snelheid [°/eeuw]
const PLANETS = [
  { name: 'Mercurius', a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.25032350, w: 77.45779628, O: 48.33076593, n: 149472.67411175, r: 2.4 },
  { name: 'Venus', a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.97909950, w: 131.60246718, O: 76.67984255, n: 58517.81538729, r: 3 },
  { name: 'Aarde', a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, w: 102.93768193, O: 0.0, n: 35999.37244981, r: 3.2 },
  { name: 'Mars', a: 1.52371034, e: 0.09339410, I: 1.84969142, L: -4.55343205, w: -23.94362959, O: 49.55953891, n: 19140.30268499, r: 2.6 },
  { name: 'Jupiter', a: 5.20288700, e: 0.04838624, I: 1.30439695, L: 34.39644051, w: 14.72847983, O: 100.47390909, n: 3034.74612775, r: 4.6 },
  { name: 'Saturnus', a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, w: 92.59887831, O: 113.66242448, n: 1222.49362201, r: 4.2 },
  { name: 'Uranus', a: 19.18916464, e: 0.04725744, I: 0.77263783, L: 313.23810451, w: 170.95427630, O: 74.01692503, n: 428.48202785, r: 3.6 },
  { name: 'Neptunus', a: 30.06992276, e: 0.00859048, I: 1.77004347, L: -55.12002969, w: 44.96476227, O: 131.78422574, n: 218.45945325, r: 3.6 }
];
const EARTH = PLANETS[2], JUPITER = PLANETS[4], SATURN = PLANETS[5];

function planetPos(p, tMs) {
  const T = (tMs - J2000) / (DAY_MS * 36525);
  let M = (p.L + p.n * T - p.w) % 360;
  if (M > 180) M -= 360; if (M < -180) M += 360;
  M *= D2R;
  let E = M + p.e * Math.sin(M);
  for (let i = 0; i < 8; i++) E -= (E - p.e * Math.sin(E) - M) / (1 - p.e * Math.cos(E));
  const xp = p.a * (Math.cos(E) - p.e), yp = p.a * Math.sqrt(1 - p.e * p.e) * Math.sin(E);
  const om = (p.w - p.O) * D2R, O = p.O * D2R, I = p.I * D2R;
  const cw = Math.cos(om), sw = Math.sin(om), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    (sw * sI) * xp + (cw * sI) * yp
  ];
}
const earthPos = (t) => planetPos(EARTH, t);

// --- Voyager 1 ---
// Vaste ankerpunten (UTC)
const T_LAUNCH = Date.UTC(1977, 8, 5, 12, 56, 0);
const T_JUP = Date.UTC(1979, 2, 5, 12, 5, 0);
const T_SAT = Date.UTC(1980, 10, 12, 23, 46, 0);
const T_JOIN = Date.UTC(1982, 6, 1);
const T_LD = Date.UTC(2026, 10, 18, 10, 16, 7);   // NASA: één lichtdag, 18/11/2026 02:16:07 PST

// Asymptotische richting en snelheid (Bailer-Jones & Farnocchia 2019, op basis van JPL Horizons)
const V_DIR = v3.norm(eqToEcl(radecVec(262.8760, 12.3199)));
const V_INF = 16.6048 * KMS_AUYR;

// Na Saturnus: rechte lijn P(s) = s·V_DIR + N, met N de loodrechte afstand tot Saturnus' positie
const SAT_AT_FLYBY = planetPos(SATURN, T_SAT);
const N_OFF = v3.sub(SAT_AT_FLYBY, v3.mul(V_DIR, v3.dot(V_DIR, SAT_AT_FLYBY)));
const B2 = v3.dot(N_OFF, N_OFF);

// Kalibratie: op T_LD staat Voyager precies één lichtdag van de aarde
const S_LD = (() => {
  const Q = v3.sub(N_OFF, earthPos(T_LD));
  const uq = v3.dot(V_DIR, Q);
  return -uq + Math.sqrt(uq * uq - v3.dot(Q, Q) + LD_AU * LD_AU);
})();

// s(t): snelheid langs de lijn volgt uit de energievergelijking (vis-viva): v² = v∞² + 2GM/r
const dsdt = (s) => Math.sqrt(V_INF * V_INF + 2 * GM / Math.sqrt(s * s + B2));
const TAB_STEP = 1 / 48;                                   // jaar
const TAB_T0 = (T_JOIN - J2000) / YEAR_MS - 0.5;
const TAB_T1 = 2400 - 2000;
const TAB = (() => {
  const n = Math.ceil((TAB_T1 - TAB_T0) / TAB_STEP) + 1;
  const arr = new Float64Array(n);
  const tLd = (T_LD - J2000) / YEAR_MS;
  const iLd = (tLd - TAB_T0) / TAB_STEP;
  const rk = (s, h) => {
    const k1 = dsdt(s), k2 = dsdt(s + h * k1 / 2), k3 = dsdt(s + h * k2 / 2), k4 = dsdt(s + h * k3);
    return s + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  };
  // van T_LD naar het dichtstbijzijnde roosterpunt, dan beide richtingen op
  const i0 = Math.floor(iLd);
  arr[i0] = rk(S_LD, -(iLd - i0) * TAB_STEP);
  for (let i = i0 - 1; i >= 0; i--) arr[i] = rk(arr[i + 1], -TAB_STEP);
  for (let i = i0 + 1; i < n; i++) arr[i] = rk(arr[i - 1], TAB_STEP);
  return arr;
})();
function sAt(tMs) {
  const ty = (tMs - J2000) / YEAR_MS;
  const x = (ty - TAB_T0) / TAB_STEP;
  if (x >= TAB.length - 1) {
    // verre toekomst: constante snelheid v∞ plus de (kleine) logaritmische correctie
    const sEnd = TAB[TAB.length - 1];
    const dt = ty - TAB_T1;
    const s1 = sEnd + V_INF * dt;
    return s1 + (GM / (V_INF * V_INF)) * Math.log(Math.max(1, s1 / sEnd));
  }
  const i = Math.max(0, Math.floor(x)), f = x - i;
  return TAB[i] * (1 - f) + TAB[Math.min(i + 1, TAB.length - 1)] * f;
}
const linePos = (tMs) => v3.add(v3.mul(V_DIR, sAt(tMs)), N_OFF);

// Vóór mid-1982: vloeiende kromme (Hermite) door aarde (lancering), Jupiter en Saturnus
const HERM = (() => {
  const yrs = (t) => (t - J2000) / YEAR_MS;
  const P = [earthPos(T_LAUNCH), planetPos(JUPITER, T_JUP), SAT_AT_FLYBY, linePos(T_JOIN)];
  const T = [T_LAUNCH, T_JUP, T_SAT, T_JOIN].map(yrs);
  const vJoin = v3.mul(V_DIR, dsdt(sAt(T_JOIN)));
  const vEarth = v3.mul(v3.sub(earthPos(T_LAUNCH + DAY_MS), earthPos(T_LAUNCH - DAY_MS)), 365.25 / 2);
  const m = [
    v3.add(vEarth, v3.mul(v3.norm(P[0]), 1.6)),
    v3.mul(v3.sub(P[2], P[0]), 1 / (T[2] - T[0])),
    v3.mul(v3.sub(P[3], P[1]), 1 / (T[3] - T[1])),
    vJoin
  ];
  return { P, T, m };
})();
function voyagerPos(tMs) {
  if (tMs <= T_LAUNCH) return earthPos(tMs);
  if (tMs >= T_JOIN) return linePos(tMs);
  const ty = (tMs - J2000) / YEAR_MS;
  const { P, T, m } = HERM;
  let k = 0; while (k < 2 && ty > T[k + 1]) k++;
  const h = T[k + 1] - T[k], u = (ty - T[k]) / h;
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  return [0, 1, 2].map((j) => h00 * P[k][j] + h10 * h * m[k][j] + h01 * P[k + 1][j] + h11 * h * m[k + 1][j]);
}

// --- Nabije sterren (J2000-posities, Gaia/Hipparcos-waarden; lineaire beweging) ---
// naam, RA [u m s], Dec [° ' "], parallax [mas], eigenbeweging RA* en Dec [mas/jr], radiële snelheid [km/s]
const STAR_DATA = [
  ['Proxima Centauri', [14, 29, 42.95], [-62, 40, 46.2], 768.07, -3781.31, 769.77, -22.40],
  ['Alfa Centauri', [14, 39, 36.49], [-60, 50, 2.4], 750.81, -3679.25, 473.67, -22.3],
  ['Ster van Barnard', [17, 57, 48.50], [4, 41, 36.1], 546.98, -801.55, 10362.39, -110.6],
  ['Wolf 359', [10, 56, 28.92], [7, 0, 52.0], 415.18, -3866.3, -2699.2, 19.57],
  ['Lalande 21185', [11, 3, 20.19], [35, 58, 11.6], 392.75, -580.06, -4776.59, -84.69],
  ['Sirius', [6, 45, 8.92], [-16, 42, 58.0], 379.21, -546.01, -1223.07, -5.50],
  ['Ross 248', [23, 41, 54.99], [44, 10, 40.8], 316.48, 115.10, -1592.77, -77.7],
  ['Epsilon Eridani', [3, 32, 55.84], [-9, 27, 29.7], 310.58, -975.17, 19.49, 16.38],
  ['Tau Ceti', [1, 44, 4.08], [-15, 56, 14.9], 273.81, -1721.05, 854.16, -16.68],
  ['61 Cygni', [21, 6, 53.94], [38, 44, 57.9], 286.0, 4164.21, 3249.99, -65.97],
  ['Procyon', [7, 39, 18.12], [5, 13, 30.0], 284.56, -714.59, -1036.80, -3.2],
  ['Gliese 445', [11, 47, 41.3869], [78, 41, 28.176], 190.3251, 748.418, 480.804, -111.50],
  ['Altair', [19, 50, 47.0], [8, 52, 6.0], 194.95, 536.23, 385.29, -26.1],
  ['Vega', [18, 36, 56.34], [38, 47, 1.3], 130.23, 200.94, 286.23, -13.9],
  ['Gliese 710', [18, 19, 50.84], [-1, 56, 19.0], 52.35, -0.41, -0.11, -14.53]
];
const STARS = STAR_DATA.map(([name, ra, dec, plx, pmra, pmdec, rv]) => {
  const raDeg = (ra[0] + ra[1] / 60 + ra[2] / 3600) * 15;
  const sgn = dec[0] < 0 ? -1 : 1;
  const decDeg = sgn * (Math.abs(dec[0]) + dec[1] / 60 + dec[2] / 3600);
  const a = raDeg * D2R, d = decDeg * D2R;
  const distAU = 206264.806 / (plx / 1000);
  const rhat = [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  const ahat = [-Math.sin(a), Math.cos(a), 0];
  const dhat = [-Math.sin(d) * Math.cos(a), -Math.sin(d) * Math.sin(a), Math.cos(d)];
  const k = 4.740470446 / plx;  // mas/jr -> km/s (bij parallax in mas)
  const vEq = v3.add(v3.add(v3.mul(rhat, rv), v3.mul(ahat, pmra * k)), v3.mul(dhat, pmdec * k));
  return { name, p0: eqToEcl(v3.mul(rhat, distAU)), v: eqToEcl(v3.mul(vEq, KMS_AUYR)) };
});
const starPos = (s, tMs) => v3.add(s.p0, v3.mul(s.v, (tMs - J2000) / YEAR_MS));

const C_AU_MS = C_KMS / AU_KM / 1000;                 // lichtsnelheid in AE per ms
const T_MAX = T_LAUNCH + 1e6 * YEAR_MS;
const T_JOIN_MS = Date.UTC(1982, 6, 1);
const yearOf = (t) => 2000 + (t - J2000) / YEAR_MS;
const tOfYear = (y) => J2000 + (y - 2000) * YEAR_MS;
const distEarth = (t) => v3.len(v3.sub(voyagerPos(t), earthPos(t)));


const OORT_IN = 1100, OORT_OUT = 106000;
function closest(star) {        // tijdstip van dichtste nadering tot Voyager
  let best = [Infinity, 0], lo = T_LAUNCH, hi = T_MAX, step = 200 * YEAR_MS;
  for (let pass = 0; pass < 3; pass++) {
    for (let t = lo; t <= hi; t += step) {
      const d = v3.len(v3.sub(starPos(star, t), voyagerPos(t)));
      if (d < best[0]) best = [d, t];
    }
    lo = best[1] - step; hi = best[1] + step; step /= 50;
  }
  return best;
}
function whenAt(R) {            // tijdstip waarop Voyager R AE van de zon staat
  let lo = T_LD, hi = T_MAX;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (v3.len(voyagerPos(m)) < R) lo = m; else hi = m; }
  return lo;
}
function whenCloserThanSun(star) {  // eerste moment dat Voyager dichter bij deze ster staat dan bij de zon
  const closer = (t) => v3.len(v3.sub(starPos(star, t), voyagerPos(t))) < v3.len(voyagerPos(t));
  let t = T_LAUNCH;
  while (t < T_MAX && !closer(t)) t += 50 * YEAR_MS;
  let lo = t - 50 * YEAR_MS, hi = t;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (closer(m)) hi = m; else lo = m; }
  return hi;
}
function makeSignal(te, msg) {
  const E0 = earthPos(te);
  let ta = te + v3.len(v3.sub(voyagerPos(te), E0)) / C_AU_MS;
  for (let i = 0; i < 6; i++) ta = te + v3.len(v3.sub(voyagerPos(ta), E0)) / C_AU_MS;
  const V1 = voyagerPos(ta);
  let tr = ta + v3.len(v3.sub(earthPos(ta), V1)) / C_AU_MS;
  for (let i = 0; i < 6; i++) tr = ta + v3.len(v3.sub(earthPos(tr), V1)) / C_AU_MS;
  return { te, ta, tr, msg: (msg || '').trim(), id: Math.random().toString(36).slice(2) };
}
const LOGMAX = Math.log10(1e6 + 1);
const tToFrac = (t) => Math.log10(1 + Math.max(0, (t - T_LAUNCH) / YEAR_MS)) / LOGMAX;
const fracToT = (f) => T_LAUNCH + (Math.pow(10, f * LOGMAX) - 1) * YEAR_MS;

const api = Object.freeze({
  AU_KM, C_KMS, LD_AU, LY_AU, DAY_MS, YEAR_MS, J2000, GM, KMS_AUYR, D2R, EPS, v3, eqToEcl,
  radecVec, PLANETS, EARTH, JUPITER, SATURN, planetPos, earthPos, T_LAUNCH, T_JUP, T_SAT, T_JOIN,
  T_LD, V_DIR, V_INF, N_OFF, S_LD, SAT_AT_FLYBY, B2, TAB_STEP, TAB_T0, TAB_T1, TAB, sAt, dsdt,
  voyagerPos, STARS, STAR_DATA, starPos, C_AU_MS, T_MAX, T_JOIN_MS, yearOf, tOfYear, distEarth,
  OORT_IN, OORT_OUT, closest, whenAt, whenCloserThanSun, makeSignal, LOGMAX, tToFrac, fracToT
});
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.ScientiasVoyagerPhysics = api;
})(globalThis);
