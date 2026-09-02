from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from algorithm import explain_road, load_roads, optimize_budget, score_roads


class Handler(BaseHTTPRequestHandler):
    def send_json(self, payload: object, status: int = 200) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(encoded)
        self.close_connection = True

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        strategy = params.get("strategy", ["balanced"])[0]
        budget = float(params.get("budget_cr", ["10"])[0])
        scored = score_roads(load_roads(), strategy)

        if parsed.path == "/":
            self.send_json({"message": "Road Maintenance API", "routes": ["/roads", "/summary?budget_cr=10"]})
        elif parsed.path == "/roads":
            limit = int(params.get("limit", ["100"])[0])
            self.send_json(scored[:limit])
        elif parsed.path.startswith("/roads/"):
            road_id = parsed.path.split("/")[-1]
            road = next((item for item in scored if item["road_id"] == road_id), None)
            if road is None:
                self.send_json({"detail": "Road not found"}, 404)
            else:
                self.send_json({**road, "explanation": explain_road(road)})
        elif parsed.path == "/summary":
            result = optimize_budget(scored, budget)
            counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
            for road in scored:
                counts[road["priority_label"]] += 1
            self.send_json(
                {
                    "total_roads": len(scored),
                    "priority_counts": counts,
                    "future_critical_12m": sum(1 for road in scored if road["future_label_12m"] == "Critical"),
                    "budget_cr": budget,
                    "used_budget_cr": result.used_budget_cr,
                    "selected_count": len(result.selected_roads),
                    "top_roads": scored[:10],
                }
            )
        else:
            self.send_json({"detail": "Not found"}, 404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/optimize":
            self.send_json({"detail": "Not found"}, 404)
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8") if length else "{}"
        payload = json.loads(body or "{}")
        budget = float(payload.get("budget_cr", 10))
        strategy = payload.get("strategy", "balanced")
        scored = score_roads(load_roads(), strategy)
        result = optimize_budget(scored, budget)
        self.send_json(
            {
                "budget_cr": result.budget_cr,
                "used_budget_cr": result.used_budget_cr,
                "remaining_budget_cr": result.remaining_budget_cr,
                "selected_count": len(result.selected_roads),
                "total_benefit": result.total_benefit,
                "selected_roads": result.selected_roads,
                "deferred_critical_roads": result.deferred_critical_roads,
            }
        )


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("Serving on http://127.0.0.1:8000")
    server.serve_forever()
