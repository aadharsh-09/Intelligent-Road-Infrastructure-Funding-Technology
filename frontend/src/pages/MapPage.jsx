import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import RoadDetailDrawer from "../components/RoadDetailDrawer.jsx";
import { formatCr, formatScore } from "../utils/priority.js";
import "./MapPage.css";

const PRIORITY_HEX = {
  Critical: "#e2543f",
  High: "#ef9d2e",
  Medium: "#4c9be8",
  Low: "#43b37a",
};

const PRIORITY_RADIUS = {
  Critical: 9,
  High: 7.5,
  Medium: 6,
  Low: 5,
};

const CHENNAI_CENTER = [13.03, 80.235];

export default function MapPage({ data, strategy }) {
  const { loading, roads } = data;
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [filter, setFilter] = useState("All");

  const visibleRoads = useMemo(() => {
    if (filter === "All") return roads;
    return roads.filter((r) => r.priority_label === filter);
  }, [roads, filter]);

  if (loading && !roads.length) {
    return <div className="loading-state">Loading road locations…</div>;
  }

  return (
    <div className="map-page">
      <div className="map-toolbar">
        <div className="map-toolbar-title">
          {visibleRoads.length} roads plotted
          <span className="map-toolbar-sub">Chennai road network, synthetic survey data</span>
        </div>
        <div className="map-filter-chips">
          {["All", "Critical", "High", "Medium", "Low"].map((label) => (
            <button
              key={label}
              className={`map-filter-chip${filter === label ? " is-active" : ""}`}
              style={
                filter === label && label !== "All"
                  ? { borderColor: PRIORITY_HEX[label], color: PRIORITY_HEX[label] }
                  : undefined
              }
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-frame panel">
        <MapContainer center={CHENNAI_CENTER} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
              attribution='&copy; OpenStreetMap contributors, &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_2t2q_1_e4b1014429fd98c47fe8fe21"
             />
          {visibleRoads.map((road) => (
            <CircleMarker
              key={road.road_id}
              center={[road.latitude, road.longitude]}
              radius={PRIORITY_RADIUS[road.priority_label] || 5}
              pathOptions={{
                color: PRIORITY_HEX[road.priority_label] || "#9ba4ac",
                fillColor: PRIORITY_HEX[road.priority_label] || "#9ba4ac",
                fillOpacity: 0.75,
                weight: road.funding_status === "funded" ? 2.5 : 1,
                opacity: road.funding_status === "funded" ? 1 : 0.7,
              }}
              eventHandlers={{ click: () => setSelectedRoad(road) }}
            >
              <LeafletTooltip direction="top" opacity={0.95}>
                <div className="map-marker-tip">
                  <strong>{road.road_name}</strong>
                  <span>
                    {road.priority_label} · {formatScore(road.priority_score)} · {formatCr(road.estimated_cost_cr)}
                  </span>
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="map-legend">
          {["Critical", "High", "Medium", "Low"].map((label) => (
            <div className="map-legend-item" key={label}>
              <span className="map-legend-dot" style={{ background: PRIORITY_HEX[label] }} />
              {label}
            </div>
          ))}
          <div className="map-legend-divider" />
          <div className="map-legend-item">
            <span className="map-legend-ring" />
            Funded (thicker ring)
          </div>
        </div>
      </div>

      <RoadDetailDrawer road={selectedRoad} strategy={strategy} onClose={() => setSelectedRoad(null)} />
    </div>
  );
}
