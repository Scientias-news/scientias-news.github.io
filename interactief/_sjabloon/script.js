"use strict";
// Deze code werkt alleen binnen deze visualisatie en beïnvloedt andere pagina's niet.
const invoer = document.querySelector("#waarde");
const uitvoer = document.querySelector("#uitvoer");
function bijwerken() {
  uitvoer.value = invoer.value;
}
invoer.addEventListener("input", bijwerken);
bijwerken();
