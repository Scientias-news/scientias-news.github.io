# Voyager 1 versie 2 met gedeelde iframebasis en redactiehandleiding

Voegt een afzonderlijke, onderhoudbare versie toe op `interactief/voyager-1-v2/`.
De oorspronkelijke `interactief/voyager-1/index.html` blijft byte voor byte gelijk en de
publieksindex blijft ernaar verwijzen. V2 wordt pas na redactionele beoordeling een voorkeursversie.

> Update 18 november 2026: v2 is nu de voorkeursversie en `interactief/voyager-1/` is verwijderd. Het origineel staat als testreferentie in `tests/fixtures/voyager-1-origineel.html.txt`.

De nieuwe versie scheidt HTML, CSS, modellen en bediening. De berekeningen en inhoudelijke teksten
zijn behouden. Toetsenbordbediening, toegankelijke toestanden, scrollgedrag, minder beweging en
de animatiescheduler zijn verbeterd. Nieuwe gedeelde bestanden zijn opt-in, zodat bestaande
visualisaties hun huidige stylesheets blijven gebruiken.

Verder toegevoegd: veilig iframehoogteprotocol met een afzonderlijk WordPress-pluginvoorstel,
een werkend sjabloon, redactiehandleiding, methodeverantwoording, verschiloverzicht en tests.
Er zijn geen wijzigingen op Scientias.nl uitgevoerd.

Validatie: 16.039 JavaScript-assertions geslaagd met GJS/SpiderMonkey, plus Python-structuurcontrole.
De tests vergelijken het nieuwe model rechtstreeks met het oorspronkelijke model over 210 tijdstippen.
Echte browsertests en screenshots zijn voorbereid maar konden in deze omgeving niet worden uitgevoerd.
De toegevoegde GitHub-workflow is nog niet op GitHub gedraaid.

Bekende inhoudelijke punten zijn afzonderlijk gedocumenteerd, met name een bestaande sprong bij de
modelovergang rond 2400, planeetposities buiten het geldigheidsinterval en de beperkte sterselectie.
Deze PR corrigeert die modellen niet. Controleer [KWALITEIT.md](../../KWALITEIT.md) en
[METHODE.md](../../../interactief/voyager-1-v2/METHODE.md) vóór redactionele goedkeuring.

Doelbranch: `main`. Werkbranch: `codex/voyager-v2-infrastructuur`. Niet automatisch samenvoegen.
