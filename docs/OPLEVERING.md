# Oplevering en vervolgstappen

De wijzigingen zijn lokaal voorbereid op `codex/voyager-v2-infrastructuur`, vanaf de
oorspronkelijke GitHub-commit `e812c6ef0acc6da12fad78d56745bee820248b51`.
De lokale basisboom is exact gelijk aan de GitHub-boom. De lokale repository bevat een
ondiepe kopie van die basis, gevolgd door de refactoringcommit.

De automatische toestemmingscontrole blokkeerde het aanmaken van een remote branch:
de GitHub-schrijfactie vereiste toestemming terwijl de sessie geen toestemming kan aanvragen.
Er is daarom geen pull request aangemaakt. De wijzigingen zijn niet gepubliceerd of gemerged.

## Vanuit de voorbereide lokale branch

Een collega met werkende GitHub-schrijfrechten kan vanuit de repository uitvoeren:

```sh
git push -u origin codex/voyager-v2-infrastructuur
```

Open daarna op GitHub een **draft pull request** naar `main` en gebruik de tekst uit
[PULL_REQUEST.md](PULL_REQUEST.md). Laat GitHub Actions draaien en bekijk de screenshots
in het browsercontrole-artifact. Beoordeel de nog openstaande punten uit
[KWALITEIT.md](KWALITEIT.md). Voeg geen automatische merge toe.

## Vanuit een bestaande volledige clone

De afzonderlijk meegeleverde `scientias-interactief-v2.patch` kan op de oorspronkelijke basis
worden toegepast. Controleer eerst dat er geen eigen ongecommitte wijzigingen zijn.

```sh
git switch -c codex/voyager-v2-infrastructuur e812c6ef0acc6da12fad78d56745bee820248b51
git am /pad/naar/scientias-interactief-v2.patch
```

Pas `/pad/naar/` aan de locatie van de gedownloade patch aan. Zijn er intussen wijzigingen
op main, vergelijk of rebase dan vóór de review. Los conflicten in een eigen branch op en
laat de testreferentie `tests/fixtures/voyager-1-origineel.html.txt` ongemoeid.

## ZIP gebruiken om te bekijken

De broncode-ZIP bevat alle websitebestanden, documentatie en tests zonder `.git` of testpakketten.
Pak hem uit en start `python3 -m http.server 8001 --bind 127.0.0.1` in de uitgepakte hoofdmap.
Bekijk daarna in je eigen browser:

- Origineel: niet meer gepubliceerd; open zo nodig `tests/fixtures/voyager-1-origineel.html.txt` lokaal als HTML-bestand
- Versie 2: `http://127.0.0.1:8001/interactief/voyager-1-v2/`

Voor een test met twee origins en automatische iframehoogte volg je [WORDPRESS.md](WORDPRESS.md).
De ZIP publiceren is niet nodig om het werk te beoordelen. Installeer WordPress-code alleen na
afzonderlijke controle door de beheerder. Laat de redactie beslissen of en wanneer v2 de voorkeursversie wordt.
