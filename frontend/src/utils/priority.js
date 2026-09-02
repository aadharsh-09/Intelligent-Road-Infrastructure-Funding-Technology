export const PRIORITY_COLORS = {
  Critical: "var(--critical)",
  High: "var(--high)",
  Medium: "var(--medium)",
  Low: "var(--low)",
};

export const PRIORITY_SOFT = {
  Critical: "var(--critical-soft)",
  High: "var(--high-soft)",
  Medium: "var(--medium-soft)",
  Low: "var(--low-soft)",
};

export const FUNDING_LABEL = {
  funded: "Funded",
  deferred: "Deferred",
  unfunded: "Not selected",
};

export const FUNDING_COLOR = {
  funded: "var(--low)",
  deferred: "var(--critical)",
  unfunded: "var(--text-muted)",
};

export const FUNDING_SOFT = {
  funded: "var(--low-soft)",
  deferred: "var(--critical-soft)",
  unfunded: "rgba(155, 164, 172, 0.14)",
};

export function formatCr(value) {
  if (value === null || value === undefined) return "—";
  return `\u20B9${Number(value).toFixed(2)} Cr`;
}

export function formatScore(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
}

export function titleCase(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
