import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AlertTriangle, ListChecks, IndianRupee, Route } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import { PriorityBadge } from "../components/PriorityBadge.jsx";
import RoadDetailDrawer from "../components/RoadDetailDrawer.jsx";
import { formatCr, formatScore } from "../utils/priority.js";
import "./Dashboard.css";

const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"];
const PRIORITY_HEX = {
  Critical: "#e2543f",
  High: "#ef9d2e",
  Medium: "#4c9be8",
  Low: "#43b37a",
};

export default function Dashboard({ data, strategy }) {
  const { loading, roads, summary, optimize } = data;
  const [selectedRoad, setSelectedRoad] = useState(null);

  const priorityData = useMemo(() => {
    if (!summary) return [];
    return PRIORITY_ORDER.map((label) => ({
      label,
      count: summary.priority_counts?.[label] ?? 0,
    }));
  }, [summary]);

  const budgetData = useMemo(() => {
    if (!optimize) return [];
    return [
      { name: "Allocated", value: optimize.used_budget_cr },
      { name: "Remaining", value: Math.max(0, optimize.remaining_budget_cr) },
    ];
  }, [optimize]);

  const riskOverview = useMemo(() => {
    if (!roads.length) return [];
    const sums = { condition: 0, usage: 0, safety: 0, drainage: 0, civic: 0 };
    roads.forEach((r) => {
      Object.keys(sums).forEach((k) => {
        sums[k] += r.factor_scores?.[k] ?? 0;
      });
    });
    const n = roads.length;
    return [
      { factor: "Condition", value: sums.condition / n },
      { factor: "Usage", value: sums.usage / n },
      { factor: "Safety", value: sums.safety / n },
      { factor: "Drainage", value: sums.drainage / n },
      { factor: "Civic", value: sums.civic / n },
    ];
  }, [roads]);

  if (loading && !summary) {
    return <div className="loading-state">Loading network data…</div>;
  }

  const criticalCount = summary?.priority_counts?.Critical ?? 0;
  const fundedCount = optimize?.selected_count ?? 0;
  const budgetPct = optimize
    ? Math.min(100, (optimize.used_budget_cr / optimize.budget_cr) * 100)
    : 0;

  const topRoads = (summary?.top_roads ?? roads.slice(0, 8)).slice(0, 8);

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <StatCard
          label="Total roads"
          value={summary?.total_roads ?? "—"}
          sub="in the surveyed network"
          icon={Route}
        />
        <StatCard
          label="Critical roads"
          value={criticalCount}
          sub={`${summary ? Math.round((criticalCount / summary.total_roads) * 100) : 0}% of network`}
          icon={AlertTriangle}
          tone="critical"
        />
        <StatCard
          label="Roads funded"
          value={fundedCount}
          sub={`of ${summary?.total_roads ?? "—"} at current budget`}
          icon={ListChecks}
          tone="low"
        />
        <StatCard
          label="Budget used"
          value={optimize ? formatCr(optimize.used_budget_cr) : "—"}
          sub={optimize ? `${budgetPct.toFixed(0)}% of ₹${optimize.budget_cr} Cr` : ""}
          icon={IndianRupee}
          tone="accent"
        />
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Priority distribution</div>
              <div className="panel-subtitle">Roads by priority label, current strategy</div>
            </div>
          </div>
          <div className="panel-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke="#2b3136" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7480" fontSize={11.5} tickLine={false} axisLine={{ stroke: "#2b3136" }} />
                <YAxis stroke="#6b7480" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" roads" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={54}>
                  {priorityData.map((d) => (
                    <Cell key={d.label} fill={PRIORITY_HEX[d.label]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Budget allocation</div>
              <div className="panel-subtitle">₹{optimize?.budget_cr ?? "—"} Cr available</div>
            </div>
          </div>
          <div className="panel-body budget-body">
            <div style={{ height: 190, width: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    dataKey="value"
                    innerRadius={56}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="none"
                  >
                    <Cell fill="#f2b705" />
                    <Cell fill="#2b3136" />
                  </Pie>
                  <Tooltip content={<ChartTooltip prefix="₹" suffix=" Cr" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="budget-legend">
              <LegendRow color="#f2b705" label="Allocated" value={formatCr(optimize?.used_budget_cr)} />
              <LegendRow color="#2b3136" label="Remaining" value={formatCr(optimize?.remaining_budget_cr)} />
              <div className="budget-legend-note">
                {optimize?.deferred_critical_roads?.length ?? 0} critical/high roads deferred at this budget
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Network risk overview</div>
              <div className="panel-subtitle">Average factor score across all roads</div>
            </div>
          </div>
          <div className="panel-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskOverview} outerRadius="75%">
                <PolarGrid stroke="#2b3136" />
                <PolarAngleAxis dataKey="factor" stroke="#9ba4ac" fontSize={11.5} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#f2b705" fill="#f2b705" fillOpacity={0.22} strokeWidth={2} />
                <Tooltip content={<ChartTooltip suffix="/100" />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Highest-priority roads</div>
            <div className="panel-subtitle">Top of the current ranking — click a row for details</div>
          </div>
        </div>
        <div className="preview-table">
          <div className="preview-row preview-row--head">
            <span>Road</span>
            <span>Area</span>
            <span>Priority</span>
            <span>Score</span>
            <span>Action</span>
            <span>Cost</span>
          </div>
          {topRoads.map((road) => (
            <button className="preview-row" key={road.road_id} onClick={() => setSelectedRoad(road)}>
              <span className="preview-road-name">
                <span className="mono preview-road-id">{road.road_id}</span>
                {road.road_name}
              </span>
              <span>{road.area}</span>
              <span>
                <PriorityBadge label={road.priority_label} />
              </span>
              <span className="mono">{formatScore(road.priority_score)}</span>
              <span className="preview-action">{road.recommended_action}</span>
              <span className="mono">{formatCr(road.estimated_cost_cr)}</span>
            </button>
          ))}
        </div>
      </div>

      <RoadDetailDrawer road={selectedRoad} strategy={strategy} onClose={() => setSelectedRoad(null)} />
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div className="legend-row">
      <span className="legend-dot" style={{ background: color }} />
      <span className="legend-label">{label}</span>
      <span className="legend-value mono">{value}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="chart-tooltip">
      {label && <div className="chart-tooltip-label">{label}</div>}
      <div className="chart-tooltip-value mono">
        {prefix}
        {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
        {suffix}
      </div>
    </div>
  );
}
