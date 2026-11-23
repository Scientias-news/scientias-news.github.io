# Methode: rivierwater wereldwijd in 2023 en 2024

## Bron

- Studie: Zhang, Y., Wang, X. et al. (2026). *Abrupt surface water decline during 2023–2024 record warming.* Science. DOI 10.1126/science.aei2575. Embargo tot 26 november 2026, 14u Amerikaanse oostkusttijd.
- Data: Zhang, Y. & Wang, X. (2026). *Key dataset and code used in the paper.* Zenodo, DOI 10.5281/zenodo.24117426. Licentie CC BY 4.0.
- Peildatum van de data: versie zoals gedownload op 23 november 2026.

## Wat de kaart toont

**Meer of minder water.** Per rivierbekken (HydroSHEDS niveau 4) de jaarlijkse rivierafvoer tegenover het gemiddelde van 1991 tot en met 2020, in procent. Standaard het gemiddelde van 2023 en 2024; met de schuif een los jaar van 1991 tot 2025.

- Afvoer: `streamflow_km3_yr`, het gemiddelde van vijf machine-learningmodellen uit de dataset.
- Afwijking = (afvoer in het jaar − gemiddelde 1991–2020) / gemiddelde 1991–2020.
- Klassen: 30% of meer minder, 15 tot 30% minder, 5 tot 15% minder, tussen 5% minder en 5% meer, en zo verder aan de natte kant.
- Bekkens met gemiddeld minder dan 10 millimeter rivierwater per jaar (afvoer gedeeld door oppervlakte) zijn gearceerd. Dat zijn er 104, vooral woestijnen. Daar geven kleine verschillen in kubieke kilometers enorme percentages.

**Waarom minder water?** De onderzoekers splitsten de verandering in afvoer in 2023 en 2024 op in drie bijdragen: regen (P), verdamping (ET) en de verandering van het water in bodem, grondwater en meren volgens de GRACE-satellieten (ΔS). Dat gebeurde voor 193 grotere bekkens (HydroSHEDS niveau 3). Elk klein bekken op de kaart krijgt de waarde van het grote bekken waarin zijn middelpunt ligt.

- Daalde de afvoer, dan toont de kaart de bijdrage die de daling het sterkst duwde (de meest negatieve van C_P, C_ET en C_S).
- Steeg de afvoer, dan staat het bekken op "geen daling".
- "Bodem en grondwater hielden water vast" betekent dat de opslag op land toenam, zodat er minder naar de rivier stroomde.

**Tijdlijn.** De som van de afvoer van alle 986 bekkens per jaar, tegenover het gemiddelde van 1991 tot en met 2020.

## Controle tegen de studie

Uit de dataset berekend en vergeleken met de studie:

| Grootheid | Dataset | Studie |
| --- | --- | --- |
| Wereldwijde afvoer 2023–2024 tegenover 1991–2020 | −2038 km³/jaar, −5,72% | −2040 ± 410 km³/jaar, −5,72% |
| Zuid-Amerika, afvoer | −17,8% | −17,8% |
| Aandeel Zuid-Amerika in het verlies | 70,4% | 70,4% |
| Zuid-Amerika, water in meren en stuwmeren | −16,5% | −16,5% |

## Beperkingen

- Alleen in 150 grote bekkens zijn er afvoermetingen. Voor de rest zijn het modelschattingen.
- De dataset bevat het water in meren en stuwmeren alleen voor Noord- en Zuid-Amerika (250 bekkens). Daarom toont de kaart dat niet wereldwijd. De studie vermeldt wereldwijd 640 km³ minder (−9,5%).
- Bekken 5040491500 (een klein eiland in Oceanië) valt weg bij het vereenvoudigen van de grenzen. De kaart toont daardoor 985 bekkens; de tijdlijn rekent met alle 986.
- De oorzaakverdeling heeft ruime onzekerheden (1σ over 180 combinaties van invoerdata). Zie de kolommen `*_std` in de dataset.
- Rivierennamen zijn aan een bekken gekoppeld via één punt op de rivier. Het bekken op de kaart is vaak een deel van het hele stroomgebied.
- Groenland en Antarctica vallen buiten het onderzoek.

## Bewerking

Vereenvoudigd met mapshaper (0,8%, gewogen), geprojecteerd in Equal Earth met d3-geo, afgerond op 1 pixel bij een breedte van 960. Het landsilhouet komt uit Natural Earth via world-atlas (110m). Het lettertype wordt geladen uit de map van de fijnstofkaart, zodat er geen nieuwe fontbestanden bijkomen.
