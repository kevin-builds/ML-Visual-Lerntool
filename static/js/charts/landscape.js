import { COLORS, LANDSCAPE_MARGIN, PLOT_OPTIONS, TRANSPARENT, font, lockedAxis }
  from "../palette.js";
import { state, scaledCostAt } from "../state.js";

const GITTER = 46;

function window(element) {
  const box = element.getBoundingClientRect();
  const plotWidth = box.width - LANDSCAPE_MARGIN.l - LANDSCAPE_MARGIN.r;
  const plotHeight = box.height - LANDSCAPE_MARGIN.t - LANDSCAPE_MARGIN.b;
  const aspect = plotWidth / plotHeight;

  const centreX = state.ols.scaled0;
  const centreY = state.ols.scaled1;
  let halfX = Math.max(Math.abs(state.scaled.path.beta0[0] - centreX) * 1.35, 0.5);
  let halfY = Math.max(Math.abs(state.scaled.path.beta1[0] - centreY) * 1.35, 0.5);

  if (halfX / halfY < aspect) {
    halfX = halfY * aspect;
  } else {
    halfY = halfX / aspect;
  }

  return {
    x: [centreX - halfX, centreX + halfX],
    y: [centreY - halfY, centreY + halfY],
  };
}

function achse(from, to) {
  const werte = [];
  for (let i = 0; i <= GITTER; i += 1) {
    werte.push(from + (to - from) * i / GITTER);
  }
  return werte;
}

export function drawLandscape(element) {
  const frame = window(element);
  const axis0 = achse(frame.x[0], frame.x[1]);
  const axis1 = achse(frame.y[0], frame.y[1]);

  const grid = axis1.map((beta1) =>
    axis0.map((beta0) => Math.sqrt(scaledCostAt(beta0, beta1))));

  const contour = {
    x: axis0,
    y: axis1,
    z: grid,
    type: "contour",
    ncontours: 14,
    contours: { coloring: "lines" },
    colorscale: [[0, COLORS.contourLow], [1, COLORS.contourHigh]],
    showscale: false,
    hoverinfo: "skip",
    line: { width: 1 },
  };

  const optimum = {
    x: [state.ols.scaled0],
    y: [state.ols.scaled1],
    mode: "markers",
    type: "scatter",
    marker: { size: 9, color: COLORS.green, symbol: "x", line: { width: 2 } },
    hoverinfo: "skip",
  };

  const start = [state.scaled.path.beta0[0]];
  const startY = [state.scaled.path.beta1[0]];

  const path = {
    x: start, y: startY,
    mode: "lines", type: "scatter", hoverinfo: "skip",
    line: { color: COLORS.line, width: 1.6 },
  };

  const marker = {
    x: start, y: startY,
    mode: "markers", type: "scatter", hoverinfo: "skip",
    marker: { size: 7, color: COLORS.white,
              line: { color: COLORS.line, width: 2 } },
  };

  const layout = {
    margin: LANDSCAPE_MARGIN,
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: TRANSPARENT,
    font: font(10, COLORS.faint),
    xaxis: lockedAxis({ title: { text: "β₀′", standoff: 4 },
                        range: frame.x, showticklabels: false }),
    yaxis: lockedAxis({ title: { text: "β₁′", standoff: 4 },
                        range: frame.y, showticklabels: false }),
    showlegend: false,
    dragmode: false,
  };

  Plotly.react(element, [contour, optimum, path, marker], layout, PLOT_OPTIONS);
}

export function updateLandscape(element, step) {
  const pathX = state.scaled.path.beta0.slice(0, step + 1);
  const pathY = state.scaled.path.beta1.slice(0, step + 1);

  Plotly.restyle(element, {
    x: [pathX, [pathX[pathX.length - 1]]],
    y: [pathY, [pathY[pathY.length - 1]]],
  }, [2, 3]);
}
