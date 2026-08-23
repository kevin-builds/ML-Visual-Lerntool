import { COLORS, MINI_MARGIN, PLOT_OPTIONS, TRANSPARENT, font, lockedAxis }
  from "../palette.js";
import { formatNumber } from "../format.js";

export function drawErrorCurve(element, history, step, diverged) {
  const shown = history.slice(0, step + 1);
  const colour = diverged ? COLORS.red : COLORS.green;
  const values = history.map((entry) => entry.mse)
                        .filter((value) => value !== null);

  const curve = {
    x: shown.map((entry) => entry.iteration),
    y: shown.map((entry) => entry.mse),
    mode: "lines",
    type: "scatter",
    fill: diverged ? "none" : "tozeroy",
    fillcolor: COLORS.greenFill,
    line: { color: colour, width: 2 },
    hoverinfo: "skip",
  };

  const head = {
    x: [shown[shown.length - 1].iteration],
    y: [shown[shown.length - 1].mse],
    mode: "markers",
    type: "scatter",
    marker: { size: 7, color: colour },
    hoverinfo: "skip",
  };

  const layout = {
    margin: MINI_MARGIN,
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: TRANSPARENT,
    font: font(10, COLORS.faint),
    xaxis: lockedAxis({
      title: { text: "Iteration", standoff: 6 },
      range: [0, history.length - 1],
    }),
    yaxis: lockedAxis({
      range: [0, Math.max(...values) * 1.08],
      showticklabels: false,
    }),
    showlegend: false,
    dragmode: false,
    annotations: [{
      x: 1, y: 0.08, xref: "paper", yref: "paper",
      text: formatNumber(shown[shown.length - 1].mse, 0),
      showarrow: false, xanchor: "right",
      font: { size: 11, color: colour },
    }],
  };

  Plotly.react(element, [curve, head], layout, PLOT_OPTIONS);
}
