export const state = {
  dataset: null,
  uploaded: null,

  training: { x: [], y: [] },
  test: { x: [], y: [] },
  scaled: { path: { beta0: [], beta1: [] }, points: { x: [], y: [] } },

  history: [],
  status: "",
  ols: null,

  step: 0,
  completed: false,

  trainingShare: 75,
  showResiduals: false,
  tableExpanded: false,
  axisRange: { x: [0, 1], y: [0, 1] },
};

export function lastIndex() {
  return state.history.length - 1;
}

export function currentState() {
  return state.history[Math.min(state.step, lastIndex())];
}

export function setAxisRange(dataset) {
  state.axisRange = {
    x: [Math.min(0, Math.min(...dataset.x)), Math.max(...dataset.x) * 1.06],
    y: [Math.min(0, Math.min(...dataset.y)), Math.max(...dataset.y) * 1.12],
  };
}

export function storeRun(payload) {
  state.training = payload.training;
  state.test = payload.test;
  state.scaled = payload.scaled;
  state.history = payload.history;
  state.status = payload.status;
  state.ols = payload.ols;
  state.step = 0;
  state.completed = false;
}

export function costAt(beta0, beta1) {
  return meanSquaredError(state.training, beta0, beta1);
}

export function scaledCostAt(beta0, beta1) {
  return meanSquaredError(state.scaled.points, beta0, beta1);
}

export function meanSquaredError(points, beta0, beta1) {
  if (points.x.length === 0) {
    return null;
  }
  let total = 0;
  for (let i = 0; i < points.x.length; i += 1) {
    const error = points.y[i] - (beta0 + beta1 * points.x[i]);
    total += error * error;
  }
  return total / points.x.length;
}
