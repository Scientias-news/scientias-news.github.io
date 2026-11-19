# Visualisaties in WordPress plaatsen

Dit is een voorstel. Er is niets geïnstalleerd op WordPress of Scientias.nl.
De bestaande Voyager-embed kan ongewijzigd blijven. Gebruik v2 pas na redactionele controle.

## Wat draait waar?

| Plek | Bestand/onderdeel | Verantwoordelijkheid |
| --- | --- | --- |
| GitHub Pages | Visualisatie met eigen HTML/CSS/JS | Inhoud en bediening |
| GitHub Pages | assets/v1/embed-child.js | Eigen inhoudshoogte meten en antwoorden aan vertrouwde host |
| Scientias.nl, eenmalig | wordpress-parent.js | Frames herkennen, veilige handshake en iframehoogte bijstellen |
| WordPress-artikel | iframe in Aangepaste HTML | Specifieke visualisatie en beschrijvende titel kiezen |

## Eenmalig voorstel voor de beheerder

Laat de beheerder `integratie/scientias-interactief.php` en `integratie/wordpress-parent.js`
samen in een eigen pluginmap plaatsen en activeren, eerst op een geschikte testomgeving.
De PHP-code registreert het script in de footer. Gebruik geen tweede exemplaar in artikelen.
Dit voorstel wijzigt geen thema, Gutenberg-instellingen, gebruikersrechten of CSP automatisch.

Voor een stagingdomein moet de exacte HTTPS-origin expliciet aan de kind-allowlist worden
toegevoegd. Alleen `https://scientias.nl` en `https://www.scientias.nl` zijn standaard toegestaan.
Voeg geen wildcard of ‘elk subdomein’-regel toe. Controleer in staging ook of een bestaande
CSP `frame-src https://scientias-news.github.io` en het lokale hostscript toestaat.

## Iframecode voor versie 2

Plaats na de eventuele merge en na redactionele goedkeuring dit in een blok **Aangepaste HTML**:

```html
<iframe
  data-scientias-embed
  src="https://scientias-news.github.io/interactief/voyager-1-v2/#embed"
  title="Interactieve kaart: de reis en afstand van Voyager 1"
  style="display:block;width:100%;height:2200px;border:0;"
  loading="lazy">
</iframe>
<p><a href="https://scientias-news.github.io/interactief/voyager-1-v2/">
  Open de Voyager-kaart afzonderlijk
</a></p>
```

De hoogte van 2200 pixels is een beginwaarde en terugval wanneer scripts worden geblokkeerd.
Gebruik geen `scrolling="no"`, geen verborgen overflow op een krappe wrapper en geen vaste
beeldverhouding. Als automatische hoogte uitvalt blijft de iframe intern scrollbaar.
De afzonderlijke link biedt bovendien een bruikbare uitweg voor bezoekers.
De beginhoogte kan na een echte mobiele controle verder worden afgestemd.

Kies expliciet `#embed-licht` of `#embed-donker` voor een vaste startkleur. Zonder kleuraanduiding
kan de eerder gekozen v2-kleur uit lokale opslag worden gebruikt. De bezoeker kan altijd wisselen.

Dezelfde code kan op meerdere artikelen of meermaals op één pagina staan.
Elke iframe krijgt een eigen communicatie-ID en eigen toestand in het document. Thema en maximaal
vier opgeslagen signalen zijn wel per browser/origin en v2 gedeeld. Er is geen synchronisatie
van actieve bediening tussen twee open iframes.

Voor een nieuw element verander je alleen de naam in de twee URL's, de titel en de beginhoogte:

```html
<iframe data-scientias-embed
  src="https://scientias-news.github.io/interactief/jouw-onderwerp/"
  title="Interactieve uitleg: omschrijf hier het onderwerp"
  style="display:block;width:100%;height:600px;border:0;"
  loading="lazy"></iframe>
```

Zonder eenmalig WordPress-hostscript werkt de visualisatie zelf nog steeds. De hoogte past zich
dan niet automatisch aan. JavaScript direct in een artikel plakken is onbetrouwbaar omdat
WordPress of een beveiligingsfilter script-elementen kan verwijderen.

## Veiligheidsafspraken in het protocol

1. De host kiest alleen `iframe[data-scientias-embed]` met de verwachte GitHub Pages-origin.
2. De host verstuurt `scientias:embed:init`, versie 1 en een willekeurig ID naar een exacte origin.
3. Het kind accepteert alleen `window.parent` met een expliciet toegestaan Scientias-domein.
4. Het kind meet zijn inhoud met ResizeObserver en geeft hoogte en ID terug.
5. De host controleert berichttype, versie, ID, `event.origin` en `event.source`.
6. Alleen eindige numerieke hoogtes tussen 100 en 30.000 pixels worden geaccepteerd.

Er worden geen boodschappen, gebruikersgegevens of artikelinhoud uitgewisseld. Er is geen `eval`,
geen wildcard-targetOrigin en geen toegang tot de DOM van het andere domein. Elk geldig bericht
kan uitsluitend de hoogte van zijn eigen iframe aanpassen. Nieuwe typen visualisaties met meer
dan 30.000 pixels hoogte vragen een expliciete aanpassing van de limiet aan beide kanten.

De inhoud wordt gemeten vanaf de body en zijn kinderen, niet met
`documentElement.scrollHeight`. Dat laatste blijft soms minimaal zo hoog als de iframe zelf
en verhindert krimpen. De hoogtecode werkt voor documenten die met hun inhoud meegroeien.
Gebruik daarom geen `height:100vh`, `min-height:100vh` of beeldvullende absolute positionering
in een embed. Langzame lettertypen, details en veranderende teksten worden opnieuw gemeten.

Het browserwiel wordt zonder Ctrl/⌘ niet overgenomen. Verticaal vegen blijft beschikbaar
voor het artikel. Knijpen op de Voyager-kaart vangt het element zelf af (touch events met `preventDefault`),
zodat browserzoom of het artikel rond de iframe het gebaar niet overneemt. Zoomkeuzes en
toetsenbordbediening blijven daarnaast altijd beschikbaar.

## Proef zonder productieaanpassingen

Start vanuit de repository in twee terminals:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

```sh
python3 -m http.server 8001 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/integratie/voorbeeld.html`.
De poorten verschillen, dus dit test echte communicatie tussen verschillende origins.
Lokale toegang is beperkt tot localhost/127.0.0.1 op poort 8000/8001 wanneer ook het
document zelf lokaal draait. Die uitzondering geeft geen extra productiedomeinen toegang.

Controleer groeien en krimpen met ‘Alle mijlpalen’, de tabel en maximaal vier signalen.
De tweede iframe moet onafhankelijk blijven. Scroll daarna naar het einde van het proefartikel.
Een definitieve controle in de echte WordPress-omgeving blijft nodig vanwege themastijlen,
lazy loaders, HTML-filters, CSP en eventuele consentsoftware.

Technische achtergrond: [Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).
