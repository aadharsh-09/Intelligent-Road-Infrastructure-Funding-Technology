from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "synthetic_chennai_roads.csv"


def clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def norm(value: float, worst: float, best: float = 0.0) -> float:
    if worst == best:
        return 0.0
    return clamp((value - best) / (worst - best) * 100)


def load_roads(path: Path = DATA_FILE) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return [coerce_types(row) for row in rows]


def coerce_types(row: dict[str, str]) -> dict[str, Any]:
    ints = {
        "zone",
        "ward",
        "road_age_years",
        "years_since_last_repair",
        "potholes_per_km",
        "traffic_pcu_per_day",
        "bus_route",
        "near_school_hospital",
        "accident_count_3y",
        "complaints_90d",
    }
    floats = {
        "latitude",
        "longitude",
        "length_km",
        "avg_pothole_severity_1_5",
        "crack_percent",
        "surface_distress_index",
        "roughness_iri",
        "drainage_score_0_100",
        "waterlogging_days_per_year",
        "heavy_vehicle_percent",
        "flood_vulnerability_0_100",
        "civic_importance_0_100",
    }
    typed: dict[str, Any] = {}
    for key, value in row.items():
        if key in ints:
            typed[key] = int(float(value))
        elif key in floats:
            typed[key] = float(value)
        else:
            typed[key] = value
    return typed


def condition_score(road: dict[str, Any]) -> float:
    pothole_component = 0.35 * norm(road["potholes_per_km"], 25)
    severity_component = 0.20 * norm(road["avg_pothole_severity_1_5"], 5, 1)
    cracks_component = 0.18 * norm(road["crack_percent"], 80)
    distress_component = 0.17 * road["surface_distress_index"]
    age_component = 0.10 * norm(road["years_since_last_repair"], 10)
    return clamp(pothole_component + severity_component + cracks_component + distress_component + age_component)


def usage_score(road: dict[str, Any]) -> float:
    traffic = norm(road["traffic_pcu_per_day"], 85000)
    heavy = norm(road["heavy_vehicle_percent"], 45)
    bus_bonus = 100 if road["bus_route"] else 0
    road_type_bonus = {"interior": 30, "collector": 55, "bus_route": 75, "arterial": 100}[road["road_type"]]
    return clamp(0.52 * traffic + 0.18 * heavy + 0.18 * bus_bonus + 0.12 * road_type_bonus)


def safety_score(road: dict[str, Any]) -> float:
    accidents = norm(road["accident_count_3y"], 20)
    complaints = norm(road["complaints_90d"], 70)
    roughness = norm(road["roughness_iri"], 10, 1)
    return clamp(0.45 * accidents + 0.25 * complaints + 0.30 * roughness)


def drainage_score(road: dict[str, Any]) -> float:
    poor_drainage = 100 - road["drainage_score_0_100"]
    waterlogging = norm(road["waterlogging_days_per_year"], 30)
    flood = road["flood_vulnerability_0_100"]
    return clamp(0.35 * poor_drainage + 0.35 * waterlogging + 0.30 * flood)


def civic_score(road: dict[str, Any]) -> float:
    school_hospital = 100 if road["near_school_hospital"] else 0
    return clamp(0.75 * road["civic_importance_0_100"] + 0.25 * school_hospital)


def priority_score(road: dict[str, Any], strategy: str = "balanced") -> tuple[float, dict[str, float]]:
    factors = {
        "condition": condition_score(road),
        "usage": usage_score(road),
        "safety": safety_score(road),
        "drainage": drainage_score(road),
        "civic": civic_score(road),
    }
    weights_by_strategy = {
        "balanced": {"condition": 0.40, "usage": 0.20, "safety": 0.20, "drainage": 0.10, "civic": 0.10},
        "safety_first": {"condition": 0.30, "usage": 0.15, "safety": 0.35, "drainage": 0.10, "civic": 0.10},
        "flood_first": {"condition": 0.30, "usage": 0.15, "safety": 0.15, "drainage": 0.30, "civic": 0.10},
        "traffic_first": {"condition": 0.30, "usage": 0.35, "safety": 0.15, "drainage": 0.10, "civic": 0.10},
    }
    weights = weights_by_strategy.get(strategy, weights_by_strategy["balanced"])
    score = sum(factors[name] * weight for name, weight in weights.items())
    return round(clamp(score), 2), {k: round(v, 2) for k, v in factors.items()}


def recommend_action(road: dict[str, Any], score: float, factors: dict[str, float]) -> tuple[str, float, float, str]:
    length = road["length_km"]
    if score >= 78 or (factors["condition"] >= 75 and road["roughness_iri"] >= 7.5):
        action = "reconstruction"
        cost_cr_per_km = 1.50
        impact_multiplier = 1.35
        reason = "severe structural damage and high urgency"
    elif factors["condition"] >= 60 or road["crack_percent"] >= 45:
        action = "resurfacing"
        cost_cr_per_km = 0.60
        impact_multiplier = 1.10
        reason = "surface deterioration is beyond minor patching"
    elif factors["drainage"] >= 65 and road["waterlogging_days_per_year"] >= 12:
        action = "drainage repair"
        cost_cr_per_km = 0.35
        impact_multiplier = 0.95
        reason = "waterlogging is likely accelerating road failure"
    elif road["potholes_per_km"] >= 6:
        action = "pothole patching"
        cost_cr_per_km = 0.18
        impact_multiplier = 0.72
        reason = "localized pothole damage can be repaired quickly"
    else:
        action = "preventive maintenance"
        cost_cr_per_km = 0.12
        impact_multiplier = 0.55
        reason = "road is not critical yet, but early treatment prevents decline"
    return action, round(length * cost_cr_per_km, 2), impact_multiplier, reason


