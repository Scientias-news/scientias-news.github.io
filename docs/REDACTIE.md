# Een interactief element toevoegen

Iedere visualisatie woont in een eigen map. Die mapnaam wordt het laatste deel van de permanente URL.
Een nieuwe map verandert bestaande visualisaties niet. Spreek daarom vooraf een korte naam af,
bijvoorbeeld `maanfasen`. Gebruik kleine letters, cijfers en verbindingsstreepjes.
Hernoem een gepubliceerde map niet: oudere artikelen blijven naar die URL verwijzen.

## Werken via GitHub, zonder programmeeromgeving

1. Open de repository en kies de branchkiezer waar `main` staat.
2. Typ bijvoorbeeld `redactie/maanfasen` en kies om deze nieuwe branch vanaf main te maken.
3. Open `interactief/_sjabloon/` als voorbeeld. Voeg met **Add file → Create new file**
   bestanden toe onder `interactief/maanfasen/`. Je kunt de inhoud van het sjabloon kopiëren.
   Gebruik de vijf bestanden uit de tabel hieronder. Werken via een lokale kopie van de hele map
   kan ook; laat bij twijfel een technische collega de map voorbereiden.
4. Pas de kop, toelichting, labels en bronverantwoording aan. Pas berekeningen samen met een
   inhoudelijk deskundige aan. Een schuifregelaar krijgt altijd een zichtbare uitleg en eenheid.
5. Sla wijzigingen op in je eigen branch. Kies daarna **Compare & pull request** en richt de
   pull request op main. Gebruik de ingebouwde checklist en vraag een collega om controle.
6. Bekijk de tests. Laat de technische collega de lokale voorbeeldpagina controleren.
   GitHub Pages publiceert deze branch niet automatisch als preview. Een HTML-bestand op de
   GitHub-bestandspagina bekijken is ook geen werkende preview.
7. Na inhoudelijke en technische goedkeuring kan een bevoegde collega de pull request samenvoegen.
   Wacht op de GitHub Pages-deployment en controleer de uiteindelijke URL.
8. Plaats de iframe in het artikel met [de WordPress-handleiding](WORDPRESS.md).
   Controleer de voorbeeldweergave van het artikel op mobiel voordat het artikel live gaat.

Bij een ingrijpende wijziging aan een bestaande visualisatie maak je een nieuwe map, bijvoorbeeld
`maanfasen-v2`. Laat de bestaande URL werken. Bij Voyager is `voyager-1-v2/` de voorkeursversie; de oorspronkelijke
`voyager-1/` is verwijderd en blijft alleen als testreferentie bewaard in `tests/fixtures/voyager-1-origineel.html.txt`.

## Bestanden in je map

| Bestand | Waarvoor? | Wie controleert? |
| --- | --- | --- |
| index.html | Titel, uitleg, labels en structuur | Redacteur |
| style.css | Eigen uiterlijk en mobiele indeling | Technische collega |
| physics.js | Data, eenheden en berekeningen | Inhoudelijk deskundige |
| visualisatie.js | Knoppen, tekenen en toestand | Technische collega |
| METHODE.md | Bronnen, peildatum, aannames en beperkingen | Redacteur en deskundige |

Je hebt geen koppeling met de publieksindex nodig om te publiceren. Voeg alleen na een bewuste
keuze een overzichtslink toe. Deel `assets/basis.css` en `assets/embed-child.js` via relatieve paden.
Voeg specifieke code nooit aan een andere visualisatiemap toe. De browser isoleert elke iframe
van de artikelpagina en van andere iframes.

## Publicatiecontrole

- [ ] Titel en uitleg zijn begrijpelijk zonder het begeleidende artikel.
- [ ] Bron, peildatum, eenheden en beperkingen staan in de visualisatie en in METHODE.md.
- [ ] Een inhoudelijk controleur heeft modellen, aannames en relevante uitkomsten bekeken.
- [ ] Een nieuwe mapnaam is blijvend en bevat geen bestaande bestanden.
- [ ] Desktop, tablet en smalle telefoon tonen alle bediening zonder horizontaal pagina-scrollen.
- [ ] Tab, Enter, spatie en pijltjes werken logisch; de focus blijft zichtbaar.
- [ ] Informatie is ook als tekst of tabel beschikbaar en hangt niet alleen van kleur af.
- [ ] Minder beweging wordt gerespecteerd; bewegende onderdelen kunnen pauzeren.
- [ ] Scrollen over de kaart laat het artikel normaal bewegen.
- [ ] Er zijn geen onverwachte externe scripts, dataverzoeken of geheime sleutels.
- [ ] Tests slagen en de pull request is inhoudelijk en technisch nagekeken.
- [ ] In de WordPress-preview groeit en krimpt de iframe zonder afgesneden inhoud.
- [ ] De iframe heeft een beschrijvende titel en een link naar de losse visualisatie.
- [ ] De gepubliceerde URL en eventuele oudere URL's zijn gecontroleerd na deployment.

Gebruik bij een eenvoudige grafiek een eenvoudig model en een korte toelichting.
De Voyager-implementatie is een uitgebreid voorbeeld, geen verplicht formaat voor elk onderwerp.
