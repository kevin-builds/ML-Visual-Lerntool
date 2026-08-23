import { charts, controls, view } from "./elements.js";
import { state, currentState, lastIndex, storeRun } from "./state.js";
import { formatNumber, formatSigned, formatEquation } from "./format.js";
import { requestTraining } from "./api.js";
import { showCounts } from "./dataPanel.js";
import { drawScatter } from "./charts/scatter.js";
import { drawErrorCurve } from "./charts/errorCurve.js";
import { drawLandscape, updateLandscape } from "./charts/landscape.js";
import { drawRateEffect, updateRateEffect } from "./charts/rateEffect.js";

const ABBRUCH_HINWEIS =
  "Abbruch: sobald sich der MSE zehnmal in Folge um weniger als 10⁻⁹ ändert";

export function settings() {
  return {
    learning_rate: Number(controls.rate.value),
    beta0: Number(controls.startBeta0.value),
    beta1: Number(controls.startBeta1.value),
    training_share: state.trainingShare / 100,
    points: { x: state.dataset.x, y: state.dataset.y },
  };
}

export function predictionInput() {
  const text = controls.predictX.value.trim();
  if (text === "") {
    return null;
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

export async function train() {
  storeRun(await requestTraining(settings()));

  showCounts();
  view.stopNote.textContent = ABBRUCH_HINWEIS;

  drawLandscape(charts.landscape);
  drawRateEffect(charts.rate);
  render();
}

function showMetrics(current, last) {
  view.iteration.textContent = current.iteration;
  view.total.textContent = "von " + (state.completed ? last : "–");
  view.rate.textContent = formatNumber(Number(controls.rate.value), 3);
  view.grad0.textContent = formatSigned(current.grad0, 2);
  view.grad1.textContent = formatSigned(current.grad1, 2);
  view.equation.textContent = formatEquation(current.beta0, current.beta1);
  view.coefficients.textContent =
    "β₀ = " + formatNumber(current.beta0, 2) +
    " · β₁ = " + formatNumber(current.beta1, 4);
  view.mse.textContent = formatNumber(current.mse, 0);
  view.state.textContent = state.step === last ? state.status : "–";
}

function showPrediction(current, predictX) {
  view.predictResult.textContent = predictX === null
    ? "ŷ = –"
    : "ŷ = " + formatNumber(current.beta0 + current.beta1 * predictX, 1);
}

function showCaptions() {
  view.landscapeCaption.textContent = state.step === 0
    ? "Startpunkt, grünes Kreuz ist das Minimum"
    : "Abstiegspfad nach " + state.step + " Iterationen";

  view.rateCaption.textContent = "Schritte entlang β₁ bei α = " +
    formatNumber(Number(controls.rate.value), 3);
}

export function render() {
  const current = currentState();
  const last = lastIndex();
  const predictX = predictionInput();

  if (state.step === last) {
    state.completed = true;
  }

  showMetrics(current, last);
  showPrediction(current, predictX);
  showCaptions();

  drawScatter(charts.scatter, current, predictX);
  drawErrorCurve(charts.error, state.history, state.step,
                 state.status === "divergiert");
  updateLandscape(charts.landscape, state.step);
  updateRateEffect(charts.rate, state.step);
}
