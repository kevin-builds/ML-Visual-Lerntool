export const COLORS = {
  point: "#7F77DD",
  pointEdge: "#3C3489",
  testPoint: "#1D9E75",
  testEdge: "#0F6349",
  line: "#185FA5",
  amber: "#BA7517",
  amberFill: "rgba(186, 117, 23, 0.14)",
  green: "#1D9E75",
  greenFill: "rgba(29, 158, 117, 0.16)",
  red: "#D85A30",
  grey: "#B4B2A9",
  surface: "#FCFBF9",
  muted: "#6E6D66",
  faint: "#A3A199",
  grid: "#EFEEE9",
  contourLow: "#B9B2EC",
  contourHigh: "#DDDBD4",
  white: "#FFFFFF",
};

export const MODEL_COLORS = { a: "#185FA5", b: "#D85A30" };

export const MARGIN = { l: 58, r: 20, t: 14, b: 46 };
export const MINI_MARGIN = { l: 34, r: 12, t: 10, b: 26 };
export const LANDSCAPE_MARGIN = { l: 86, r: 86, t: 8, b: 24 };
export const COMPARE_MARGIN = { l: 52, r: 16, t: 12, b: 40 };
export const COMPARE_ERROR_MARGIN = { l: 34, r: 12, t: 8, b: 26 };

export const PLOT_OPTIONS = {
  displayModeBar: false,
  responsive: true,
  scrollZoom: false,
  doubleClick: false,
};

export const TRANSPARENT = "rgba(0,0,0,0)";

export function font(size, color) {
  return { family: "system-ui, sans-serif", size: size, color: color };
}

export function lockedAxis(extra) {
  return Object.assign({
    showgrid: false,
    zeroline: false,
    fixedrange: true,
  }, extra);
}
