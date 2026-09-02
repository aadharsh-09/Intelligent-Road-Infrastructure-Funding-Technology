import { LayoutDashboard, Map, Table2, Database, Route } from "lucide-react";
import { STRATEGIES } from "../api/client";
import "./Sidebar.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "map", label: "Map", icon: Map },
  { key: "roads", label: "Roads", icon: Table2 },
  { key: "data", label: "Data", icon: Database },
];

export default function Sidebar({
  active,
  onNavigate,
  strategy,
  onStrategyChange,
  budget,
  onBudgetChange,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Route size={18} strokeWidth={2.2} />
        </div>
        <div>
          <div className="sidebar-brand-title">Intelligent Road</div>
          <div className="sidebar-brand-title">Infrastructure</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigate</div>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`sidebar-nav-item${active === key ? " is-active" : ""}`}
            onClick={() => onNavigate(key)}
          >
            <Icon size={16} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-controls">
        <div className="sidebar-nav-label">Prioritization</div>

        <label className="sidebar-field">
          <span>Strategy</span>
          <select
            value={strategy}
            onChange={(e) => onStrategyChange(e.target.value)}
          >
            {STRATEGIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sidebar-field">
          <span>Budget (Cr)</span>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={budget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" />
        Chennai Corporation · synthetic dataset
      </div>
    </aside>
  );
}
