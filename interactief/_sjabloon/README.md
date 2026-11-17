# Sjabloon voor een nieuwe interactieve visualisatie

Kopieer de **hele map** `_sjabloon` naar een nieuwe map onder `interactief/`, bijvoorbeeld `interactief/klimaatvergelijker/`. De map moet altijd op dit niveau blijven, anders kloppen de relatieve paden naar `../../assets/style.css` niet.

Pas daarna de titel, inhoud, JavaScript en eventuele eigen CSS aan.

Publicatieadres:
`https://scientias-news.github.io/interactief/klimaatvergelijker/`

Iframe voor WordPress (pas naam, titel en hoogte aan):

```html
<iframe
  src="https://scientias-news.github.io/interactief/klimaatvergelijker/"
  title="Interactieve klimaatvergelijker van Scientias"
  style="display:block;width:100%;height:480px;border:0;"
  loading="lazy">
</iframe>
```

Controleer in WordPress vooral de hoogte op smalle schermen. Hoogte wordt niet automatisch aangepast door GitHub Pages. Houd data, afhankelijkheden en styles per element gescheiden. Publiceer bij voorkeur niet van buitenaf afkomstige JavaScript-code zonder controle.
