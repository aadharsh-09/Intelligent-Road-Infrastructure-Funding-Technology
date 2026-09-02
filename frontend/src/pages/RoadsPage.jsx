import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { PriorityBadge, FundingBadge } from "../components/PriorityBadge.jsx";
import RoadDetailDrawer from "../components/RoadDetailDrawer.jsx";
import { formatCr, formatScore } from "../utils/priority.js";
import "./RoadsPage.css";

const COLUMNS = [
  { key: "road_id", label: "Road ID", sortable: true },
  { key: "road_name", label: "Road name", sortable: true },
  { key: "area", label: "Area", sortable: true },
  { key: "priority_label", label: "Priority", sortable: true },
  { key: "condition", label: "Condition score", sortable: true },
  { key: "estimated_cost_cr", label: "Est. repair cost", sortable: true },
  { key: "funding_status", label: "Funding status", sortable: true },
];

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const FUNDING_RANK = { funded: 0, deferred: 1, unfunded: 2 };

export default function RoadsPage({ data, strategy }) {
  const { loading, roads } = data;
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All");
  const [sort, setSort] = useState({ key: "priority_label", dir: "asc" });
  const [selectedRoad, setSelectedRoad] = useState(null);

  const areas = useMemo(
    () => ["All", ...Array.from(new Set(roads.map((r) => r.area))).sort()],
    [roads]
  );

  const filtered = useMemo(() => {
    let list = roads;
    if (priorityFilter !== "All") {
      list = list.filter((r) => r.priority_label === priorityFilter);
    }
    if (areaFilter !== "All") {
      list = list.filter((r) => r.area === areaFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.road_id.toLowerCase().includes(q) ||
          r.road_name.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q)
      );
    }

    const sorted = [...list].sort((a, b) => {
      let av, bv;
      switch (sort.key) {
        case "priority_label":
          av = PRIORITY_RANK[a.priority_label];
          bv = PRIORITY_RANK[b.priority_label];
          break;
        case "condition":
          av = a.factor_scores?.condition ?? 0;
          bv = b.factor_scores?.condition ?? 0;
          break;
        case "funding_status":
          av = FUNDING_RANK[a.funding_status];
          bv = FUNDING_RANK[b.funding_status];
          break;
        default:
          av = a[sort.key];
          bv = b[sort.key];
      }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [roads, priorityFilter, areaFilter, query, sort]);

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <div className="roads-page">
      <div className="roads-toolbar">
        <div className="roads-search">
          <Search size={14} />
          <input
            placeholder="Search by road ID, name, or area…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          {["All", "Critical", "High", "Medium", "Low"].map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All priorities" : p}
            </option>
          ))}
        </select>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a === "All" ? "All areas" : a}
            </option>
          ))}
        </select>
        <div className="roads-count">{filtered.length} of {roads.length} roads</div>
      </div>

      <div className="panel roads-table-panel">
        {loading && !roads.length ? (
          <div className="loading-state">Loading roads…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No roads match these filters.</div>
        ) : (
          <div className="roads-table-scroll">
            <table className="roads-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} onClick={() => col.sortable && toggleSort(col.key)}>
                      <span>
                        {col.label}
                        {col.sortable && (
                          sort.key === col.key ? (
                            sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                          ) : (
                            <ArrowUpDown size={11} className="sort-idle" />
                          )
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((road) => (
                  <tr key={road.road_id} onClick={() => setSelectedRoad(road)}>
                    <td className="mono">{road.road_id}</td>
                    <td className="roads-table-name">{road.road_name}</td>
                    <td>{road.area}</td>
                    <td>
                      <PriorityBadge label={road.priority_label} />
                    </td>
                    <td className="mono">{formatScore(road.factor_scores?.condition)}</td>
                    <td className="mono">{formatCr(road.estimated_cost_cr)}</td>
                    <td>
                      <FundingBadge status={road.funding_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RoadDetailDrawer road={selectedRoad} strategy={strategy} onClose={() => setSelectedRoad(null)} />
    </div>
  );
}
