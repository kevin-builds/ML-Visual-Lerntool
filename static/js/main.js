import { charts, compareControls, controls, panels, table, view }
  from "./elements.js";
import { state, lastIndex, currentState } from "./state.js";
import { formatNumber } from "./format.js";
import { createPlayback } from "./playback.js";
import { drawScatter } from "./charts/scatter.js";
import { render, train, predictionInput } from "./single.js";
import * as daten from "./dataPanel.js";
import * as vergleich from "./compare.js";

const playback = createPlayback({
  length: () => state.history.length,
  position: () => state.step,
  move: (wert) => { state.step = wert; },
  onFrame: render,
  speed: () => Number(controls.tempo.value),
});

function halt() {
  playback.stop();
  vergleich.playback.stop();
}

function springe(ziel) {
  halt();
  state.step = Math.max(0, Math.min(lastIndex(), ziel));
  render();
}

async function neuBerechnen() {
  halt();
  await train();
  vergleich.refresh();
}

async function datensatzWechseln() {
  halt();
  state.tableExpanded = false;
  controls.predictX.value = "";
  await daten.loadDataset();
  await neuBerechnen();
}

function verdrahteDaten() {
  controls.dataset.addEventListener("change", datensatzWechseln);
  table.more.addEventListener("click", daten.toggleTable);

  controls.dropzone.addEventListener("click", () => controls.fileInput.click());
  controls.fileInput.addEventListener("change", () => {
    daten.handleUpload(controls.fileInput.files[0], datensatzWechseln);
    controls.fileInput.value = "";
  });

  for (const name of ["dragenter", "dragover", "dragleave", "drop"]) {
    controls.dropzone.addEventListener(name, (event) => {
      event.preventDefault();
      controls.dropzone.classList.toggle(
        "over", name === "dragenter" || name === "dragover");
    });
  }
  controls.dropzone.addEventListener("drop", (event) => {
    daten.handleUpload(event.dataTransfer.files[0], datensatzWechseln);
  });

  controls.shareButtons.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) {
      halt();
      daten.showShare(Number(button.dataset.share));
      neuBerechnen();
    }
  });
}

function verdrahteEinzelmodell() {
  controls.rate.addEventListener("input", () => {
    view.rate.textContent = formatNumber(Number(controls.rate.value), 3);
  });
  controls.rate.addEventListener("change", neuBerechnen);
  controls.startBeta0.addEventListener("change", neuBerechnen);
  controls.startBeta1.addEventListener("change", neuBerechnen);
  controls.predictX.addEventListener("input", render);

  controls.residuals.addEventListener("click", () => {
    state.showResiduals = !state.showResiduals;
    controls.residuals.classList.toggle("active", state.showResiduals);
    render();
  });

  controls.stepBack.addEventListener("click", () => springe(state.step - 1));
  controls.stepForward.addEventListener("click", () => springe(state.step + 1));
  controls.reset.addEventListener("click", () => springe(0));
  controls.play.addEventListener("click", playback.start);
  controls.pause.addEventListener("click", playback.stop);
  controls.tempo.addEventListener("change", () => {
    if (playback.running()) {
      playback.start();
    }
  });
}

function verdrahteVergleich() {
  for (const model of vergleich.models) {
    model.element.rate.addEventListener("input", () => {
      model.element.rateValue.textContent =
        formatNumber(Number(model.element.rate.value), 3);
    });
    for (const feld of ["rate", "beta0", "beta1"]) {
      model.element[feld].addEventListener("change", vergleich.trainCompare);
    }
  }

  compareControls.play.addEventListener("click", vergleich.playback.start);
  compareControls.pause.addEventListener("click", vergleich.playback.stop);
  compareControls.reset.addEventListener("click", vergleich.resetCompare);
  compareControls.tempo.addEventListener("change", () => {
    if (vergleich.playback.running()) {
      vergleich.playback.start();
    }
  });
}

function verdrahteNavigation() {
  controls.railToggle.addEventListener("click", () => {
    controls.layout.classList.toggle("collapsed");
  });

  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => {
      const compare = tab.dataset.tab === "compare";

      for (const other of document.querySelectorAll(".tab")) {
        other.classList.toggle("active", other === tab);
      }
      panels.single.classList.toggle("hidden", compare);
      panels.compare.classList.toggle("hidden", !compare);

      halt();
      if (compare) {
        vergleich.openIfStale();
      }
    });
  }

  window.addEventListener("resize", () => {
    if (state.history.length) {
      drawScatter(charts.scatter, currentState(), predictionInput());
    }
  });
}

async function start() {
  verdrahteDaten();
  verdrahteEinzelmodell();
  verdrahteVergleich();
  verdrahteNavigation();

  await daten.loadExamples();
  await daten.loadDataset();
  await train();
}

start();
