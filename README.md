# Scientias Interactief

Deze repository host afzonderlijke interactieve visualisaties voor [Scientias.nl](https://scientias.nl/). Elke visualisatie heeft een eigen URL en kan onafhankelijk in een WordPress-artikel worden ingesloten.

**Website:** https://scientias-news.github.io/

## Indeling

- `index.html`: de voorpagina. Die stuurt bezoekers van https://scientias-news.github.io/ direct door naar Scientias.nl.
- `overzicht/index.html` en `overzicht.css`: overzicht met links naar alle visualisaties, op https://scientias-news.github.io/overzicht/. Bedoeld voor de redactie en niet voor zoekmachines. Deze opmaak mag vrij veranderen.
- `assets/v1/`: gedeelde bestanden die gepubliceerde elementen laden (`style.css`, `basis.css`, `embed-child.js`). **Bevroren:** zie hieronder.
- `assets/v2/fonts/`: gedeeld Montserrat-subset (400, 500, 600, 700) voor nieuwe elementen in de Scientias-huisstijl. Ook bevroren.
- `interactief/_sjabloon/`: kopieerbaar startpunt voor nieuwe losse interactieve elementen.
- `interactief/<naam>/`: aanbevolen plek voor iedere nieuwe productievisualisatie.
- `interactief/voyager-1-v2/`: Voyager 1, één lichtdag van huis.
- `interactief/fijnstof-europese-steden/`: kaart met fijnstof in 761 Europese steden.
- `voorbeelden/golflengte/`: oudere demonstratie. Staat om historische redenen buiten `interactief/` en blijft daar, omdat artikelen naar deze URL kunnen verwijzen.
- `tests/`: controles die GitHub Actions bij elke wijziging draait.
- `docs/`: handleidingen; `docs/archief/` bevat afgeronde projectverslagen.
- `.nojekyll`: publiceer statische bestanden zonder Jekyll.

Elke visualisatie werkt zelfstandig met een eigen `index.html`. Specifieke CSS en JavaScript staan in dezelfde map. Nieuwe visualisaties veranderen bestaande exemplaren niet, behalve als je de gedeelde CSS bewust wijzigt.

## Nieuw interactief element toevoegen

1. Kopieer de hele map `interactief/_sjabloon/` naar `interactief/<unieke-korte-naam>/`.
2. Bewerk `index.html`, `style.css`, `physics.js`, `visualisatie.js` en `METHODE.md` in die nieuwe map.
3. Test het element op desktop, mobiel en met toetsenbord. Kun je slepen, zoomen of beweegt er iets, volg dan [de regels voor aanraken, zoomen en animatie](docs/INTERACTIE.md).
4. Werk op een eigen branch en open een pull request naar `main`. Laat een collega controleren voordat iemand samenvoegt. GitHub Pages publiceert de bestanden na de merge bij de volgende deployment.
5. Gebruik `https://scientias-news.github.io/interactief/<unieke-korte-naam>/` in het WordPress-iframe.
6. Voeg een tegel toe aan `overzicht/index.html`. Gebruik daar `../interactief/<naam>/` als link. De tests controleren dat elk element onder `interactief/` op de overzichtspagina staat.
   Moet een element bewust niet op de overzichtspagina, zet de mapnaam dan in `NIET_IN_INDEX` in `tests/structure.py`.

**Belangrijk:** houd nieuwe mappen direct onder `interactief/`, op dezelfde diepte als `_sjabloon`. De verwijzing naar de gedeelde stylesheet is daarop afgestemd.

## Blijvend publiceren

Visualisaties staan in artikelen die jarenlang online blijven. Daarom gelden drie regels:

1. **URL's veranderen nooit.** Hernoem of verwijder geen gepubliceerde map. Is dat toch nodig, laat dan een doorverwijzing achter.
2. **Gedeelde bestanden zijn bevroren.** Een gepubliceerde versie in `assets/vN/` wordt nooit meer gewijzigd; de tests controleren dat met hashes. Wil je de gedeelde basis verbeteren, maak dan `assets/v2/` en laat alleen nieuwe elementen die laden. Oude elementen blijven op `v1`.
3. **Een nieuwe versie van een element krijgt een nieuwe map** (bijvoorbeeld `maanfasen-v2`) alleen als de wijziging de betekenis van een al geplaatste iframe zou veranderen. Kleine correcties, zoals een typfout of een kapotte knop, mogen in de bestaande map.

## WordPress

Zie [de uitgebreide WordPress-handleiding](docs/WORDPRESS.md) voor automatische iframehoogte,
veilige communicatie en een afzonderlijk voorstel voor een eenmalig hostscript.
Onderstaand bestaand voorbeeld blijft bruikbaar met vaste hoogte.

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

Begin bij [de korte redactiehandleiding](docs/REDACTIE.md), inclusief publicatiechecklist.

## Voyager 1

[Versie 2](interactief/voyager-1-v2/) is de gepubliceerde Voyager-visualisatie; het overzicht
verwijst ernaar. De oorspronkelijke map `interactief/voyager-1/` is op 18 november 2026 verwijderd
en is niet meer publiek bereikbaar. Het oorspronkelijke bestand staat ongewijzigd als testreferentie in
`tests/fixtures/voyager-1-origineel.html.txt`, zodat de tests versie 2 nog steeds met het origineel kunnen vergelijken.

- [Analyse van de bestaande repository](docs/archief/voyager-1-v2/ANALYSE.md)
- [Verschillen tussen de versies](docs/archief/voyager-1-v2/VERSCHILLEN.md)
- [Methode, bronnen en modelbeperkingen](interactief/voyager-1-v2/METHODE.md)
- [Testresultaten en openstaande controles](docs/KWALITEIT.md)
- [Voorbereide pull request](docs/archief/voyager-1-v2/PULL_REQUEST.md)
- [Oplevering en de branch overdragen](docs/archief/voyager-1-v2/OPLEVERING.md)

Publicatie heeft geen buildproces nodig. Ontwikkeltests draaien met `node tests/run.cjs` en
`python3 tests/structure.py`; browsercontroles zijn apart beschreven in de kwaliteitsdocumentatie.
De structuur- en browsercontroles gelden automatisch voor elke map onder `interactief/`: bestanden laden zonder fouten, geen horizontaal scrollen op 320 pixels, gedeelde bestanden alleen uit `assets/vN/` en een tegel op de overzichtspagina.

## Afspraken per element

- Geef ieder element een beschrijvende, blijvende URL.
- Gebruik relatieve paden naar eigen JavaScript/CSS en laad alleen wat nodig is.
- Vermeld bij werkelijke data bron, peildatum, eenheden en onzekerheden.
- Houd bediening en tekst toegankelijk met toetsenbord en mobiele schermen.
- Zet geen wachtwoorden, persoonlijke gegevens of geheime API-sleutels in publieke bestanden.
- Controleer de visualisatie in het gepubliceerde Scientias-artikel op iframebeleid, vormgeving en prestaties.
