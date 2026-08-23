import { COLORS, MARGIN, PLOT_OPTIONS, TRANSPARENT, font } from "../palette.js";
import { state } from "../state.js";

function pointTrace(points, colour, edge, name) {
  return {
    x: points.x,
    y: points.y,
    mode: "markers",
    type: "scatter",
    hovertemplate: "%{x} · %{y}<extra>" + name + "</extra>",
    marker: { size: 11, color: colour, line: { color: edge, width: 1.4 } },
  };
}

function lineTrace(beta0, beta1) {
  const x = state.axisRange.x;
  return {
    x: x,
    y: x.map((value) => beta0 + beta1 * value),
    mode: "lines",
    type: "scatter",
    hoverinfo: "skip",
    line: { color: COLORS.line, width: 3 },
  };
}

function squareRatio(element) {
  const box = element.getBoundingClientRect();
  const plotWidth = box.width - MARGIN.l - MARGIN.r;
  const plotHeight = box.height - MARGIN.t - MARGIN.b;
  const spanX = state.axisRange.x[1] - state.axisRange.x[0];
  const spanY = state.axisRange.y[1] - state.axisRange.y[0];
  return (spanX / plotWidth) / (spanY / plotHeight);
}

function residualShapes(element, beta0, beta1) {
  const ratio = squareRatio(element);
  const shapes = [];

  for (let i = 0; i < state.training.x.length; i += 1) {
    const x = state.training.x[i];
    const y = state.training.y[i];
    const predicted = beta0 + beta1 * x;
    const side = Math.abs(y - predicted);
    if (side === 0) {
      continue;
    }
    shapes.push({
      type: "rect",
      x0: x,
      x1: x + side * ratio,
      y0: Math.min(y, predicted),
      y1: Math.max(y, predicted),
      line: { color: COLORS.amber, width: 1.2 },
      fillcolor: COLORS.amberFill,
      layer: "below",
    });
  }
  return shapes;
}

function predictionParts(beta0, beta1, x) {
  const y = beta0 + beta1 * x;
  const dashed = { color: COLORS.line, width: 1.1, dash: "dash" };

  return {
    trace: {
      x: [x],
      y: [y],
      mode: "markers",
      type: "scatter",
      hoverinfo: "skip",
      marker: {
        size: 13,
        color: COLORS.white,
        line: { color: COLORS.line, width: 2.4 },
      },
    },
    shapes: [
      { type: "line", x0: x, x1: x, y0: state.axisRange.y[0], y1: y, line: dashed },
      { type: "line", x0: state.axisRange.x[0], x1: x, y0: y, y1: y, line: dashed },
    ],
  };
}

function axis(label, range) {
  return {
    title: { text: label, standoff: 12 },
    range: range,
    fixedrange: true,
    gridcolor: COLORS.grid,
    zeroline: false,
    ticks: "outside",
    tickcolor: COLORS.grid,
  };
}

export function drawScatter(element, current, predictX) {
  const traces = [
    pointTrace(state.training, COLORS.point, COLORS.pointEdge, "Training"),
    pointTrace(state.test, COLORS.testPoint, COLORS.testEdge, "Test"),
    lineTrace(current.beta0, current.beta1),
  ];
  const shapes = state.showResiduals
    ? residualShapes(element, current.beta0, current.beta1)
    : [];

  if (predictX !== null) {
    const parts = predictionParts(current.beta0, current.beta1, predictX);
    traces.push(parts.trace);
    shapes.push(...parts.shapes);
  }

  const layout = {
    margin: MARGIN,
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: COLORS.surface,
    font: font(11, COLORS.muted),
    xaxis: axis(state.dataset.x_label, state.axisRange.x),
    yaxis: axis(state.dataset.y_label, state.axisRange.y),
    showlegend: false,
    dragmode: false,
    shapes: shapes,
  };

  Plotly.react(element, traces, layout, PLOT_OPTIONS);
}
