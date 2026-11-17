# Analyse van de bestaande repository

Referentie: GitHub-commit `e812c6ef0acc6da12fad78d56745bee820248b51`, gelezen op 17 november 2026.
Alle 11 oorspronkelijke bestanden zijn bekeken. De oorspronkelijke Voyager-map bevat uitsluitend `index.html`.
De Git-blob van dat bestand is `971558a2a0b6ee0aa1f87a12ec4c1b896a46246c` (70.010 bytes).
Deze blob is in de lokale branch ongewijzigd. De tests bewaken dit ook na samenvoegen.

## Repository

| Onderdeel | Bestaande werking | Aanpak |
| --- | --- | --- |
| index.html | Overzicht met golflengtevoorbeeld en Voyager | Ongewijzigd; v2 wordt geen standaard |
| assets/style.css | Algemene opmaak, voornamelijk groenblauw | Ongewijzigd om bestaande embeds te beschermen |
| voorbeelden/golflengte/ | Kleine zelfstandige demonstratie | Ongewijzigd |
| interactief/_sjabloon/ | HTML, CSS en script voor een generieke schuifregelaar | Bijgewerkt naar werkend voorbeeld met model en bediening apart |
| interactief/voyager-1/ | Complete Voyager-visualisatie in één bestand | Ongewijzigd, ook de URL |
| .nojekyll | Statische publicatie zonder Jekyll | Ongewijzigd |

## Voyager: structuur en gedrag

De HTML bevat een merkbalk, introductie, vier kerncijfers, een 2D-canvas met een 3D-projectie,
zoomkeuzes, tijdknoppen, een logaritmische tijdlijn, 18 mijlpalen, een inklapbare tabel,
een signaalformulier en een methodeverantwoording. Alle vormgeving staat in één style-element.
Het eerste script bevat voornamelijk fysica. Het tweede script sluit toestand en bediening in een IIFE op.
Een deel van de modelberekeningen staat nog in dat tweede script.

De vormgeving gebruikt zwart, wit en groen, een maximale breedte van 800 pixels en lichte/donkere modus.
Montserrat is opgegeven maar wordt nergens geladen. De feitelijke weergave gebruikt dus een lokaal
beschikbaar lettertype of Helvetica Neue/Arial. V2 behoudt dit zonder een externe fontafhankelijkheid toe te voegen.
De kerncijfers staan onder 640 pixels in één kolom. De kaart is 540 pixels hoog op desktop en 440 pixels op mobiel.
Onder 980 pixels staat standaard één actieve mijlpaal in beeld.

De toestand bevat tijd, afspeelsnelheid, richting, draaiing, kanteling, zoom, volgmodus en maximaal vier signalen.
Vaste geometrie wordt al vooraf berekend: acht planeetbanen, 401 baanpunten en 1.600 Oortwolkpunten.
Licht/donker en signalen worden lokaal opgeslagen. `#embed`, `#donker`, `#licht` en combinaties sturen de presentatie.
Er worden geen bibliotheken, API's, trackers of gegevensbestanden van externe servers geladen.
Bronlinks openen externe websites alleen na een klik. Canvas, Intl, Pointer Events, matchMedia,
ResizeObserver en localStorage zijn browserfuncties die de code gebruikt.

## Noodzakelijk voor dit project

| Aandachtspunt | Probleem | Uitvoering in v2 |
| --- | --- | --- |
| Onderhoud | HTML, CSS en modellen zijn samen circa 70 kB | Afzonderlijke bestanden met een kleine modelinterface |
| Toegankelijkheid | Canvas draaien en fijn zoomen alleen met pointer; spatie wordt documentbreed onderschept | Focus op canvas, pijltjes en +/−; normale knopactivering blijft intact |
| Tijdlijn | Schermlezer krijgt een getal van 0 tot 10.000 | Leesbaar tijdstip met aria-valuetext |
| Mijlpalen | Geselecteerde/uitgeklapte toestand alleen visueel | aria-current, aria-expanded en een rustige statusmelding na selectie |
| Mobiel scrollen | Desktop canvas neemt scrollen over; iframegedrag hangt van #embed af | Ctrl/⌘ vereist voor wielzoom; native verticaal scrollen toegestaan |
| Iframehoogte | Geen protocol voor veranderen van hoogte | Gedeeld kindscript en afzonderlijk WordPress-voorstel |
| Versie-isolatie | V1 en v2 zouden dezelfde opslag gebruiken | Eigen v2-sleutels voor thema en signalen |
| Lokale opslag | Alleen te gecontroleerd; ta/tr/msg/id kunnen ongeldig zijn | Types, volgorde en lengtes gecontroleerd |
| Beweging | Permanente RAF, ook gepauzeerd of onzichtbaar | Eén scheduler; stoppen bij onzichtbaarheid/pauze; live elke seconde |
| Minder beweging | Geen ondersteuning in animatielogica | Rustige start zonder automatisch afspelen en zonder pulse/overgangen |

## Optionele optimalisaties

Canvaslagen cachen, labelmetingen cachen, minder Oortpunten tekenen en de initiële zoekactie naar
sterrenontmoetingen verplaatsen naar een worker zijn mogelijke vervolgstappen. Ze zijn nu niet toegepast:
ze veranderen meer code en vereisen eerst echte profilergegevens op telefoons. Er is geen reden om
voor dit project een framework, bundler, pakket voor iframehoogte of buildstap in te voeren.

De bestaande voorafberekende geometrie blijft behouden. In v2 is canvasweergave tijdens versneld
afspelen begrensd tot maximaal 30 beelden per seconde en tekstuitvoer tot circa 10 keer per seconde.
Een gepauzeerde kaart tekent alleen na bediening of tijdens het afronden van een zoombeweging.

## Inhoudelijke bevindingen, niet stilzwijgend aangepast

Zie [METHODE.md](../interactief/voyager-1-v2/METHODE.md) voor modellen en bronnen.
De belangrijkste bevindingen zijn de overgangssprong rond 2400, de beperkte geldigheid van
de planeetbenadering, de selectie van slechts 15 sterren en het ontbreken van de galactische zwaartekracht.
De oorspronkelijke teksten en numerieke modellen zijn behouden. De website vraagt daarom nog
om wetenschappelijke en redactionele controle voordat v2 de voorkeursversie kan worden.
