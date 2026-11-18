# Kwaliteit, testresultaten en openstaande controles

Bijgewerkt op 17 november 2026 voor het afzonderlijke herstel van de modelovergang rond 2400.

## Uitgevoerde tests

| Controle | Resultaat |
| --- | --- |
| Oorspronkelijke Voyager Git-blob (`tests/fixtures/voyager-1-origineel.html.txt`) | Exact gelijk aan 971558a2a0b6ee0aa1f87a12ec4c1b896a46246c |
| Numerieke controles, inclusief de herstelde modelovergang | 16.015 assertions geslaagd |
| DOM/canvas-smoketest en scheduler | 15 aanvullende assertions geslaagd |
| Berichtvalidatie host en kind | 19 aanvullende assertions geslaagd |
| Totaal JavaScript | 16.049 assertions geslaagd met GJS/SpiderMonkey |
| Structuur, lokale verwijzingen en IDs | Geslaagd: 6 HTML-pagina’s, Markdown-links, IDs en UI-verwijzingen |

De numerieke regressie gebruikt de oorspronkelijke inline code rechtstreeks als referentie, niet
een opnieuw geïmplementeerde versie. Er worden 210 tijdstippen gecontroleerd, inclusief lancering,
passages, de aansluiting in 1982, de lichtdag, de verre toekomst en 200 logaritmische stappen.
Planeet- en sterposities blijven over die hele reeks exact gelijk. De positie van Voyager
blijft vóór de herstelde overgang exact gelijk binnen dezelfde JavaScript-engine. Na de overgang
controleren de tests de bedoelde correctie en de daarvan afgeleide uitkomsten. Aanvullende
continuïteitstests vergelijken punten één milliseconde, één seconde en één dag aan beide kanten.
Een onafhankelijke numerieke voortzetting controleert de langetermijnformule tot 100 jaar na
de overgang. De nieuwe continuïteitstest faalt met de oude code en slaagt na het herstel.
Dit bewijst de gerichte reparatie, niet de juistheid van alle oorspronkelijke modelaannames.

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
naar main. De workflow heeft alleen leesrechten en publiceert geen website. Voor de oorspronkelijke
v2-basis op commit `be81539ea512b204b108c277346e0ae0fac6b417` zijn beide jobs
[op GitHub geslaagd](https://github.com/Scientias-news/scientias-news.github.io/actions/runs/44126549894).
Voor deze afzonderlijke correctie zijn de JavaScript- en Python-controles lokaal herhaald.
De Node- en browsercontroles moeten opnieuw op de nieuwe pull request draaien.

## Browsercontrole

Een lokale browser kon in de uitvoeromgeving niet worden gestart. De bestaande automatische
browsercontroles zijn inmiddels wel in GitHub Actions geslaagd voor de oorspronkelijke v2-basis.
Ze zijn nog niet opnieuw uitgevoerd voor de correctie rond 2400. Echte touchgebaren en
schermlezerervaring blijven afzonderlijke handmatige controles.

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
van het canvas zonder HUD-overlays met het origineel (`tests/fixtures/voyager-1-origineel.html.txt`, via een onderschepte route als HTML geserveerd) bij een bevroren klok, controleert toetsenbordbediening,
donkere modus, tekstveilige signalen, minder beweging en groei/krimp van twee iframes.
Screenshots verschijnen in `test-results/`, buiten Git. Deze testafhankelijkheid maakt geen
deel uit van de gepubliceerde visualisatie en is niet nodig voor GitHub Pages.

Controleer daarnaast handmatig op iOS Safari en Android Chrome: verticaal artikel-scrollen,
horizontaal draaien van de kaart, beschikbare zoomknoppen, eventuele browserpinch en het
verdwijnen/hervatten van animatie. Controleer met NVDA of VoiceOver de volgorde, tijdlijnwaarden,
mijlpalen en tabel. De kleine stippen boven de tijdlijn blijven een aanvullende bediening met
kleine aanraakdoelen; de grote vorige/volgende-knoppen en mijlpaalregels zijn het alternatief.

## Openstaande inhoudelijke punten

- Planeetmodel is vereenvoudigd en wordt buiten zijn geldigheidsperiode doorgetrokken.
- ‘Dichtstbijzijnde ster’ zoekt alleen in een selectie van 15 sterren zonder de zon.
- Geen galactische zwaartekracht of foutvoortplanting; geen volledige herkomst per sterrecord.
- Kilometers en seconden in het scherm suggereren meer nauwkeurigheid dan het model biedt.
- De historische detailteksten, Oortgrensformuleringen en actuele instrumentstatus vragen inhoudelijke controle.

Zie [METHODE.md](../interactief/voyager-1-v2/METHODE.md) voor de onderbouwing.
Historische teksten zijn niet aangepast. Alleen de aansluiting op de langetermijnformule is
numeriek hersteld; zie [FIX_2400.md](FIX_2400.md).

## Openstaande integratie en publicatie

De oorspronkelijke v2-basis staat inmiddels op main. Dit herstel is afzonderlijk voorbereid op
`codex/fix-voyager-2400-jump` en mag pas na review worden samengevoegd. Er is vanuit deze
werkzaamheden geen WordPress-code geïnstalleerd. De echte WordPress-omgeving moet vóór ingebruikname
worden gecontroleerd op scriptfilters, CSP, lazy loading, hoogte en scrollgedrag.
