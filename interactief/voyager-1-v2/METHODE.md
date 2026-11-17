# Methode en beperkingen van Voyager 1 versie 2

Peildatum van deze verantwoording: 17 november 2026.
Ontwerp en oorspronkelijke kaart: Andrei Stiru / Scientias.
Referentie: `interactief/voyager-1/index.html`, commit `e812c6ef0acc6da12fad78d56745bee820248b51`.
V2 ordent dezelfde modellen in aparte bestanden. Het is een illustratief rekenmodel en geen live NASA-telemetrie.
De aanduiding Live betekent dat het model met de klok van het apparaat meeloopt.

## Eenheden en coördinaten

Posities zijn heliocentrisch in een ecliptisch assenstelsel. Intern zijn afstanden in astronomische
eenheden (AE), tijden in milliseconden sinds de Unix-epoch en snelheden in AE per Juliaans jaar.
Eén jaar is 365,25 dagen. AE = 149.597.870,7 km, c = 299.792,458 km/s en één lichtjaar is in
de oorspronkelijke code afgerond tot 63.241,077 AE. De omrekening van equatoriale naar ecliptische
coördinaten gebruikt een vaste scheefstand van 23,4392911 graden.

## Planeten en aarde

`planetPos` lost Keplers vergelijking met acht Newtonstappen op. De tabel bevat de J2000-elementen
van acht planeten en alleen een veranderende gemiddelde lengte L. De andere elementen blijven vast.
De gebruikte bron is [JPL, Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html),
geraadpleegd op 17 november 2026.

JPL geeft een beperkte geldigheidsperiode voor deze elementen (1800 tot 2050). De nauwkeurigheden op
de bronpagina gelden voor de volledige JPL-benadering met de bijbehorende veranderingssnelheden.
De vereenvoudigde implementatie hier neemt die niet allemaal over. Daarom kunnen die gepubliceerde
foutgrenzen niet rechtstreeks op deze kaart worden toegepast. Bovendien vertegenwoordigen de
gebruikte aardgegevens het aarde-maanbarycentrum. Tot een miljoen jaar vooruit tekenen is illustratief,
geen voorspelling van de werkelijke planeetposities.

## Voyager tot midden 1982

Een kubische Hermite-interpolatie verbindt de aardpositie bij de lancering, de posities van Jupiter
en Saturnus bij de passages en het aansluitpunt op 1 juli 1982. Afgeleiden zijn deels gekozen voor
een vloeiende vorm. Dit is geen numerieke reconstructie van de zwaartekrachtslingers. Op het
Jupiter- en Saturnusanker valt de modelpositie precies met het planeetcentrum samen. Dat betekent
niet dat de sonde werkelijk door het centrum vloog. Historische passages, snelheden en signaaltijden
in dit deel zijn dus benaderingen. De mijlpaaltekst gebruikt voor Saturnus een tijdstip eerder op
dezelfde dag dan het rekenanker; ook dat is uit het origineel overgenomen.

## Voyager vanaf midden 1982

De richting is RA 262,8760 graden, declinatie 12,3199 graden. De asymptotische snelheid is 16,6048 km/s.
De positie volgt een vaste lijn met een loodrechte offset gebaseerd op Saturnus. Langs die lijn
gebruikt de code v² = v∞² + 2GM/r, met GM = 4π² AE³/jaar². Dit model bevat een afnemende snelheid
maar geen volledige hyperbolische baandynamica of buiging van de lijn door zwaartekracht.

De integratietabel gebruikt vierde-orde Runge-Kutta met een stap van 1/48 jaar en lineaire
interpolatie tussen roosterpunten. De schaal wordt afgesteld op één lichtdag van de aarde op
18 november 2026 om 10:16:07 UTC, overeenkomend met 11:16:07 in Nederland en België.
[NASA noemt dit tijdstip](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/).
Door tabelinterpolatie ligt het resultaat op dat moment circa 10,7 km onder de ingestelde lichtdag.
Dit verschil is klein ten opzichte van de modelonzekerheid en is in v2 behouden.

