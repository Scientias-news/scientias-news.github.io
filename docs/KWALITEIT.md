# Kwaliteit, testresultaten en openstaande controles

Gecontroleerd op 17 november 2026, vóór publicatie of samenvoeging.

## Uitgevoerde tests

| Controle | Resultaat |
| --- | --- |
| Oorspronkelijke Voyager Git-blob | Exact gelijk aan 971558a2a0b6ee0aa1f87a12ec4c1b896a46246c |
| Numerieke regressie tegen oorspronkelijke scripts | 16.005 assertions geslaagd |
| DOM/canvas-smoketest en scheduler | 15 aanvullende assertions geslaagd |
| Berichtvalidatie host en kind | 19 aanvullende assertions geslaagd |
| Totaal JavaScript | 16.039 assertions geslaagd met GJS/SpiderMonkey |
| Structuur, lokale verwijzingen en IDs | Geslaagd: 6 HTML-pagina’s, Markdown-links, IDs en UI-verwijzingen |

De numerieke regressie gebruikt de oorspronkelijke inline code rechtstreeks als referentie, niet
een opnieuw geïmplementeerde versie. Er worden 210 tijdstippen gecontroleerd, inclusief lancering,
passages, de aansluiting in 1982, de lichtdag, de verre toekomst en 200 logaritmische stappen.
Planeten, Voyager en alle 15 sterren worden per coördinaat vergeleken. De uitkomsten zijn exact
gelijk binnen dezelfde JavaScript-engine. Dat bewijst behoud van het model, niet de juistheid
van de oorspronkelijke aannames.

Aanvullende tests controleren ankerpunten, lichtdagkalibratie (tolerantie 1e-7 AE, circa 15 km),
afnemende snelheid, Oortgrenzen, tijdlijntransformaties en signaalonderschepping. Voor een signaal
op een miljoen jaar afstand is de residutolerantie 1e-5 AE door de beperkte precisie van grote
millisecondengetallen. De UI-smoketest gebruikt DOM- en canvasdubbels. Hij voert de echte
bedieningscode uit maar controleert geen echte browserlayout of schilderresultaat.

## Zelf herhalen

Vanuit de repository, zonder pakketinstallatie:

```sh
node tests/run.cjs
python3 tests/structure.py
```

Als Node niet is geïnstalleerd maar GJS wel:

```sh
gjs tests/run-gjs.js
```

De GitHub Actions-workflow voert de Node-, Python- en browsercontroles uit bij pull requests en pushes
naar main. De workflow heeft alleen leesrechten en publiceert geen website. De workflow is in
deze omgeving nog niet op GitHub uitgevoerd.

## Echte browsercontrole, nog uit te voeren

Een lokale browser kon in de uitvoeromgeving niet worden gestart. De browserinterface weigerde
de lokale bestands-URL. Daarom zijn visuele regressie, echte touchgebaren en schermlezerervaring
nog niet bevestigd. Geen van de onderstaande browserchecks wordt als geslaagd gepresenteerd.

Er staat een reproduceerbaar Playwright-script in `tests/browser.cjs`. Installeer desgewenst
uitsluitend voor ontwikkeling, vanaf de repositoryroot:

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
```

Start de twee lokale HTTP-servers uit [WORDPRESS.md](WORDPRESS.md) en voer uit:

```sh
node tests/browser.cjs
```

Het script controleert 320, 390, 768 en 1280 pixels, maakt screenshots, vergelijkt de beginpixels
van het canvas zonder HUD-overlays met het origineel bij een bevroren klok, controleert toetsenbordbediening,
donkere modus, tekstveilige signalen, minder beweging en groei/krimp van twee iframes.
Screenshots verschijnen in `test-results/`, buiten Git. Deze testafhankelijkheid maakt geen
deel uit van de gepubliceerde visualisatie en is niet nodig voor GitHub Pages.

Controleer daarnaast handmatig op iOS Safari en Android Chrome: verticaal artikel-scrollen,
horizontaal draaien van de kaart, beschikbare zoomknoppen, eventuele browserpinch en het
verdwijnen/hervatten van animatie. Controleer met NVDA of VoiceOver de volgorde, tijdlijnwaarden,
mijlpalen en tabel. De kleine stippen boven de tijdlijn blijven een aanvullende bediening met
kleine aanraakdoelen; de grote vorige/volgende-knoppen en mijlpaalregels zijn het alternatief.

## Openstaande inhoudelijke punten

- Modelovergang rond januari 2400 geeft een bestaande sprong van circa 8,60 miljoen km.
- Planeetmodel is vereenvoudigd en wordt buiten zijn geldigheidsperiode doorgetrokken.
- ‘Dichtstbijzijnde ster’ zoekt alleen in een selectie van 15 sterren zonder de zon.
- Geen galactische zwaartekracht of foutvoortplanting; geen volledige herkomst per sterrecord.
- Kilometers en seconden in het scherm suggereren meer nauwkeurigheid dan het model biedt.
- De historische detailteksten, Oortgrensformuleringen en actuele instrumentstatus vragen inhoudelijke controle.

Zie [METHODE.md](../interactief/voyager-1-v2/METHODE.md) voor de onderbouwing.
Voor deze refactoring zijn geen berekeningen of historische teksten aangepast.

## Openstaande integratie en publicatie

GitHub-schrijven is door de automatische toestemmingscontrole geblokkeerd. Er is lokaal een branch
en commit voorbereid maar geen remote branch of pull request aangemaakt. Er is niets gemerged.
Ook is geen WordPress-code geïnstalleerd. De voorbereidende PR-tekst staat in
[PULL_REQUEST.md](PULL_REQUEST.md). De echte WordPress-omgeving moet vóór ingebruikname
worden gecontroleerd op scriptfilters, CSP, lazy loading, hoogte en scrollgedrag.
