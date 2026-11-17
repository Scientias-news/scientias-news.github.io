# Scientias Interactief

Deze repository host afzonderlijke interactieve visualisaties voor [Scientias.nl](https://scientias.nl/). Elke visualisatie heeft een eigen URL en kan onafhankelijk in een WordPress-artikel worden ingesloten.

**Website:** https://scientias-news.github.io/

## Indeling

- `index.html`: publieksindex met links naar uitgelichte visualisaties.
- `assets/style.css`: gedeelde basisopmaak.
- `interactief/_sjabloon/`: kopieerbaar startpunt voor nieuwe losse interactieve elementen.
- `interactief/<naam>/`: aanbevolen plek voor iedere nieuwe productievisualisatie.
- `voorbeelden/golflengte/`: bestaande demonstratie, met eigen HTML en JavaScript.
- `.nojekyll`: publiceer statische bestanden zonder Jekyll.

Elke visualisatie werkt zelfstandig met een eigen `index.html`. Specifieke CSS en JavaScript staan in dezelfde map. Nieuwe visualisaties veranderen bestaande exemplaren niet, behalve als je de gedeelde CSS bewust wijzigt.

## Nieuw interactief element toevoegen

1. Kopieer de hele map `interactief/_sjabloon/` naar `interactief/<unieke-korte-naam>/`.
2. Bewerk `index.html`, `style.css` en `script.js` in die nieuwe map.
3. Test het element op desktop, mobiel en met toetsenbord.
4. Commit naar `main`. GitHub Pages publiceert de bestanden bij de volgende deployment.
5. Gebruik `https://scientias-news.github.io/interactief/<unieke-korte-naam>/` in het WordPress-iframe.
6. Voeg alleen als gewenst een link op de hoofdpagina toe. Dit is **niet nodig** om de visualisatie te publiceren.

**Belangrijk:** houd nieuwe mappen direct onder `interactief/`, op dezelfde diepte als `_sjabloon`. De verwijzing naar de gedeelde stylesheet is daarop afgestemd.

## WordPress

Plaats in een blok **Aangepaste HTML**:

```html
<iframe
  src="https://scientias-news.github.io/voorbeelden/golflengte/"
  title="Interactieve uitleg over golflengte en frequentie"
  style="display:block;width:100%;height:490px;border:0;"
  loading="lazy">
</iframe>
```

Pas `src`, `title` en `height` per element aan. De breedte is responsief; de hoogte is niet automatisch responsief. Controleer de iframe dus ook op een mobiel scherm. Dynamische hoogte vereist eventueel aanvullende `postMessage`-code aan zowel de iframe- als de WordPress-kant.

## GitHub Pages configuratie

In **Settings → Pages**: **Deploy from a branch**, `main`, `/(root)`. Omdat de repository de naam `scientias-news.github.io` heeft, is dit een GitHub Pages-accountsite met de URL https://scientias-news.github.io/.

## Redactionele afspraken

- Geef ieder element een beschrijvende, blijvende URL.
- Gebruik relatieve paden naar eigen JavaScript/CSS en laad alleen wat nodig is.
- Vermeld bij werkelijke data bron, peildatum, eenheden en onzekerheden.
- Houd bediening en tekst toegankelijk met toetsenbord en mobiele schermen.
- Zet geen wachtwoorden, persoonlijke gegevens of geheime API-sleutels in publieke bestanden.
- Controleer de visualisatie in het gepubliceerde Scientias-artikel op iframebeleid, vormgeving en prestaties.