Na de tabel gebruikt `sAt` een constante asymptotische snelheid plus een logaritmische correctie.
Er zit een bestaand aansluitprobleem in: het laatste roosterpunt ligt niet precies op `TAB_T1`.
Rond 10 januari 2400, 11:37:30 UTC springt `sAt` ongeveer 0,0575 AE vooruit, circa 8,60 miljoen km.
De refactoring repareert dit niet: dat zou de wetenschappelijke uitkomsten veranderen.
Een vervolgwijziging moet de werkelijke eindtijd van het rooster gebruiken en apart worden beoordeeld.

## Sterren en ontmoetingen

De tabel bevat 15 geselecteerde sterren met positie, parallax, eigenbeweging en radiële snelheid.
Die worden omgerekend naar een vaste ruimtelijke snelheid en rechtlijnig doorgetrokken vanaf J2000.
De oorspronkelijke tabel verwijst algemeen naar Gaia/Hipparcos maar noemt geen afzonderlijke
catalogusrecords, releases of foutmarges per ster. Die herkomst moet voor striktere reproduceerbaarheid
nog worden aangevuld. Er worden geen onzekerheden doorgerekend.

De dichtste nadering wordt in drie zoekrondes benaderd met stappen van 200, 4 en 0,08 jaar.
Tijdstippen voor bepaalde afstanden gebruiken binaire zoekacties. De kaart zoekt alleen binnen de
geselecteerde sterren. Het kerncijfer ‘Dichtstbijzijnde ster’ betekent dus de dichtstbijzijnde ster
uit deze selectie, waarbij de zon buiten beschouwing blijft. Dit label vraagt redactionele beoordeling.

[Bailer-Jones & Farnocchia (2019), Future stellar flybys of the Voyager and Pioneer spacecraft](https://arxiv.org/abs/1912.03503)
is de oorspronkelijke bron voor richting, snelheid en context van ontmoetingen. De studie integreert
door een galactisch zwaartekrachtsveld. Deze visualisatie doet dat niet. Gelijkheid met de volledige
studie mag daarom niet voor alle toekomstige tijdstippen worden verondersteld. De vermelding van
TYC 3135-52-1 is tekstuele context; die ster zit niet in de getekende tabel.

## Lichtsignalen

`makeSignal` berekent met zes iteraties het onderscheppen van Voyager door een signaal vanaf de
aardpositie bij verzending. Vervolgens berekent het de ontvangst op de bewegende aarde na een
onmiddellijk antwoord. De lichtsnelheid is constant; relativistische effecten, radiotechniek en
verwerkingstijd ontbreken. De kaart toont een projectie ter illustratie. De kerncijfers gebruiken
voor ‘heen en terug’ tweemaal de momentane afstand/c; dat is een andere benadering dan de
expliciete heen- en terugreis van een verstuurd signaal. Boodschappen blijven lokaal in de browser.

## Illustratieve vormen en tijdweergave

De heliosfeer wordt als een bol met straal 121,6 AE getekend. De Oortwolk gebruikt illustratieve,
deterministisch gelote punten tussen 1.100 en 106.000 AE. Het zijn geen waargenomen objecten of
scherp gemeten grenzen. De formulering dat men bij een bepaalde Oortgrens ‘echt’ het zonnestelsel
verlaat is een redactionele vereenvoudiging; de zwaartekracht heeft geen abrupte rand.

De tijdlijn is logaritmisch. Kalendertijden gebruiken de tijdzone van het apparaat; mijlpaaldata
gebruiken UTC. Het vaste lichtdaglabel noemt de Nederlandse/Belgische tijd. Voor zeer grote
jaartallen gebruikt de code Juliaanse jaren en gewone getallen in plaats van JavaScript-kalenderdata.

## Overige oorspronkelijke bronnen

- [NASA, Interstellar mission](https://science.nasa.gov/mission/voyager/interstellar-mission)
- [JPL, instrumenten uitgeschakeld](https://www.jpl.nasa.gov/news/nasa-turns-off-two-voyager-science-instruments-to-extend-mission/)

Deze links stonden in het origineel. De actuele instrumentstatus en historische detailteksten
zijn met deze refactoring niet volledig opnieuw gefactcheckt. De bron over de lichtdag en de
methodologische JPL- en studiepagina's zijn wel gecontroleerd. Gehele getallen in kilometers en
seconden op de kaart zijn een presentatiekeuze en impliceren geen nauwkeurigheid op dat niveau.
