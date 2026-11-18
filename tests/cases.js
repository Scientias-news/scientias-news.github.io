/* Dependency-free cases shared by Node and the optional GJS runner. */
globalThis.runScientiasTests = function (read, log) {
  let checks = 0;
  function assert(value, message) { checks++; if (!value) throw new Error(message); }
  function near(a, b, tolerance, message) { assert(Number.isFinite(a) && Math.abs(a - b) <= tolerance, message + ': ' + a + ' versus ' + b); }
  const original = read('tests/fixtures/voyager-1-origineel.html.txt');
  const scripts = [...original.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const between = (text, start, end) => text.slice(text.indexOf(start), text.indexOf(end, text.indexOf(start)));
  const helpers = between(scripts[1], 'const C_AU_MS =', '// ---------- afgeleide mijlpalen ----------');
  const referenceSource = scripts[0].slice(0, scripts[0].indexOf("if (typeof module")) + helpers +
    between(scripts[1], 'function closest(star)', 'const OORT_IN') +
    between(scripts[1], 'function whenCloserThanSun(star)', 'const gFirst') +
    between(scripts[1], 'function makeSignal(te, msg)', 'function drawSignal') +
    between(scripts[1], 'const LOGMAX =', 'const tickEls =');
  const names = 'AU_KM,C_KMS,LD_AU,LY_AU,DAY_MS,YEAR_MS,J2000,v3,PLANETS,earthPos,planetPos,voyagerPos,sAt,dsdt,STARS,starPos,T_LAUNCH,T_JUP,T_SAT,T_LD,T_MAX,distEarth,closest,whenAt,whenCloserThanSun,makeSignal,tToFrac,fracToT';
  const reference = new Function(referenceSource + '\nreturn {' + names + '};')();
  new Function(read('interactief/voyager-1-v2/physics.js'))();
  const m = globalThis.ScientiasVoyagerPhysics, r = reference;
  const vectorNear = (a, b, tolerance, message) => a.forEach((value, i) => near(value, b[i], tolerance, message + '[' + i + ']'));
  // The last integration sample is later than the requested nominal table end.
  const tableEndYear = m.TAB_T0 + (m.TAB.length - 1) * m.TAB_STEP;
  const tableEndTime = m.J2000 + tableEndYear * m.YEAR_MS;
  const endpoint = m.TAB[m.TAB.length - 1];
  near(m.sAt(tableEndTime), endpoint, 1e-10, 'Extrapolation starts at the actual last sample');
  for (const spanMs of [1, 1000, m.DAY_MS]) {
    const before = m.sAt(tableEndTime - spanMs), after = m.sAt(tableEndTime + spanMs);
    const travel = m.dsdt(endpoint) * (2 * spanMs / m.YEAR_MS);
    assert(after > before, 'Forward motion across transition');
    near(after - before, travel, travel * 0.001 + 1e-9, 'No jump across transition');
  }
  // Independent continuation of the ODE: catches an epoch offset without
  // repeating the implementation of the asymptotic approximation.
  function integrateForward(years) {
    let s = endpoint;
    const steps = Math.ceil(years * 48), h = years / steps;
    for (let i = 0; i < steps; i++) {
      const a = m.dsdt(s), b = m.dsdt(s + h * a / 2);
      const c = m.dsdt(s + h * b / 2), d = m.dsdt(s + h * c);
      s += h * (a + 2 * b + 2 * c + d) / 6;
    }
    return s;
  }
  for (const years of [1 / 365.25, 1, 100]) {
    near(m.sAt(tableEndTime + years * m.YEAR_MS), integrateForward(years), 0.01,
      'Asymptotic continuation agrees with independent integration');
  }
  // Exact Voyager regression before the repaired transition; unchanged planets
  // and stars across the entire timeline. Only the intended future offset changes.
  const dates = [m.T_LAUNCH, m.T_JUP, m.T_SAT, m.T_JOIN - 1, m.T_JOIN, m.T_JOIN + 1,
    m.T_LD, Date.UTC(2400, 0, 1), m.T_MAX];
  for (let i = 0; i <= 200; i++) dates.push(m.T_LAUNCH + (10 ** (i / 200 * 6) - 1) * m.YEAR_MS);
  for (const t of dates) {
    if (t < tableEndTime) {
      vectorNear(m.voyagerPos(t), r.voyagerPos(t), 0, 'Voyager unchanged at ' + t);
      near(m.sAt(t), r.sAt(t), 0, 'Radial integration unchanged');
    } else {
      const shift = r.sAt(t) - m.sAt(t);
      assert(shift > 0.05 && shift < 0.06, 'Only the known future position offset is removed');
      vectorNear(m.voyagerPos(t), m.v3.add(m.v3.mul(m.V_DIR, m.sAt(t)), m.N_OFF), 0,
        'Future position retains the original direction and offset');
    }
    m.PLANETS.forEach((p, i) => vectorNear(m.planetPos(p, t), r.planetPos(r.PLANETS[i], t), 0, 'Planet unchanged'));
    m.STARS.forEach((s, i) => vectorNear(m.starPos(s, t), r.starPos(r.STARS[i], t), 0, 'Star unchanged'));
    vectorNear(m.earthPos(t), r.earthPos(t), 0, 'Earth unchanged');
  }
  near(m.distEarth(m.T_LD), m.LD_AU, 1e-7, 'Light-day calibration within 15 km');
  vectorNear(m.voyagerPos(m.T_LAUNCH), m.earthPos(m.T_LAUNCH), 0, 'Launch is at Earth');
  vectorNear(m.voyagerPos(m.T_JUP), m.planetPos(m.JUPITER, m.T_JUP), 1e-12, 'Hermite anchor Jupiter');
  vectorNear(m.voyagerPos(m.T_SAT), m.planetPos(m.SATURN, m.T_SAT), 1e-12, 'Hermite anchor Saturn');
  assert(m.v3.len(m.v3.sub(m.voyagerPos(m.T_JOIN - 1), m.voyagerPos(m.T_JOIN + 1))) < 1e-8, 'Continuous at model join');
  assert(m.dsdt(100) > m.dsdt(1000), 'Solar slowing preserved');
  near(m.dsdt(1e12), m.V_INF, 1e-10, 'Asymptotic velocity');
  for (const radius of [m.OORT_IN, m.OORT_OUT]) {
    if (m.whenAt(radius) < tableEndTime) near(m.whenAt(radius), r.whenAt(radius), 0, 'Early Oort crossing unchanged');
    else assert(m.whenAt(radius) > r.whenAt(radius), 'Future Oort crossing reflects corrected position');
    near(m.v3.len(m.voyagerPos(m.whenAt(radius))), radius, 1e-7, 'Oort crossing radius');
  }
  for (const name of ['Gliese 445', 'Proxima Centauri']) {
    const index = m.STARS.findIndex((s) => s.name === name);
    const [distance, time] = m.closest(m.STARS[index]);
    near(distance, m.v3.len(m.v3.sub(m.starPos(m.STARS[index], time), m.voyagerPos(time))), 1e-9, 'Encounter distance matches corrected positions');
    for (const offset of [-0.08, 0.08]) {
      const t = time + offset * m.YEAR_MS;
      assert(distance <= m.v3.len(m.v3.sub(m.starPos(m.STARS[index], t), m.voyagerPos(t))) + 1e-6,
        'Encounter is locally minimal at search resolution');
    }
    const crossing = m.whenCloserThanSun(m.STARS[index]);
    const difference = (t) => m.v3.len(m.v3.sub(m.starPos(m.STARS[index], t), m.voyagerPos(t))) - m.v3.len(m.voyagerPos(t));
    if (crossing < m.T_MAX) assert(difference(crossing - m.DAY_MS) > 0 && difference(crossing + m.DAY_MS) < 0,
      'Sun-distance crossing uses corrected positions');
    else assert(difference(crossing) > 0, 'No crossing claimed when star remains farther than Sun');
  }
  for (const fraction of [0, 0.1, 0.5, 1]) near(m.tToFrac(m.fracToT(fraction)), fraction, 1e-12, 'Timeline inverse');
  for (const t of [Date.UTC(1990, 0, 1), m.T_LD, m.T_MAX]) {
    const signal = m.makeSignal(t, '  Hallo  '), old = r.makeSignal(t, '  Hallo  ');
    if (t < tableEndTime) ['te', 'ta', 'tr'].forEach((key) => near(signal[key], old[key], 0, 'Early signal time unchanged'));
    else assert(signal.ta < old.ta && signal.tr < old.tr, 'Future signal times reflect corrected distance');
    assert(signal.ta > signal.te && signal.tr > signal.ta, 'Signal travels forward in time');
    const outDistance = m.v3.len(m.v3.sub(m.voyagerPos(signal.ta), m.earthPos(signal.te)));
    // At +1 million years, millisecond timestamps lose sub-millisecond precision.
    near((signal.ta - signal.te) * m.C_AU_MS, outDistance, 1e-5, 'Outgoing signal intercept');
    assert(signal.msg === 'Hallo', 'Signal message trimmed');
  }
  log('Physics: ' + checks + ' assertions passed.');

  // Smoke test real UI code with small DOM/canvas doubles, not a rendering test.
  const events = () => ({ listeners: {}, addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); },
    fire(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); } });
  class Element {
    constructor(id = '') { Object.assign(this, events()); this.id = id; this.children = []; this.attrs = {}; this.dataset = {}; this.value = '0'; this.textContent = ''; this.style = { setProperty() {} }; this.matches = {};
      this.classList = { toggle: (name, on) => { this.matches[name] = on === undefined ? !this.matches[name] : on; }, contains: (name) => !!this.matches[name] };
    }
    appendChild(el) { this.children.push(el); return el; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k] ?? null; }
    removeAttribute(k) { delete this.attrs[k]; }
    querySelector(key) { return (this.matches['query:' + key] ||= new Element(key)); }
    getBoundingClientRect() { return { width: 756, height: 540, top: 0, bottom: 540 }; }
    set innerHTML(value) { this.children = []; this.html = value; }
    get innerHTML() { return this.html; }
    focus() { this.focused = true; }
    click() { this.fire('click'); }
    setPointerCapture() {}
  }
  const nodes = new Map(), doc = Object.assign(events(), {
    hidden: false, body: new Element('body'),
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, new Element(id)); return nodes.get(id); },
    createElement() { return new Element(); },
    querySelector() { return this.body; }, querySelectorAll() { return []; }
  });
  const context = new Proxy({}, { get: (_, key) => key === 'measureText' ? (() => ({ width: 40 })) : key === 'createRadialGradient' ? (() => ({ addColorStop() {} })) : (() => {}), set: () => true });
  doc.getElementById('map').getContext = () => context;
  const media = Object.assign(events(), { matches: false });
  const win = Object.assign(events(), { matchMedia: () => media }); win.parent = win;
  let serial = 0, clock = 1000, intersection;
  const rafs = new Map(), timers = new Map(), storage = new Map();
  const raf = (fn) => { const id = ++serial; rafs.set(id, fn); return id; };
  const step = () => { clock += 20; const fns = [...rafs.values()]; rafs.clear(); fns.forEach((fn) => fn(clock)); };
  const flush = () => { for (let i = 0; i < 300 && rafs.size; i++) step(); };
  function IO(callback) { intersection = callback; this.observe = () => {}; }
  function RO() { this.observe = () => {}; }
  win.IntersectionObserver = IO; win.ResizeObserver = RO;
  const localStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) };
  const args = ['window', 'document', 'location', 'localStorage', 'ResizeObserver', 'IntersectionObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'performance'];
  new Function(...args, read('interactief/voyager-1-v2/visualisatie.js'))(win, doc, { hash: '#licht' }, localStorage, RO, IO, () => ({ overflowY: 'visible' }), raf, (id) => rafs.delete(id), (fn) => { const id = ++serial; timers.set(id, fn); return id; }, (id) => timers.delete(id), { now: () => clock });
  flush();
  assert(doc.getElementById('dKm').textContent !== '', 'UI initializes live numbers');
  assert(doc.getElementById('msList').children.length === 18, 'All milestones created');
  assert(doc.getElementById('cijfersBody').children.length === 18, 'Accessible table created');
  assert(rafs.size === 0 && timers.size === 1, 'Live scheduler sleeps between updates');
  const click = (id) => { doc.getElementById(id).click(); doc.fire('click'); flush(); };
  click('play');
  assert(rafs.size === 0 && timers.size === 0, 'Paused scene stops scheduling');
  click('msPrev');
  assert(doc.getElementById('status').textContent.length > 0, 'Milestone announced');
  assert(rafs.size === 0, 'Zoom settles after milestone');
  let prevented = false;
  doc.getElementById('map').fire('keydown', { key: '+', preventDefault() { prevented = true; } }); flush();
  assert(prevented, 'Map keyboard zoom handled');
  assert(!(doc.listeners.keydown || []).length, 'No document-wide spacebar interception');
  for (let i = 0; i < 5; i++) {
    doc.getElementById('sigMsg').value = '<b>Hallo</b>';
    doc.getElementById('sigForm').fire('submit', { preventDefault() {} }); doc.fire('click'); flush();
  }
  assert(JSON.parse(storage.get('voyager1-v2-lichtsignalen')).length === 4, 'Signal history bounded at four');
  assert(!storage.has('voyager1-lichtsignalen'), 'Original storage untouched');
  click('live');
  doc.hidden = true; doc.fire('visibilitychange');
  assert(rafs.size === 0 && timers.size === 0, 'Hidden tab cancels work');
  doc.hidden = false; doc.fire('visibilitychange'); flush();
  assert(timers.size === 1, 'Visible tab resumes live work');
  intersection([{ isIntersecting: false }]);
  assert(rafs.size === 0 && timers.size === 0, 'Offscreen visualization cancels work');
  intersection([{ isIntersecting: true }]); flush();
  media.matches = true; media.fire('change'); flush();
  assert(rafs.size === 0 && timers.size === 0 && doc.getElementById('play').textContent === 'Afspelen', 'Reduced motion pauses animation');
  log('UI smoke: ' + checks + ' cumulative assertions passed (DOM/canvas doubles).');

  // Exercise the real message handlers, including rejection of hostile messages.
  class TestURL {
    constructor(raw) {
      const match = /^(https?):\/\/([^/:]+)(?::(\d+))?/.exec(raw);
      if (!match) throw new Error('Invalid test URL');
      this.protocol = match[1] + ':'; this.hostname = match[2]; this.port = match[3] || '';
      this.origin = this.protocol + '//' + this.hostname + (this.port ? ':' + this.port : '');
    }
  }
  function MO() { this.observe = () => {}; }
  let identity = 0;
  const parent = Object.assign(events(), { crypto: { randomUUID: () => ++identity === 1 ? 'unique-test-id' : 'unique-test-id-' + identity } });
  const child = { sent: [], postMessage(data, origin) { this.sent.push({ data, origin }); } };
  const frame = Object.assign(new Element(), { src: 'https://scientias-news.github.io/interactief/voyager-1-v2/', contentWindow: child, isConnected: true });
  const secondChild = { sent: [], postMessage(data, origin) { this.sent.push({ data, origin }); } };
  const secondFrame = Object.assign(new Element(), { src: 'https://scientias-news.github.io/interactief/_sjabloon/', contentWindow: secondChild, isConnected: true });
  const parentDoc = { readyState: 'complete', documentElement: {}, querySelectorAll: () => [frame, secondFrame] };
  new Function('window', 'document', 'location', 'MutationObserver', 'URL', read('integratie/wordpress-parent.js'))(parent, parentDoc, { hostname: 'scientias.nl', href: 'https://scientias.nl/artikel/' }, MO, TestURL);
  assert(child.sent.length === 1 && child.sent[0].origin === 'https://scientias-news.github.io', 'Init uses explicit target origin');
  const payload = { type: 'scientias:embed:resize', version: 1, id: 'unique-test-id', height: 999 };
  const send = (changes = {}) => parent.fire('message', { data: payload, source: child, origin: 'https://scientias-news.github.io', ...changes });
  send({ origin: 'https://evil.example' }); assert(!frame.style.height, 'Wrong origin rejected');
  send({ source: {} }); assert(!frame.style.height, 'Wrong source rejected');
  for (const height of [NaN, Infinity, -1, 30001, '999']) { send({ data: { ...payload, height } }); assert(!frame.style.height, 'Invalid height rejected'); }
  send({ data: { ...payload, id: 'different' } }); assert(!frame.style.height, 'Wrong iframe ID rejected');
  send(); assert(frame.style.height === '999px', 'Valid resize accepted');
  send({ data: { ...payload, height: 400 } }); assert(frame.style.height === '400px', 'Height can shrink');
  assert(secondChild.sent[0].data.id !== child.sent[0].data.id, 'Each iframe has a distinct ID');
  send({ source: secondChild }); assert(!secondFrame.style.height, 'Another iframe cannot use the first ID');
  send({ source: secondChild, data: { ...payload, id: secondChild.sent[0].data.id, height: 800 } });
  assert(secondFrame.style.height === '800px', 'Second iframe resizes independently');
  assert(frame.style.height === '400px', 'Second iframe does not change the first');
  frame.fire('load'); assert(child.sent.length === 2, 'Reload triggers another handshake');
  const embedded = Object.assign(events(), { parent, scrollY: 0 });
  const parentMessages = []; parent.postMessage = (data, origin) => parentMessages.push({ data, origin });
  const body = Object.assign(new Element(), { children: [] });
  new Function('window', 'document', 'location', 'ResizeObserver', 'MutationObserver', 'requestAnimationFrame', 'getComputedStyle', read('assets/embed-child.js'))(embedded, { body }, { hostname: 'scientias-news.github.io' }, RO, MO, raf, () => ({ marginBottom: '0' }));
  const init = { type: 'scientias:embed:init', version: 1, id: 'one' };
  embedded.fire('message', { data: init, origin: 'https://evil.example', source: parent }); flush();
  assert(parentMessages.length === 0, 'Child rejects hostile parent origin');
  embedded.fire('message', { data: init, origin: 'https://scientias.nl', source: {} }); flush();
  assert(parentMessages.length === 0, 'Child rejects wrong window');
  embedded.fire('message', { data: init, origin: 'https://scientias.nl', source: parent }); flush();
  assert(parentMessages.length === 1 && parentMessages[0].origin === 'https://scientias.nl' && parentMessages[0].data.height === 540, 'Child replies to validated parent');
  log('All ' + checks + ' assertions passed.');
  return checks;
};
