import { COLORS, MINI_MARGIN, PLOT_OPTIONS, TRANSPARENT, font, lockedAxis }
  from "../palette.js";
import { state, costAt } from "../state.js";

const PUNKTE = 80;

function costAlongBeta1(beta1) {
  return costAt(state.ols.beta0, beta1);
}

function window() {
  const startBeta1 = state.history[0].beta1;
  const reach = Math.max(Math.abs(startBeta1 - state.ols.beta1),
                         Math.abs(state.ols.beta1) * 0.5, 1);
  return [state.ols.beta1 - 1.4 * reach, state.ols.beta1 + 1.4 * reach];
}

export function drawRateEffect(element) {
  const [from, to] = window();
  const curveX = [];
  const curveY = [];

  for (let i = 0; i <= PUNKTE; i += 1) {
    const beta1 = from + (to - from) * i / PUNKTE;
    curveX.push(beta1);
    curveY.push(costAlongBeta1(beta1));
  }

  const bowl = {
    x: curveX, y: curveY,
    mode: "lines", type: "scatter", hoverinfo: "skip",
    line: { color: COLORS.grey, width: 1.6 },
  };

  const start = state.history[0].beta1;
  const jump = {
    x: [start], y: [costAlongBeta1(start)],
    mode: "lines+markers", type: "scatter", hoverinfo: "skip",
    line: { color: COLORS.amber, width: 1.5 },
    marker: { size: 5, color: COLORS.amber },
  };

  const layout = {
    margin: MINI_MARGIN,
    paper_bgcolor: TRANSPARENT,
    plot_bgcolor: TRANSPARENT,
    font: font(10, COLORS.faint),
    xaxis: lockedAxis({ title: { text: "β₁", standoff: 4 }, range: [from, to] }),
    yaxis: lockedAxis({
      range: [0, Math.max(curveY[0], curveY[curveY.length - 1])],
      showticklabels: false,
    }),
    showlegend: false,
    dragmode: false,
  };

  Plotly.react(element, [bowl, jump], layout, PLOT_OPTIONS);
}

export function updateRateEffect(element, step) {
  const werte = state.history.slice(0, step + 1).map((entry) => entry.beta1);

  Plotly.restyle(element, {
    x: [werte],
    y: [werte.map(costAlongBeta1)],
  }, [1]);
}
