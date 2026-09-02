import { formatCr, formatScore } from "../utils/priority.js";
import { PriorityBadge } from "../components/PriorityBadge.jsx";
import "./DataPage.css";

const FIELD_GROUPS = [
  {
    title: "Identification & location",
    fields: [
      ["road_id", "Unique road identifier (e.g. CHN-RD-014)"],
      ["road_name", "Road name"],
      ["area", "Locality / neighborhood"],
      ["zone, ward", "Chennai Corporation zone and ward number"],
      ["latitude, longitude", "GPS coordinates used for the map view"],
      ["road_type", "interior / collector / bus_route / arterial"],
      ["pavement_type", "bituminous / cement_concrete / paver_block"],
      ["length_km", "Road segment length, used to scale repair cost"],
    ],
  },
  {
    title: "Condition factors",
    fields: [
      ["potholes_per_km", "Pothole density"],
      ["avg_pothole_severity_1_5", "Average pothole severity (1–5)"],
      ["crack_percent", "Surface area affected by cracking"],
      ["surface_distress_index", "Composite surface distress (0–100)"],
      ["roughness_iri", "International Roughness Index"],
      ["years_since_last_repair", "Time since last intervention"],
    ],
  },
  {
    title: "Usage & safety",
    fields: [
      ["traffic_pcu_per_day", "Passenger car units per day"],
      ["heavy_vehicle_percent", "Share of heavy vehicle traffic"],
      ["bus_route", "On an active bus route"],
      ["accident_count_3y", "Recorded accidents, trailing 3 years"],
      ["complaints_90d", "Citizen complaints, trailing 90 days"],
    ],
  },
  {
    title: "Drainage & civic importance",
    fields: [
      ["drainage_score_0_100", "Drainage adequacy (higher is better)"],
      ["waterlogging_days_per_year", "Days with standing water"],
      ["flood_vulnerability_0_100", "Composite flood risk"],
      ["civic_importance_0_100", "Proximity to key civic infrastructure"],
      ["near_school_hospital", "Adjacent to a school or hospital"],
    ],
  },
];

const FACTOR_WEIGHTS = {
  balanced: { condition: 40, usage: 20, safety: 20, drainage: 10, civic: 10 },
  safety_first: { condition: 30, usage: 15, safety: 35, drainage: 10, civic: 10 },
  flood_first: { condition: 30, usage: 15, safety: 15, drainage: 30, civic: 10 },
  traffic_first: { condition: 30, usage: 35, safety: 15, drainage: 10, civic: 10 },
};

export default function DataPage({ data, strategy }) {
  const { loading, roads, summary, optimize } = data;
  const weights = FACTOR_WEIGHTS[strategy] || FACTOR_WEIGHTS.balanced;

  if (loading && !roads.length) {
    return <div className="loading-state">Loading dataset…</div>;
  }

  const preview = roads.slice(0, 10);

  return (
    <div className="data-page">
      <div className="data-summary-grid">
        <div className="panel data-summary-card">
          <span className="data-summary-label">Roads in dataset</span>
          <span className="data-summary-value mono">{summary?.total_roads ?? roads.length}</span>
          <span className="data-summary-note">Synthetic Chennai road network, generated for this demo</span>
        </div>
        <div className="panel data-summary-card">
          <span className="data-summary-label">Data fields per road</span>
          <span className="data-summary-value mono">
            {FIELD_GROUPS.reduce((n, g) => n + g.fields.length, 0)}
          </span>
          <span className="data-summary-note">Across identification, condition, usage, drainage and civic groups</span>
        </div>
        <div className="panel data-summary-card">
          <span className="data-summary-label">Active strategy weights</span>
          <div className="weight-bars">
            {Object.entries(weights).map(([k, v]) => (
              <div className="weight-bar-row" key={k}>
                <span>{k}</span>
                <div className="weight-bar-track">
                  <div className="weight-bar-fill" style={{ width: `${v}%` }} />
                </div>
                <span className="mono">{v}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel data-summary-card">
          <span className="data-summary-label">Budget configuration</span>
          <span className="data-summary-value mono">{formatCr(optimize?.budget_cr)}</span>
          <span className="data-summary-note">
            {formatCr(optimize?.used_budget_cr)} allocated · {optimize?.selected_count ?? 0} roads funded ·{" "}
            {optimize?.deferred_critical_roads?.length ?? 0} critical/high roads deferred
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Data fields</div>
            <div className="panel-subtitle">Every field returned by the API, grouped by what it measures</div>
          </div>
        </div>
        <div className="field-groups">
          {FIELD_GROUPS.map((group) => (
            <div className="field-group" key={group.title}>
              <div className="field-group-title">{group.title}</div>
              <ul className="field-list">
                {group.fields.map(([name, desc]) => (
                  <li key={name}>
                    <span className="mono field-name">{name}</span>
                    <span className="field-desc">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Scored data preview</div>
            <div className="panel-subtitle">First 10 roads as returned by /roads, current strategy</div>
          </div>
        </div>
        <div className="data-preview-scroll">
          <table className="data-preview-table">
            <thead>
              <tr>
                <th>Road ID</th>
                <th>Area</th>
                <th>Priority</th>
                <th>Score</th>
                <th>Condition</th>
                <th>Usage</th>
                <th>Safety</th>
                <th>Drainage</th>
                <th>Civic</th>
                <th>Action</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r) => (
                <tr key={r.road_id}>
                  <td className="mono">{r.road_id}</td>
                  <td>{r.area}</td>
                  <td>
                    <PriorityBadge label={r.priority_label} />
                  </td>
                  <td className="mono">{formatScore(r.priority_score)}</td>
                  <td className="mono">{formatScore(r.factor_scores?.condition)}</td>
                  <td className="mono">{formatScore(r.factor_scores?.usage)}</td>
                  <td className="mono">{formatScore(r.factor_scores?.safety)}</td>
                  <td className="mono">{formatScore(r.factor_scores?.drainage)}</td>
                  <td className="mono">{formatScore(r.factor_scores?.civic)}</td>
                  <td>{r.recommended_action}</td>
                  <td className="mono">{formatCr(r.estimated_cost_cr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
