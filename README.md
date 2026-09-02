# Intelligent Road Infrastructure Funding Technology (iRIFT)

An enterprise-grade, automated simulation framework designed to systematically evaluate multi-modal transport asset decay conditions, quantify complex real-time traffic stress matrices, correlate regional socio-demographic indicators, and generate predictive fiscal allocation scenarios for state, municipal, and regional infrastructure planning. 

The application architecture utilizes a decoupled design philosophy, establishing a high-performance, stateless computational backend engine tasked with rigorous multi-criteria optimization logic, interacting seamlessly with a modular web-based visualization frontend layer for dynamic parameter tuning, programmatic policy configuration overrides, and scenario-based planning.

---

## 1. System Architecture & Component Topology

The system topology enforces a strict separation of concerns among the data collection, mathematical prioritization, network serving, and presentation layers. Data flows linearly from stochastic or real telemetry collectors, passes through normalization pipelines and matrix constraints, and terminates in deterministic queues optimized for client delivery.

```text
├── data/
│   ├── raw/                    # Immutable baseline ingestion sets (CSV/Parquet formats)
│   ├── processed/              # Normalized, scaled data ready for mathematical calculation
│   └── snapshots/              # Versioned scenario runs for multi-year budget rollbacks
├── frontend/
│   ├── src/                    # Source architecture for web visualization dashboards
│   ├── public/                 # Static assets, map layers, and styling assets
│   └── package.json            # Client-side node package dependency trees
├── FRONTEND_API_CONTRACT.md    # Definitive OpenAPI-style payload exchange documentation
├── algorithm.py                # Core mathematical prioritization engine and normalization matrices
├── app.py                      # Production ASGI server running decoupled concurrency handlers
├── export_results.py           # Serialization module producing enterprise-level CSV and JSON blocks
├── generate_data.py            # Stochastic data simulation engine mapping physical wear equations
├── requirements.txt            # System dependencies pinned to production-stable builds
└── secondary_app.py            # Sandbox development deployment layer for isolated feature testing
```

### Granular Module Deep-Dives

#### Data Generation System (`generate_data.py`)
This script acts as the structural foundation of the system’s isolated validation pipelines. Instead of trivial randomized arrays, it models structural decay based on mathematical deterioration algorithms. It calculates traffic loading based on simulated industrial versus residential zoning bounds and determines emergency vehicle routing requirements by computing spatial distance calculations from infrastructure coordinates to nearby healthcare facilities.

#### Prioritization Optimization Engine (`algorithm.py`)
The functional brain of IRIFT. It acts as a stateless, standalone processing program that reads the system file paths, handles feature vector scaling, and applies linear weighting logic. It contains matrix transformation algorithms that translate disparate raw physical dimensions—such as structural indices, daily traffic counts, and accident vectors—into a single metric called the Absolute Priority Index.

#### Enterprise Application Entry Point (`app.py`)
The primary system gateway. It loads backend configurations, establishes asynchronous endpoint threads, parses incoming HTTP payloads containing user configuration overrides, and re-triggers optimization models in memory before rendering updated schemas to the connected web clients.

#### Reporting & Extraction Framework (`export_results.py`)
A highly optimized parsing utility that hooks directly into computational memory arrays. Once processing loops terminate, this module checks arrays against specified municipal budget constraints, eliminates segments that fall below funding limits, drops internal math metrics, and transforms data rows into clean, structured file schemas.

#### API Structural Contract (`FRONTEND_API_CONTRACT.md`)
The system's technical blueprint. It provides explicit schema keys, strict data type declarations, and exact null-value handling criteria. This ensures that independent updates to the backend numerical components do not conflict with the frontend visualization maps.

---

## 2. Advanced Mathematical Optimization Framework

The system utilizes Multi-Criteria Decision-Making (MCDM) methodologies to calculate priority rankings. Individual raw attributes represent distinct units of measure that cannot be directly combined. The process converts these values into dimensionless utility metrics to ensure accurate comparisons.

### The Prioritization Formula

For any given infrastructure segment $i$, the Absolute Priority Score ($APS_i$) is computed as:

$$APS_i = \sum_{j=1}^{n} (W_j \times \mathcal{N}(C_{i,j}))$$

Where:
* $W_j$ represents the assigned programmatic weight multiplier for criteria $j$, subject to the strict system balancing constraint: $\sum_{j=1}^{n} W_j = 1.0$.
* $C_{i,j}$ represents the raw telemetry measurement recorded for asset segment $i$ under evaluation factor $j$.
* $\mathcal{N}$ represents the specific normalization function used to scale input ranges down to a standard value between $0.0$ and $1.0$.

---

## 4. End-to-End Core Data Processing Pipeline

```text
[PHASE 1: INGESTION]  ──► Ingests Raw Telemetry & Geospatial Attributes (`generate_data.py`)
                                  │
                                  ▼
[PHASE 2: PROCESSING] ──► Runs Max-Min Normalization Calculations
                                  │
                                  ▼
[PHASE 3: SCORING]    ──► Multiplies Weight Matrices & Builds Priority Queues (`algorithm.py`)
                                  │
                                  ▼
[PHASE 4: EXPULSION]  ──► Strips Analytical Metadata & Serializes to Disk (`export_results.py`)
```

