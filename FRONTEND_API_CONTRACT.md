# Frontend API Contract

Run the backend from the repository root:

```bash
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Default backend URL:

```text
http://127.0.0.1:8000
```

## Health Check

Use this first to confirm the backend is alive:

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Summary Cards and Charts

Use this for dashboard cards and Recharts summary visuals:

```text
GET /summary?budget_cr=10&strategy=balanced
```

Important response fields:

- `total_roads`
- `priority_counts`
- `future_critical_12m`
- `budget_cr`
- `used_budget_cr`
- `selected_count`
- `deferred_critical_count`
- `top_roads`

Good frontend uses:

- KPI cards: total roads, critical roads, selected roads, budget used.
- Recharts pie/bar chart: `priority_counts`.
- Top-priority table: `top_roads`.

## Road Map and Road Table

Use this for Leaflet markers and the full road table:

```text
GET /roads?strategy=balanced&limit=100
```

Important road fields:

- `road_id`
- `road_name`
- `area`
- `zone`
- `ward`
- `latitude`
- `longitude`
- `priority_score`
- `priority_label`
- `recommended_action`
- `estimated_cost_cr`
- `factor_scores`
- `future_score_12m`
- `future_label_12m`

Leaflet color mapping:

```text
Critical -> red
High -> orange
Medium -> yellow
Low -> green
```

Recharts factor chart fields:

```text
factor_scores.condition
factor_scores.usage
factor_scores.safety
factor_scores.drainage
factor_scores.civic
```

## Road Detail Popup

Use this when a user clicks a table row or map marker:

```text
GET /roads/CHN-RD-011?strategy=balanced
```

This includes an `explanation` array that can be shown in a details panel.

## What-If Budget Optimization

Use this when the user changes the budget slider/input:

```text
POST /optimize
```

Request body:

```json
{
  "budget_cr": 10,
  "strategy": "balanced"
}
```

Supported strategies:

```text
balanced
safety_first
flood_first
traffic_first
```

Important response fields:

- `selected_roads`
- `deferred_critical_roads`
- `used_budget_cr`
- `remaining_budget_cr`
- `selected_count`
- `total_benefit`

Use `selected_roads` for the funded repair plan and `deferred_critical_roads` to show urgent roads that could not be funded.

## Recommended First Frontend Layout

Build one dashboard page:

- Top bar: title, budget input/slider, strategy selector.
- KPI row: total roads, critical roads, selected roads, budget used.
- Main left: Leaflet map with colored road markers.
- Main right: selected road detail panel with factor score bars.
- Bottom: repair plan table from `/optimize`.

This is enough for a strong hackathon demo.
