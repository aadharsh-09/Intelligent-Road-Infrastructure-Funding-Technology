from __future__ import annotations

import csv
import json
from pathlib import Path

from algorithm import explain_road, load_roads, optimize_budget, score_roads


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"


def export_demo_outputs(budget_cr: float = 10.0, strategy: str = "balanced") -> None:
    scored = score_roads(load_roads(), strategy)
    result = optimize_budget(scored, budget_cr)

    scored_file = DATA_DIR / "scored_roads_balanced.csv"
    selected_file = DATA_DIR / "repair_plan_10cr.json"

    flattened = []
    for road in scored:
        row = {k: v for k, v in road.items() if k != "factor_scores"}
        for factor, value in road["factor_scores"].items():
            row[f"{factor}_score"] = value
        flattened.append(row)

    with scored_file.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(flattened[0].keys()))
        writer.writeheader()
        writer.writerows(flattened)

    payload = {
        "budget_cr": result.budget_cr,
        "used_budget_cr": result.used_budget_cr,
        "remaining_budget_cr": result.remaining_budget_cr,
        "selected_count": len(result.selected_roads),
        "total_benefit": result.total_benefit,
        "selected_roads": [
            {**road, "explanation": explain_road(road)}
            for road in result.selected_roads
        ],
        "deferred_critical_roads": [
            {**road, "explanation": explain_road(road)}
            for road in result.deferred_critical_roads
        ],
    }
    selected_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Exported {scored_file}")
    print(f"Exported {selected_file}")


if __name__ == "__main__":
    export_demo_outputs()