### Phase 1: Ingestion & Synthesis (`generate_data.py`)
The pipeline begins by loading or simulating raw physical asset vectors. The module runs calculation loops to generate consistent rows for testing:
* **Structural Pavement Degradation:** Formats values on a continuous scale mimicking standard pavement condition rules.
* **Proximity Computations:** Generates coordinate configurations mapping spatial distances between asset nodes and municipal facilities.
* **Risk/Accident Ingestion:** Compiles discrete incident logs, tracking accident frequency alongside average daily traffic volumes.

### Phase 2: Processing & Normalization (`algorithm.py`)
Raw measurements use different scales and ranges, making direct comparisons inaccurate. The system applies Max-Min scaling logic to normalize these variables:

$$\mathcal{N}(C_{i,j}) = \frac{C_{i,j} - C_{j,\min}}{C_{j,\max} - C_{j,\min}}$$

For indicators where lower numbers mean higher priority (such as a lower structural condition score requiring quicker intervention), the calculation matches an inverse scale:

$$\mathcal{N}(C_{i,j}) = \frac{C_{j,\max} - C_{i,j}}{C_{j,\max} - C_{j,\min}}$$

This ensures that regardless of the original raw measurement range, every factor translates cleanly into a uniform metric where `1.0` represents the highest possible priority for funding.

### Phase 3: Matrix Score Compilation (`algorithm.py`)
The backend multiplies the normalized metric vectors by the active strategy configuration values. It sums the results to generate an overall ranking score from `0` to `100` for each road element.

### Phase 4: Serialization & Output Export (`export_results.py`)
The sorted arrays pass to the file generation system. It removes temporary mathematical variables, filters data rows against predefined budget limits, and writes the structured records out to the `data/processed/` directory.

---

## 5. Deployment, Local Setup, & Environment Execution

### System Pre-requisites
* **Python Runtime Environment:** Pinned to Python Version 3.10 or higher to maintain type-hint compliance.
* **Core Libraries:** Requires standard numerical processing engines and lightweight routing utilities as outlined in the system requirements file.

### Installation Pipeline
1. **Clone the remote repository path:**
   ```bash
   git clone https://github.com
   cd Intelligent-Road-Infrastructure-Funding-Technology
   ```

2. **Initialize isolated execution environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the local environment context:**
   * **Linux & macOS Runtimes:**
     ```bash
     source venv/bin/activate
     ```
   * **Windows Environment (Command Prompt):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   * **Windows Environment (PowerShell Console):**
     ```powershell
     .\venv\Scripts\activate.ps1
     ```

4. **Install and upgrade environment package blocks:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

### Execution Lifecycles & Workflow Verification

To run the complete framework end-to-end locally, execute the modules in this sequence:

1. **Generate testing datasets:** Initialize fake segment maps with degradation metrics.
   ```bash
   python generate_data.py
   ```
2. **Verify mathematical prioritization profiles:** Test structural scoring formulas against local test files.
   ```bash
   python algorithm.py
   ```
3. **Launch primary server application:** Initialize backend engine and serve production endpoints.
   ```bash
   python app.py
   ```

---

## 6. Comprehensive API Contract & Data Protocols

The backend system implements standard REST design principles to manage state transformations, configuration updates, and output file extractions.

### High-Level Endpoint Summary
* `GET /api/v1/segments` — Returns all stored infrastructure records along with their base structural evaluations.
* `POST /api/v1/allocations/calculate` — Receives custom weight adjustments, recalculates priority positions, and returns updated rank lists.
* `GET /api/v1/allocations/export` — Tells the export utility to compile and download current strategy configurations.

### Sample Priority Payload (`GET /api/v1/allocations`)

```json
[
  {
    "segment_id": "GEO_SEG_7291A",
    "meta": {
      "road_name": "Main Transit Corridor B",
      "zone": "District 4",
      "length_km": 4.285,
      "functional_class": "Principal Arterial"
    },
    "metrics": {
      "raw_condition_index": 42.10,
      "average_daily_traffic": 24500,
      "accident_count_ytd": 14,
      "flood_risk_index": 8.50,
      "civic_proximity_score": 3.10
    },
    "allocation_outputs": {
      "priority_score": 89.654,
      "recommended_funding_usd": 124500.00,
      "action_required": "Full Overlay & Drainage Retrofit",
      "funding_status": "Approved - High Priority",
      "cost_benefit_ratio": 1.42
    }
  }
]
```

### Recalculation Override Payload (`POST /api/v1/allocations/calculate`)

```json
{
  "selected_strategy": "custom_policy_override",
  "runtime_parameters": {
    "ignore_segments_below_length": 0.5,
    "apply_budget_cap_usd": 5000000.00
  },
  "custom_weights": {
    "condition_weight": 0.50,
    "traffic_weight": 0.10,
    "safety_weight": 0.20,
    "drainage_weight": 0.10,
    "civic_weight": 0.10
  }
}
```

### Recalculation Response Structure (`POST /api/v1/allocations/calculate`)

```json
{
  "transaction_status": "Recalculation Complete",
  "processed_segments_count": 1420,
  "execution_time_ms": 34.22,
  "applied_strategy_profile": "custom_policy_override",
  "summary_metrics": {
    "total_allocated_funds_usd": 4895000.00,
    "unallocated_reserve_usd": 105000.00,
    "highest_priority_score": 96.42
  }
}
```


