# Werken in deze repository

Lees eerst `README.md`: URL's veranderen nooit en `assets/vN/` is bevroren.

- Nieuw element: kopieer `interactief/_sjabloon/` en volg `docs/REDACTIE.md`.
- Slepen, zoomen of animatie: volg `docs/INTERACTIE.md`. Kort samengevat:
  - geen `pinch-zoom` in `touch-action`;
  - vingers via touch events met `{ passive: false }`;
  - elke invoer, ook touch, maakt de tekenlus wakker.
- Controles: `python3 tests/structure.py` en `node tests/run.cjs`. De browsercontrole
  draait in GitHub Actions.
- Teksten en documentatie zijn in het Nederlands.
- Werk op een branch en open een pull request naar `main`.
