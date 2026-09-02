import { useEffect, useState } from "react";
import { X, IndianRupee, Ruler, MapPin } from "lucide-react";
import { getRoadDetail } from "../api/client.js";
import { PriorityBadge, FundingBadge } from "./PriorityBadge.jsx";
import { formatCr, formatScore, titleCase } from "../utils/priority.js";
import "./RoadDetailDrawer.css";

const FACTOR_LABELS = {
  condition: "Condition",
  usage: "Usage",
  safety: "Safety",
  drainage: "Drainage",
  civic: "Civic importance",
};

export default function RoadDetailDrawer({ road, strategy, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!road) return;
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    getRoadDetail(road.road_id, strategy)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setDetail(road);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [road, strategy]);

  if (!road) return null;
  const r = detail || road;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="drawer-id mono">{r.road_id}</div>
            <h3 className="drawer-title">{r.road_name}</h3>
            <div className="drawer-meta">
              <MapPin size={13} /> {r.area} · Zone {r.zone} · Ward {r.ward}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="drawer-badges">
          <PriorityBadge label={r.priority_label} />
          <FundingBadge status={r.funding_status || "unfunded"} />
          <span className="badge" style={{ color: "var(--text-secondary)", background: "var(--bg-panel-hover)" }}>
            {titleCase(r.road_type)}
          </span>
        </div>

        <div className="drawer-stat-row">
          <div className="drawer-stat">
            <span>Priority score</span>
            <strong className="mono">{formatScore(r.priority_score)}</strong>
          </div>
          <div className="drawer-stat">
            <span>12mo projected</span>
            <strong className="mono">{formatScore(r.future_score_12m)}</strong>
          </div>
          <div className="drawer-stat">
            <span>
              <Ruler size={11} /> Length
            </span>
            <strong className="mono">{r.length_km} km</strong>
          </div>
          <div className="drawer-stat">
            <span>
              <IndianRupee size={11} /> Est. cost
            </span>
            <strong className="mono">{formatCr(r.estimated_cost_cr)}</strong>
          </div>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-title">Recommended action</div>
          <div className="drawer-action">
            <span className="drawer-action-name">{titleCase(r.recommended_action)}</span>
            <span className="drawer-action-reason">{r.recommendation_reason}</span>
          </div>
        </div>

        {r.factor_scores && (
          <div className="drawer-section">
            <div className="drawer-section-title">Risk factors</div>
            <div className="factor-bars">
              {Object.entries(r.factor_scores).map(([key, value]) => (
                <div className="factor-bar-row" key={key}>
                  <span className="factor-bar-label">{FACTOR_LABELS[key] || titleCase(key)}</span>
                  <div className="factor-bar-track">
                    <div
                      className="factor-bar-fill"
                      style={{
                        width: `${Math.min(100, value)}%`,
                        background:
                          value >= 65
                            ? "var(--critical)"
                            : value >= 40
                            ? "var(--high)"
                            : "var(--medium)",
                      }}
                    />
                  </div>
                  <span className="factor-bar-value mono">{formatScore(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="drawer-section">
          <div className="drawer-section-title">
            Why this priority {loading && <span className="drawer-loading">loading…</span>}
          </div>
          {r.explanation ? (
            <ul className="drawer-explanation">
              {r.explanation.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="drawer-explanation-empty">
              Highest-weighted factors and recommended action shown above.
            </p>
          )}
        </div>

        <div className="drawer-section drawer-grid">
          <DetailField label="Potholes / km" value={r.potholes_per_km} />
          <DetailField label="Crack %" value={r.crack_percent} />
          <DetailField label="Roughness (IRI)" value={r.roughness_iri} />
          <DetailField label="Waterlogging days/yr" value={r.waterlogging_days_per_year} />
          <DetailField label="Traffic (PCU/day)" value={r.traffic_pcu_per_day?.toLocaleString?.()} />
          <DetailField label="Accidents (3y)" value={r.accident_count_3y} />
          <DetailField label="Complaints (90d)" value={r.complaints_90d} />
          <DetailField label="Bus route" value={r.bus_route ? "Yes" : "No"} />
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong className="mono">{value ?? "—"}</strong>
    </div>
  );
}