def priority_label(score: float) -> str:
    if score >= 68:
        return "Critical"
    if score >= 55:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"


def predict_12_month_score(road: dict[str, Any], current_score: float) -> float:
    ageing = 2.2
    drainage_penalty = norm(road["waterlogging_days_per_year"], 30) * 0.045
    traffic_penalty = norm(road["traffic_pcu_per_day"], 85000) * 0.035
    condition_penalty = condition_score(road) * 0.03
    return round(clamp(current_score + ageing + drainage_penalty + traffic_penalty + condition_penalty), 2)


def score_roads(roads: list[dict[str, Any]], strategy: str = "balanced") -> list[dict[str, Any]]:
    scored = []
    for road in roads:
        score, factors = priority_score(road, strategy)
        action, cost, impact_multiplier, reason = recommend_action(road, score, factors)
        future_score = predict_12_month_score(road, score)
        scored.append(
            {
                **road,
                "priority_score": score,
                "priority_label": priority_label(score),
                "factor_scores": factors,
                "recommended_action": action,
                "estimated_cost_cr": cost,
                "recommendation_reason": reason,
                "future_score_12m": future_score,
                "future_label_12m": priority_label(future_score),
                "optimization_benefit": round((score * score / 50) * road["length_km"] * impact_multiplier, 2),
            }
        )
    return sorted(scored, key=lambda item: item["priority_score"], reverse=True)


@dataclass
class OptimizationResult:
    budget_cr: float
    used_budget_cr: float
    remaining_budget_cr: float
    selected_roads: list[dict[str, Any]]
    deferred_critical_roads: list[dict[str, Any]]
    total_benefit: float


def optimize_budget(scored_roads: list[dict[str, Any]], budget_cr: float) -> OptimizationResult:
    scale = 100
    capacity = int(round(budget_cr * scale))
    items = []
    for road in scored_roads:
        cost_units = max(1, int(round(road["estimated_cost_cr"] * scale)))
        benefit_units = int(round(road["optimization_benefit"] * 100))
        items.append((cost_units, benefit_units, road))

    dp = [0] * (capacity + 1)
    keep: list[list[int]] = [[] for _ in range(capacity + 1)]
    for index, (cost, benefit, _) in enumerate(items):
        for current_budget in range(capacity, cost - 1, -1):
            candidate = dp[current_budget - cost] + benefit
            if candidate > dp[current_budget]:
                dp[current_budget] = candidate
                keep[current_budget] = keep[current_budget - cost] + [index]

    selected_indexes = set(keep[capacity])
    selected = [items[i][2] for i in keep[capacity]]
    selected = sorted(selected, key=lambda road: road["priority_score"], reverse=True)
    used = round(sum(road["estimated_cost_cr"] for road in selected), 2)
    deferred = [
        road
        for i, (_, _, road) in enumerate(items)
        if i not in selected_indexes and road["priority_label"] in {"Critical", "High"}
    ]
    return OptimizationResult(
        budget_cr=budget_cr,
        used_budget_cr=used,
        remaining_budget_cr=round(budget_cr - used, 2),
        selected_roads=selected,
        deferred_critical_roads=deferred[:10],
        total_benefit=round(sum(road["optimization_benefit"] for road in selected), 2),
    )


def explain_road(road: dict[str, Any]) -> list[str]:
    factors = road["factor_scores"]
    sorted_factors = sorted(factors.items(), key=lambda pair: pair[1], reverse=True)[:3]
    reasons = [f"{name} risk is {score:.1f}/100" for name, score in sorted_factors]
    reasons.append(f"recommended action: {road['recommended_action']} because {road['recommendation_reason']}")
    return reasons


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--budget-cr", type=float, default=10.0)
    parser.add_argument("--strategy", default="balanced", choices=["balanced", "safety_first", "flood_first", "traffic_first"])
    args = parser.parse_args()

    roads = score_roads(load_roads(), args.strategy)
    result = optimize_budget(roads, args.budget_cr)
    print(f"Budget: Rs {args.budget_cr:.2f} Cr")
    print(f"Selected roads: {len(result.selected_roads)}")
    print(f"Used budget: Rs {result.used_budget_cr:.2f} Cr")
    print(f"Total benefit: {result.total_benefit:.2f}")
    print("\nTop selected roads:")
    for road in result.selected_roads[:12]:
        print(
            f"- {road['road_id']} | {road['road_name']} | score {road['priority_score']} "
            f"| {road['recommended_action']} | Rs {road['estimated_cost_cr']} Cr"
        )


if __name__ == "__main__":
    main()
