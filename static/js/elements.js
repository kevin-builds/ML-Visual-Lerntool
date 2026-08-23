const byId = (id) => document.getElementById(id);

export const charts = {
  scatter: byId("scatter"),
  error: byId("error-chart"),
  landscape: byId("landscape-chart"),
  rate: byId("rate-chart"),
};

export const view = {
  iteration: byId("status-iteration"),
  total: byId("status-total"),
  rate: byId("status-rate"),
  grad0: byId("grad0"),
  grad1: byId("grad1"),
  equation: byId("equation"),
  coefficients: byId("coefficients"),
  mse: byId("status-mse"),
  state: byId("status-state"),
  predictResult: byId("predict-result"),
  predictUnit: byId("predict-unit"),
  stopNote: byId("stop-note"),
  landscapeCaption: byId("landscape-caption"),
  rateCaption: byId("rate-caption"),
};

export const table = {
  body: byId("table-body"),
  frame: byId("table-frame"),
  more: byId("table-more"),
  headX: byId("head-x"),
  headY: byId("head-y"),
  splitCaption: byId("split-caption"),
  segmentTrain: byId("segment-train"),
  segmentTest: byId("segment-test"),
};

export const controls = {
  layout: byId("layout"),
  railToggle: byId("rail-toggle"),

  dataset: byId("dataset"),
  dropzone: byId("dropzone"),
  fileInput: byId("file-input"),
  uploadNote: byId("upload-note"),
  shareButtons: byId("share-buttons"),

  rate: byId("rate"),
  startBeta0: byId("start-beta0"),
  startBeta1: byId("start-beta1"),
  predictX: byId("predict-x"),
  residuals: byId("toggle-residuals"),

  stepBack: byId("step-back"),
  stepForward: byId("step-forward"),
  play: byId("play"),
  pause: byId("pause"),
  reset: byId("reset"),
  tempo: byId("tempo"),
};

export const compareControls = {
  play: byId("play-compare"),
  pause: byId("pause-compare"),
  reset: byId("reset-compare"),
  tempo: byId("tempo-compare"),
};

export const panels = {
  single: byId("panel-single"),
  compare: byId("panel-compare"),
};

export function modelElements(key) {
  return {
    scatter: byId("scatter-" + key),
    error: byId("error-" + key),
    rate: byId("rate-" + key),
    rateValue: byId("rate-value-" + key),
    beta0: byId("beta0-" + key),
    beta1: byId("beta1-" + key),
    iteration: byId("iteration-" + key),
    total: byId("total-" + key),
    mseTest: byId("mse-test-" + key),
    mseTrain: byId("mse-train-" + key),
    equation: byId("equation-" + key),
    state: byId("state-" + key),
  };
}
