import { charts, compareControls, controls, panels, table, view }
  from "./elements.js";
import { state, lastIndex, currentState } from "./state.js";
import { formatNumber } from "./format.js";
import { createPlayback } from "./playback.js";
import { drawScatter } from "./charts/scatter.js";
import { render, train, predictionInput } from "./single.js";
import * as dataPanel from "./dataPanel.js";
import * as compare from "./compare.js";

const playback = createPlayback({
  length: () => state.history.length,
  position: () => state.step,
  move: (value) => { state.step = value; },
  onFrame: render,
  speed: () => Number(controls.tempo.value),
});

function stopAll() {
  playback.stop();
  compare.playback.stop();
}

function goTo(target) {
  stopAll();
  state.step = Math.max(0, Math.min(lastIndex(), target));
  render();
}

async function recompute() {
  stopAll();
  await train();
  compare.refresh();
}

async function switchDataset() {
  stopAll();
  state.tableExpanded = false;
  controls.predictX.value = "";
  await dataPanel.loadDataset();
  await recompute();
}

function wireData() {
  controls.dataset.addEventListener("change", switchDataset);
  table.more.addEventListener("click", dataPanel.toggleTable);

  controls.dropzone.addEventListener("click", () => controls.fileInput.click());
  controls.fileInput.addEventListener("change", () => {
    dataPanel.handleUpload(controls.fileInput.files[0], switchDataset);
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
    dataPanel.handleUpload(event.dataTransfer.files[0], switchDataset);
  });

  controls.shareButtons.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) {
      stopAll();
      dataPanel.showShare(Number(button.dataset.share));
      recompute();
    }
  });
}

function wireSingle() {
  controls.rate.addEventListener("input", () => {
    view.rate.textContent = formatNumber(Number(controls.rate.value), 3);
  });
  controls.rate.addEventListener("change", recompute);
  controls.startBeta0.addEventListener("change", recompute);
  controls.startBeta1.addEventListener("change", recompute);
  controls.predictX.addEventListener("input", render);

  controls.residuals.addEventListener("click", () => {
    state.showResiduals = !state.showResiduals;
    controls.residuals.classList.toggle("active", state.showResiduals);
    render();
  });

  controls.stepBack.addEventListener("click", () => goTo(state.step - 1));
  controls.stepForward.addEventListener("click", () => goTo(state.step + 1));
  controls.reset.addEventListener("click", () => goTo(0));
  controls.play.addEventListener("click", playback.start);
  controls.pause.addEventListener("click", playback.stop);
  controls.tempo.addEventListener("change", () => {
    if (playback.running()) {
      playback.start();
    }
  });
}

function wireCompare() {
  for (const model of compare.models) {
    model.element.rate.addEventListener("input", () => {
      model.element.rateValue.textContent =
        formatNumber(Number(model.element.rate.value), 3);
    });
    for (const feld of ["rate", "beta0", "beta1"]) {
      model.element[feld].addEventListener("change", compare.trainCompare);
    }
  }

  compareControls.play.addEventListener("click", compare.playback.start);
  compareControls.pause.addEventListener("click", compare.playback.stop);
  compareControls.reset.addEventListener("click", compare.resetCompare);
  compareControls.tempo.addEventListener("change", () => {
    if (compare.playback.running()) {
      compare.playback.start();
    }
  });
}

function wireNavigation() {
  controls.railToggle.addEventListener("click", () => {
    controls.layout.classList.toggle("collapsed");
  });

  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => {
      const showCompare = tab.dataset.tab === "compare";

      for (const other of document.querySelectorAll(".tab")) {
        other.classList.toggle("active", other === tab);
      }
      panels.single.classList.toggle("hidden", showCompare);
      panels.compare.classList.toggle("hidden", !showCompare);

      stopAll();
      if (showCompare) {
        compare.openIfStale();
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
  wireData();
  wireSingle();
  wireCompare();
  wireNavigation();

  await dataPanel.loadExamples();
  await dataPanel.loadDataset();
  await train();
}

start();
