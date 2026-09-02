// Thin client around the FastAPI backend in app.py.
// Endpoints and response fields here are taken directly from the backend
// source (algorithm.py / app.py) - nothing here re-implements the scoring
// or budget-optimization logic, it only calls the API and passes data through.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return res.json();
}

// GET /roads?strategy=&limit=  -> list[ScoredRoad]
export function getRoads(strategy = "balanced", limit = 100) {
  const params = new URLSearchParams({ strategy, limit: String(limit) });
  return request(`/roads?${params.toString()}`);
}

// GET /roads/{road_id}?strategy=  -> ScoredRoad & { explanation: string[] }
export function getRoadDetail(roadId, strategy = "balanced") {
  const params = new URLSearchParams({ strategy });
  return request(`/roads/${encodeURIComponent(roadId)}?${params.toString()}`);
}

// POST /optimize  { budget_cr, strategy } -> OptimizeResult
export function optimizeBudget(budgetCr = 10, strategy = "balanced") {
  return request(`/optimize`, {
    method: "POST",
    body: JSON.stringify({ budget_cr: budgetCr, strategy }),
  });
}

// GET /summary?budget_cr=&strategy=  -> Summary
export function getSummary(budgetCr = 10, strategy = "balanced") {
  const params = new URLSearchParams({
    budget_cr: String(budgetCr),
    strategy,
  });
  return request(`/summary?${params.toString()}`);
}

export const STRATEGIES = [
  { value: "balanced", label: "Balanced" },
  { value: "safety_first", label: "Safety first" },
  { value: "flood_first", label: "Flood first" },
  { value: "traffic_first", label: "Traffic first" },
];
