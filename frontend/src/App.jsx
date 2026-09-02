import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MapPage from "./pages/MapPage.jsx";
import RoadsPage from "./pages/RoadsPage.jsx";
import DataPage from "./pages/DataPage.jsx";
import { useRoadData } from "./hooks/useRoadData.js";
import { titleCase } from "./utils/priority.js";

const SECTION_TITLES = {
  dashboard: "Dashboard",
  map: "Road Map",
  roads: "Roads",
  data: "Dataset",
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [strategy, setStrategy] = useState("balanced");
  const [budget, setBudget] = useState(10);

  const data = useRoadData(strategy, budget);

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={setActive}
        strategy={strategy}
        onStrategyChange={setStrategy}
        budget={budget}
        onBudgetChange={setBudget}
      />
      <main className="app-content">
        <header className="app-topbar">
          <div>
            <h1 className="app-topbar-title">{SECTION_TITLES[active]}</h1>
            <p className="app-topbar-sub">
              {titleCase(strategy)} strategy · ₹{budget} Cr budget
            </p>
          </div>
          {data.error && <div className="app-error-pill">API error: {data.error}</div>}
        </header>

        <div className="app-content-body">
          {active === "dashboard" && <Dashboard data={data} strategy={strategy} />}
          {active === "map" && <MapPage data={data} strategy={strategy} />}
          {active === "roads" && <RoadsPage data={data} strategy={strategy} />}
          {active === "data" && <DataPage data={data} strategy={strategy} />}
        </div>
      </main>
    </div>
  );
}
