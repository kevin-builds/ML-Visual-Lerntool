import { compareControls, modelElements, panels } from "./elements.js";
import { state, meanSquaredError } from "./state.js";
import { formatNumber, formatEquation } from "./format.js";
import { requestTraining } from "./api.js";
import { createPlayback } from "./playback.js";
import { COLORS, MODEL_COLORS, COMPARE_MARGIN, COMPARE_ERROR_MARGIN,
         PLOT_OPTIONS, TRANSPARENT, font, lockedAxis } from "./palette.js";

export const models = ["a", "b"].map((key) => ({
  key: key,
  colour: MODEL_COLORS[key],
  history: [],
  status: "",
  ols: null,
  element: modelElements(key),
}));

let step = 0;
let stale = true;

export const playback = createPlayback({
  length: () => longest() + 1,
  position: () => step,
  move: (wert) => { step = wert; },
  onFrame: renderCompare,
  speed: () => Number(compareControls.tempo.value),
});

function longest() {
  return Math.max(...models.map((model) => model.history.length)) - 1;
}

export function visible() {
  return !panels.compare.classList.contains("hidden");
}

export function markStale() {
  stale = true;
}

export function refresh() {
  markStale();
  if (visible()) {
    trainCompare();
  }
}

export function openIfStale() {
  if (stale) {
    trainCompare();
  }
}

async function trainOne(model) {
  const payload = await requestTraining({
    learning_rate: Number(model.element.rate.value),
    beta0: Number(model.element.beta0.value),
    beta1: Number(model.element.beta1.value),
    training_share: state.trainingShare / 100,
    points: { x: state.dataset.x, y: state.dataset.y },
  });

  model.history = payload.history;
  model.status = payload.status;
  model.ols = payload.ols;
}

export async function trainCompare() {
  playback.stop();
  step = 0;
  stale = false;

  await Promise.all(models.map(trainOne));

  for (const model of models) {
    drawScatter(model);
    drawError(model);
  }
  renderCompare();
}

export function resetCompare() {
  playback.stop();
  step = 0;
  renderCompare();
}

export function renderCompare() {
  for (const model of models) {
    const index = Math.min(step, model.history.length - 1);
    const current = model.history[index];
    const fertig = index === model.history.length - 1;
    const element = model.element;

    element.rateValue.textContent =
      formatNumber(Number(element.rate.value), 3);
    element.iteration.textContent = current.iteration;
    element.total.textContent =
      "von " + (fertig ? model.history.length - 1 : "–");
    element.state.textContent = fertig ? model.status : "–";

    const test = meanSquaredError(state.test, current.beta0, current.beta1);
    element.mseTest.textContent = test === null ? "–" : formatNumber(test, 0);
    element.mseTrain.textContent = "MSE Training " + formatNumber(
      meanSquaredError(state.training, current.beta0, current.beta1), 0);
    element.equation.textContent =
      formatEquation(current.beta0, current.beta1);

    drawScatter(model, current);
    updateError(model, index);
  }
}

function punkte(points, colour, edge) {
  return {
    x: points.x, y: points.y,
    mode: "markers", type: "scatter", hoverinfo: "skip",
    marker: { size: 8, color: colour, line: { color: edge, width: 1.2 } },
  };
}

function drawScatter(model, current) {
  const zustand = current || model.history[0];
  const x = state.axisRange.x;

  const traces = [
    punkte(state.training, COLORS.point, COLORS.pointEdge),
    punkte(state.test, COLORS.testPoint, COLORS.testEdge),
    {
      x: x,
      y: x.map((wert) => zustand.beta0 + zustand.beta1 * wert),
      mode: "lines", type: "scatter", hoverinfo: "skip",
      line: { color: model.colour, width: 2.6 },
    },
  ];

  const achse = (label, range) => ({
    title: { text: label, standoff: 10 },
    range: range, gridcolor: COLORS.grid, zeroline: false, fixedrange: true,
  });

  const layout = {
    margin: COMPARE_MARGIN,
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: COLORS.surface,
    font: font(11, COLORS.muted),
    xaxis: achse(state.dataset.x_label, state.axisRange.x),
    yaxis: achse(state.dataset.y_label, state.axisRange.y),
    showlegend: false,
    dragmode: false,
  };

  Plotly.react(model.element.scatter, traces, layout, PLOT_OPTIONS);
}

function drawError(model) {
  const diverged = model.status === "divergiert";
  const colour = diverged ? COLORS.red : COLORS.green;
  const werte = model.history.map((entry) => entry.mse)
                             .filter((wert) => wert !== null);

  const curve = {
    x: [0], y: [model.history[0].mse],
    mode: "lines", type: "scatter", hoverinfo: "skip",
    fill: diverged ? "none" : "tozeroy",
    fillcolor: COLORS.greenFill,
    line: { color: colour, width: 2 },
  };

  const layout = {
    margin: COMPARE_ERROR_MARGIN,
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: TRANSPARENT,
    font: font(10, COLORS.faint),
    xaxis: lockedAxis({ title: { text: "Iteration", standoff: 6 },
                        range: [0, Math.max(longest(), 1)] }),
    yaxis: lockedAxis({ range: [0, Math.max(...werte) * 1.08],
                        showticklabels: false }),
    showlegend: false,
    dragmode: false,
  };

  Plotly.react(model.element.error, [curve], layout, PLOT_OPTIONS);
}

function updateError(model, index) {
  const shown = model.history.slice(0, index + 1);
  Plotly.restyle(model.element.error, {
    x: [shown.map((entry) => entry.iteration)],
    y: [shown.map((entry) => entry.mse)],
  }, [0]);
}
