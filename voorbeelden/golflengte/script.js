"use strict";
const slider = document.querySelector("#frequency");
const frequencyOutput = document.querySelector("#frequency-value");
const wavelengthOutput = document.querySelector("#wavelength");
const wave = document.querySelector("#wave-path");
const speedOfLight = 299792458;
const numberFormat = new Intl.NumberFormat("nl-NL",{minimumFractionDigits:2,maximumFractionDigits:2});
function update() {
  const frequencyMHz = Number(slider.value);
  const wavelengthM = speedOfLight / (frequencyMHz * 1e6);
  frequencyOutput.textContent = String(frequencyMHz);
  wavelengthOutput.textContent = numberFormat.format(wavelengthM) + " m";
  const cycles = frequencyMHz / 50;
  const points = [];
  for (let x = 16; x <= 624; x += 2) {
    const y = 90 - 48 * Math.sin((x - 16) / 608 * cycles * 2 * Math.PI);
    points.push((x === 16 ? "M" : "L") + x + " " + y.toFixed(2));
  }
  wave.setAttribute("d", points.join(" "));
}
slider.addEventListener("input",update);
update();