import { useCallback, useEffect, useState } from "react";
import { getRoads, getSummary, optimizeBudget } from "../api/client";

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

// Combines /roads, /summary and /optimize into one dataset the UI can use.
// Funding status is derived purely from which road_ids the backend put in
// optimize.selected_roads / optimize.deferred_critical_roads - no scoring
// logic is reproduced on the frontend.
export function useRoadData(strategy, budgetCr) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    roads: [],
    summary: null,
    optimize: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [roads, summary, optimize] = await Promise.all([
        getRoads(strategy, 100),
        getSummary(budgetCr, strategy),
        optimizeBudget(budgetCr, strategy),
      ]);

      const selectedIds = new Set(optimize.selected_roads.map((r) => r.road_id));
      const deferredIds = new Set(
        optimize.deferred_critical_roads.map((r) => r.road_id)
      );

      const enriched = roads
        .map((road) => ({
          ...road,
          funding_status: selectedIds.has(road.road_id)
            ? "funded"
            : deferredIds.has(road.road_id)
            ? "deferred"
            : "unfunded",
        }))
        .sort(
          (a, b) =>
            PRIORITY_ORDER[a.priority_label] - PRIORITY_ORDER[b.priority_label] ||
            b.priority_score - a.priority_score
        );

      setState({
        loading: false,
        error: null,
        roads: enriched,
        summary,
        optimize,
      });
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message || String(err) }));
    }
  }, [strategy, budgetCr]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
