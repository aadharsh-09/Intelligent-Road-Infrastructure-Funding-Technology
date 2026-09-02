import {
  PRIORITY_COLORS,
  PRIORITY_SOFT,
  FUNDING_COLOR,
  FUNDING_SOFT,
  FUNDING_LABEL,
} from "../utils/priority.js";

export function PriorityBadge({ label }) {
  const color = PRIORITY_COLORS[label] || "var(--text-muted)";
  const background = PRIORITY_SOFT[label] || "rgba(155, 164, 172, 0.14)";
  return (
    <span className="badge" style={{ color, background }}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

export function FundingBadge({ status }) {
  const color = FUNDING_COLOR[status] || "var(--text-muted)";
  const background = FUNDING_SOFT[status] || "rgba(155, 164, 172, 0.14)";
  return (
    <span className="badge" style={{ color, background }}>
      <span className="badge-dot" />
      {FUNDING_LABEL[status] || status}
    </span>
  );
}
