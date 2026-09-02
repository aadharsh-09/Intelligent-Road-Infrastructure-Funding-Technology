from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from algorithm import explain_road, load_roads, optimize_budget, score_roads


app = FastAPI(
    title="Road Maintenance Decision Support API",
    description="Prioritizes road maintenance and allocates limited repair funds.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OptimizeRequest(BaseModel):
    budget_cr: float = Field(default=10.0, gt=0, description="Available budget in crore rupees")
    strategy: str = Field(default="balanced", pattern="^(balanced|safety_first|flood_first|traffic_first)$")


def get_scored(strategy: str = "balanced") -> list[dict]:
    return score_roads(load_roads(), strategy)


@app.get("/")
def root() -> dict:
    return {
        "message": "Road Maintenance Decision Support API",
        "try": ["/roads", "/summary?budget_cr=10", "/docs"],
    }


@app.get("/roads")
def roads(
    strategy: str = Query(default="balanced", pattern="^(balanced|safety_first|flood_first|traffic_first)$"),
    limit: int = Query(default=100, ge=1, le=100),
) -> list[dict]:
    return get_scored(strategy)[:limit]


@app.get("/roads/{road_id}")
def road_detail(road_id: str, strategy: str = "balanced") -> dict:
    for road in get_scored(strategy):
        if road["road_id"] == road_id:
            return {**road, "explanation": explain_road(road)}
    raise HTTPException(status_code=404, detail="Road not found")


@app.post("/optimize")
def optimize(request: OptimizeRequest) -> dict:
    scored = get_scored(request.strategy)
    result = optimize_budget(scored, request.budget_cr)
    return {
        "budget_cr": result.budget_cr,
        "used_budget_cr": result.used_budget_cr,
        "remaining_budget_cr": result.remaining_budget_cr,
        "selected_count": len(result.selected_roads),
        "total_benefit": result.total_benefit,
        "selected_roads": result.selected_roads,
        "deferred_critical_roads": result.deferred_critical_roads,
    }


@app.get("/summary")
def summary(
    budget_cr: float = Query(default=10.0, gt=0),
    strategy: str = Query(default="balanced", pattern="^(balanced|safety_first|flood_first|traffic_first)$"),
) -> dict:
    scored = get_scored(strategy)
    result = optimize_budget(scored, budget_cr)
    label_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for road in scored:
        label_counts[road["priority_label"]] += 1
    future_critical = sum(1 for road in scored if road["future_label_12m"] == "Critical")
    return {
        "total_roads": len(scored),
        "priority_counts": label_counts,
        "future_critical_12m": future_critical,
        "budget_cr": budget_cr,
        "used_budget_cr": result.used_budget_cr,
        "selected_count": len(result.selected_roads),
        "deferred_critical_count": len(result.deferred_critical_roads),
        "top_roads": scored[:10],
    }