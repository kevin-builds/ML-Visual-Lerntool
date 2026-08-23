const LEER = "–";

export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return LEER;
  }
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatSigned(value, decimals = 2) {
  const smallest = Math.pow(10, -decimals) / 2;
  if (Math.abs(value) < smallest) {
    return formatNumber(0, decimals);
  }
  return (value < 0 ? "−" : "+") + formatNumber(Math.abs(value), decimals);
}

export function formatEquation(beta0, beta1) {
  return "ŷ = " + formatNumber(beta0, 1) + " + " +
         formatNumber(beta1, 2) + " · x";
}

export function unitOf(label) {
  const match = label.match(/\(([^)]+)\)/);
  return match ? match[1] : "";
}
