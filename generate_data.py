from __future__ import annotations

import csv
import random
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
OUTPUT_FILE = DATA_DIR / "synthetic_chennai_roads.csv"


AREAS = [
    ("T Nagar", 10, 136, 13.0418, 80.2341),
    ("Anna Nagar", 8, 102, 13.0850, 80.2101),
    ("Velachery", 13, 177, 12.9756, 80.2207),
    ("Adyar", 13, 174, 13.0067, 80.2576),
    ("Guindy", 13, 170, 13.0102, 80.2157),
    ("Mylapore", 9, 123, 13.0339, 80.2697),
    ("Tambaram", 15, 199, 12.9249, 80.1000),
    ("Thiruvanmiyur", 13, 179, 12.9855, 80.2611),
    ("Kodambakkam", 10, 132, 13.0524, 80.2255),
    ("Perambur", 6, 70, 13.1210, 80.2326),
    ("Royapuram", 5, 49, 13.1137, 80.2954),
    ("Nungambakkam", 9, 110, 13.0569, 80.2425),
]

ROAD_SUFFIXES = [
    "Main Road",
    "High Road",
    "Link Road",
    "1st Street",
    "2nd Avenue",
    "Market Road",
    "School Road",
    "Station Road",
    "Canal Bank Road",
]

ROAD_TYPES = ["interior", "bus_route", "arterial", "collector"]
PAVEMENTS = ["bituminous", "cement_concrete", "paver_block"]


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def make_road(index: int) -> dict[str, object]:
    area, zone, ward, lat, lon = random.choice(AREAS)
    road_type = random.choices(ROAD_TYPES, weights=[55, 20, 15, 10], k=1)[0]
    neglected = random.random() < 0.18
    is_bus_route = road_type in {"bus_route", "arterial"} and random.random() < 0.75
    length_km = round(random.uniform(0.35, 3.8) if road_type == "interior" else random.uniform(1.5, 7.5), 2)
    age = random.randint(10, 24) if neglected else random.randint(1, 18)
    last_repair = random.randint(7, min(age, 14)) if neglected else random.randint(0, min(age, 10))
    traffic_base = {
        "interior": random.randint(2500, 14000),
        "collector": random.randint(9000, 26000),
        "bus_route": random.randint(18000, 52000),
        "arterial": random.randint(30000, 85000),
    }[road_type]
    poor_drainage = neglected or random.random() < (0.35 if area in {"Velachery", "Royapuram", "Perambur"} else 0.22)
    waterlogging_days = random.randint(5, 30) if poor_drainage else random.randint(0, 8)
    deterioration_pressure = age * 0.12 + last_repair * 0.16 + waterlogging_days * 0.035 + (2.2 if neglected else 0)
    potholes_per_km = int(clamp(random.gauss(2 + deterioration_pressure * 2.4, 2.5), 0, 28))
    crack_percent = round(clamp(random.gauss(8 + deterioration_pressure * 8, 8), 0, 85), 1)
    surface_distress = round(clamp(random.gauss(18 + deterioration_pressure * 12, 10), 0, 100), 1)
    iri = round(clamp(random.gauss(2.5 + deterioration_pressure, 1.2), 1.2, 10.0), 1)
    drainage_score = random.randint(15, 45) if poor_drainage else random.randint(55, 95)
    heavy_vehicle_pct = round(clamp(random.gauss(8 if road_type == "interior" else 18, 6), 1, 45), 1)
    accident_count_3y = int(clamp(random.gauss(traffic_base / 15000 + potholes_per_km / 3, 2.5), 0, 22))
    complaints_90d = int(clamp(random.gauss(potholes_per_km * 2.2 + waterlogging_days * 0.6, 6), 0, 80))
    flood_vulnerability = round(clamp((100 - drainage_score) * 0.55 + waterlogging_days * 1.6 + random.uniform(-8, 8), 0, 100), 1)
    civic_importance = random.randint(20, 100)
    near_school_hospital = random.random() < 0.38
    if near_school_hospital:
        civic_importance = max(civic_importance, random.randint(65, 100))

    return {
        "road_id": f"CHN-RD-{index:03d}",
        "road_name": f"{area} {random.choice(ROAD_SUFFIXES)}",
        "area": area,
        "zone": zone,
        "ward": ward + random.choice([-1, 0, 1]),
        "latitude": round(lat + random.uniform(-0.018, 0.018), 6),
        "longitude": round(lon + random.uniform(-0.018, 0.018), 6),
        "road_type": road_type,
        "pavement_type": random.choices(PAVEMENTS, weights=[78, 17, 5], k=1)[0],
        "length_km": length_km,
        "road_age_years": age,
        "years_since_last_repair": last_repair,
        "potholes_per_km": potholes_per_km,
        "avg_pothole_severity_1_5": round(clamp(random.gauss(1.4 + potholes_per_km / 8, 0.8), 1, 5), 1),
        "crack_percent": crack_percent,
        "surface_distress_index": surface_distress,
        "roughness_iri": iri,
        "drainage_score_0_100": drainage_score,
        "waterlogging_days_per_year": waterlogging_days,
        "traffic_pcu_per_day": traffic_base,
        "heavy_vehicle_percent": heavy_vehicle_pct,
        "bus_route": int(is_bus_route),
        "near_school_hospital": int(near_school_hospital),
        "accident_count_3y": accident_count_3y,
        "complaints_90d": complaints_90d,
        "flood_vulnerability_0_100": flood_vulnerability,
        "civic_importance_0_100": civic_importance,
    }


def generate(count: int = 100) -> Path:
    random.seed(42)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    rows = [make_road(i) for i in range(1, count + 1)]
    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return OUTPUT_FILE


if __name__ == "__main__":
    path = generate()
    print(f"Generated {path}")
