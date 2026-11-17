# Scientias Interactief

Deze repository bevat zelfstandige, statische HTML/CSS/JavaScript-visualisaties om in artikelen op [Scientias.nl](https://scientias.nl/) op te nemen.

## Structuur

- `index.html`: overzichtspagina.
- `assets/style.css`: gedeelde basisopmaak.
- `voorbeelden/golflengte/`: eerste interactieve demonstratie.
- `.nojekyll`: voorkom onnodige Jekyll-verwerking door GitHub Pages.

## Publiceren

Ga naar **Settings → Pages → Build and deployment**. Kies **Deploy from a branch**, branch `main`, folder `/(root)` en sla op.

**Let op:** deze repository heet `scientias.github.io`, terwijl de GitHub-account `Scientias-news` heet. De verwachte *project-site*-URL is daarom:

https://scientias-news.github.io/scientias.github.io/

Een website direct onder https://scientias-news.github.io/ vereist een repository met de exacte naam `Scientias-news.github.io` (niet hoofdlettergevoelig).

## WordPress iframe

Plaats in WordPress een blok **Aangepaste HTML** met:

```html
<iframe
  src="https://scientias-news.github.io/scientias.github.io/voorbeelden/golflengte/"
  title="Interactieve uitleg: golflengte en frequentie"
  style="display:block;width:100%;height:490px;border:0;"
  loading="lazy">
</iframe>
```

De iframehoogte is voorlopig vast; controleer mobiel of de inhoud niet wordt afgesneden. Een iframe past zijn hoogte niet vanzelf aan. Voor dynamische hoogte zijn aanvullende `postMessage`-code op zowel de hostpagina als WordPress nodig.

## Nieuwe visualisatie toevoegen

1. Maak een nieuwe map, bijvoorbeeld `klimaat/voorbeeld/`.
2. Voeg een `index.html` toe, met relatieve verwijzingen naar benodigde stijlen/scripts.
3. Voeg desgewenst een kaart/link aan de hoofdpagina toe.
4. Publiceer via een commit naar `main`.
5. Gebruik de uiteindelijke GitHub Pages-URL in het iframe.

## Technische en redactionele uitgangspunten

- Mobiel bruikbaar en toetsenbordtoegankelijk.
- Werk bij voorkeur zonder externe afhankelijkheden.
- Vermeld bij echte data de bron, datum, eenheden en onzekerheden.
- Voeg geen API-sleutels, wachtwoorden of persoonsgegevens toe aan deze publieke repository.
- Gebruik HTML, CSS en JavaScript die in moderne browsers werken.
- Controleer de WordPress-preview op iframebeleid en CSP.
