# Regels voor aanraken, zoomen en animatie

Deze regels gelden voor elk element dat je kunt slepen, draaien, zoomen of dat beweegt.
Ze komen uit de problemen met de Voyager-kaart op iPad (pull requests #5 en #6). Een
werkend voorbeeld staat in `interactief/voyager-1-v2/visualisatie.js` onder
"slepen, zoomen, knijpen". `tests/structure.py` controleert de regels die automatisch te
controleren zijn.

## 1. Het artikel blijft scrollen

Een iframe staat midden in een artikel. Wie met één vinger omhoog of omlaag veegt, wil
verder lezen, niet de kaart bedienen.

- Geef het canvas of de kaart `touch-action: pan-y`. Gebruik geen `none`: dan zit een
  lezer met de vinger op de kaart vast.
- Gebruik voor het muiswiel alleen Ctrl/⌘ + scroll om te zoomen. Gewoon scrollen gaat naar
  het artikel.

## 2. Knijpen doe je zelf, nooit de browser

- **Zet nooit `pinch-zoom` in `touch-action`** van een element dat zelf zoomt. Dan mag de
  browser het gebaar overnemen: soms zoomt de kaart, vaker de hele pagina of het artikel
  rond de iframe. De test faalt op deze regel.
- Handel vingers af met **touch events** (`touchstart`, `touchmove`, `touchend`,
  `touchcancel`), niet met pointer events. Alleen een `touchmove`-listener met
  `{ passive: false }` en `preventDefault()` kan de browser tegenhouden. Pointer events
  krijgen een `pointercancel` zodra de browser het gebaar pakt, en dan stopt je zoom
  halverwege.
- Muis en pen mogen via pointer events blijven lopen. Sla dan `pointerType === 'touch'` over,
  anders verwerk je vingers twee keer.
- Beslis bij één vinger pas na ongeveer 8 pixels beweging wat de lezer doet. Overwegend opzij:
  `preventDefault()` en de kaart bedienen. Overwegend verticaal: niets doen, zodat het
  artikel scrolt.
- Blokkeer in Safari ook `gesturestart`, `gesturechange` en `gestureend` met
  `preventDefault()`. Op de Mac komt trackpad-knijpen in Safari alleen via deze events binnen.

## 3. Elke interactie maakt de tekenlus wakker

Animaties die stilstaan of langzaam lopen, tekenen spaarzaam om de batterij te sparen.
Bijvoorbeeld de Live-stand van Voyager, die één keer per seconde tekent.

- Elke soort invoer moet de lus wakker maken en een eventuele slaaptimer annuleren: muis,
  wiel, toetsenbord en ook touch. Vergeet je er één, dan schokt de kaart met één beeld per
  seconde. Dat was precies de fout in #5.
- Gebruik één `requestAnimationFrame`-lus. Start nooit een tweede lus vanuit een listener,
  maar zet een vlag (`dirty`) en laat de bestaande lus tekenen.
- Stop met tekenen als de kaart buiten beeld is (`IntersectionObserver`) of het tabblad
  verborgen is (`document.hidden`).

## 4. Altijd een alternatief

Gebaren werken niet voor iedereen en niet in elke browser.

- Bied knoppen voor zoomen en resetten, en bediening met het toetsenbord.
- Leg de gebaren uit in een korte hint op de kaart. Toon de touchhint ook op tablets met
  `@media (hover: none) and (pointer: coarse)`, niet alleen onder een bepaalde
  schermbreedte. Een iPad is breder dan een telefoon.
- Respecteer `prefers-reduced-motion`.

## 5. Testen voor publicatie

De automatische tests draaien in een browser zonder echte vingers. Controleer daarom met
de hand, op een echte iPad (Safari) en een Android-telefoon (Chrome), in de losse pagina én
in de WordPress-preview:

- [ ] Met één vinger verticaal vegen scrolt het artikel, ook als je op de kaart begint.
- [ ] Opzij vegen bedient de kaart zonder dat de pagina meeschuift.
- [ ] Knijpen zoomt alleen de kaart, elke keer, ook na tien keer achter elkaar.
- [ ] Knijpen en vegen voelen even soepel als met de muis, ook in de Live- of afspeelstand.
- [ ] Dubbeltikken zoomt de pagina niet onverwacht in.
- [ ] De touchhint is zichtbaar op tablet en telefoon.

Twijfel je over soepelheid? Tel in de browserconsole hoe vaak het canvas tekent tijdens een
gebaar. Rond 60 keer per seconde is goed, en 1 keer per seconde betekent dat regel 3
geschonden is. Zie de meting in pull request #6.

## Codepatroon

Een ingekorte versie van de Voyager-aanpak. Pas `zoom`, `draai` en `teken` aan.

```js
let gebaar = null;
const paar = (t) => ({
  d: Math.max(1, Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)),
});
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length >= 2) {
    e.preventDefault();
    gebaar = { soort: 'knijp', d: paar(e.touches).d, zoom: staat.zoom };
  } else {
    const t = e.touches[0];
    gebaar = { soort: 'wacht', x0: t.clientX, y0: t.clientY, x: t.clientX };
  }
  teken();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  if (!gebaar) return;
  if (gebaar.soort === 'knijp' && e.touches.length >= 2) {
    e.preventDefault();
    staat.zoom = gebaar.zoom + Math.log10(paar(e.touches).d / gebaar.d);
  } else if (e.touches.length === 1) {
    const t = e.touches[0];
    if (gebaar.soort === 'wacht') {
      const dx = Math.abs(t.clientX - gebaar.x0), dy = Math.abs(t.clientY - gebaar.y0);
      if (dx < 8 && dy < 8) return;
      gebaar.soort = dx > dy ? 'draai' : 'scroll';
    }
    if (gebaar.soort === 'draai') { e.preventDefault(); draai(t.clientX - gebaar.x); }
    gebaar.x = t.clientX;
  }
  teken(); // maakt de tekenlus wakker, ook als die sliep (regel 3)
}, { passive: false });
const einde = (e) => { if (!e.touches.length) gebaar = null; };
canvas.addEventListener('touchend', einde);
canvas.addEventListener('touchcancel', einde);
['gesturestart', 'gesturechange', 'gestureend'].forEach((type) =>
  canvas.addEventListener(type, (e) => e.preventDefault()));
```

```css
canvas { touch-action: pan-y; }
```
