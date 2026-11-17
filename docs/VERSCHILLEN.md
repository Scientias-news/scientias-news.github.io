# Verschillen tussen Voyager 1 en versie 2

| Onderdeel | Origineel | Versie 2 |
| --- | --- | --- |
| URL na eventuele merge | /interactief/voyager-1/ | /interactief/voyager-1-v2/ |
| Bestanden | Eén HTML-bestand | HTML, CSS, physics.js, visualisatie.js en METHODE.md |
| Fysica en brondata | Bestaand model | Dezelfde brondata en modellen, met herstelde aansluiting rond 2400 |
| Overgang naar verre toekomst | Sprong van circa 8,60 miljoen km | Sluit aan op het werkelijke laatste tabelpunt; eerdere afstanden blijven gelijk |
| Berekende mijlpalen en signaalreizen | In bedieningsscript | Ondergebracht in physics.js |
| Uiterlijk | Zwart/wit/groen, licht/donker | Behouden, met enkele grotere aanraakdoelen en extra bedieningstekst |
| Lettertype | Montserrat indien lokaal aanwezig, anders fallback | Dezelfde fontkeuze; geen externe downloads |
| Snelheid canvas | Permanente browser-RAF | Maximaal 30 fps bij versnelde animatie, circa 1 Hz live |
| Tekstupdates | Circa 22 keer per seconde | Maximaal circa 10 keer per seconde tijdens animatie, direct na bediening |
| Pauze | Tekent voortdurend door | Stopt na het afronden van de zoom |
| Buiten beeld/verborgen tab | Blijft rekenen en tekenen | Scheduler stopt; live haalt actuele kloktijd op bij hervatten |
| Versnelde tijd buiten beeld | Blijft in principe doorlopen | Bevriest totdat het element weer in beeld komt |
| Minder beweging | Geen aparte starttoestand | Start gepauzeerd, geen pulse of vloeiende overgangen |
| Kaarttoetsenbord | Niet beschikbaar | Pijltjes, +/− en spatie op gefocuste kaart |
| Spatie op knoppen | Documenthandler kan normale actie overnemen | Standaard browserbediening blijft intact |
| Wielzoom | Zonder Ctrl buiten embedmodus | Altijd Ctrl/⌘ vereist; artikel blijft scrollbaar |
| Touchscreen | Mobiel pan-y, elders touch-action:none | Native verticaal scrollen en browserpinch toegestaan |
| Thema/signalen | Sleutels voyager1-* | Eigen sleutels voyager1-v2-* |
| Iframehoogte | Vaste hoogte door host | Optioneel veilig resizeprotocol met WordPress-hostscript |
| Toegankelijkheid | Basale labels, tabel | Extra focus, toestand, tijdtekst en rustige meldingen |
| Oorspronkelijke map | Bestaande bestanden | Byte voor byte ongewijzigd |

De inhoudelijke teksten in de visualisatie zijn behouden. Een link naar METHODE.md geeft uitgebreidere
transparantie over de beperkingen. De selectie van v2 als voorkeursversie is niet uitgevoerd.
De publieksindex verwijst nog steeds naar het origineel. Gedeelde bestaande CSS blijft ongewijzigd.
