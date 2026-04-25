# BioSim Interface GUI

## Purpose
This repository provides a browser-based configuration GUI for building BioSim-compatible JSON input files.

Current goals:
- Configure simulation metadata (`simulation` section).
- Create devices, chemicals, cells, entries, reactions, and interfaces with validation.
- Generate, preview, copy, or download the JSON payload used by the simulator.
- Optionally send that JSON to a local backend endpoint when one is available.

> **Important:** Simulation execution itself is **manual/external by default**. The frontend focuses on generating valid JSON; running the simulation engine is done outside this UI unless you wire and run the optional backend.

## Stack
- **Frontend:** React + Vite + TypeScript
- **Validation / contracts:** Zod
- **Testing:** Vitest
- **Optional backend:** FastAPI (`main.py`) exposing `POST /run-simulation` for local integration

## Project structure
Top-level files/folders:
- `frontend/` – React/Vite TypeScript application.
- `main.py` – optional FastAPI adapter for local simulation orchestration.
- Legacy vanilla prototype files (`index.html`, `style.css`, `js/`) are still present during migration.

## Frontend setup and scripts
From the repository root:

```bash
cd frontend && npm install
```

Then use:

```bash
npm run dev
npm run build
npm test
```

## JSON workflow (generate / copy / download)
In the **Run** section of the UI:

1. Click **Generate JSON preview**
   - Validates form inputs and builds the payload.
   - Displays the JSON in the preview panel.
2. Click **Copy JSON**
   - Regenerates/validates JSON and copies it to clipboard.
3. Click **Download JSON**
   - Regenerates/validates JSON and downloads `biosim-config.json`.

Typical use today:
- Build config in UI.
- Download or copy JSON.
- Run your simulator externally (script, notebook, CLI, or another service).

## JSON contract (required root-level shape)
Generated JSON must include the following required root-level keys:
- `simulation` (object)
- `devices` (array)
- `interfaces` (array)
- `reactions` (array)
- `washouts` (array; default `[]` when unused)

Reference shape:

```json
{
  "simulation": {
    "T": 650,
    "dt": 0.1,
    "run_solver": true,
    "times_to_plot": [0, 15, 30, 59, 650]
  },
  "devices": [
    {
      "id": "dev_1",
      "domain": { "Lx": 0.3, "Ly": 9.75, "Nx": 20, "Ny": 500 },
      "chemicals": [],
      "cells": [],
      "entries": []
    }
  ],
  "interfaces": [
    {
      "device1": "dev_1",
      "device2": "dev_2",
      "locs": {
        "device1": { "start": [0, 0], "stop": [0, 1] },
        "device2": { "start": [1, 0], "stop": [1, 1] }
      },
      "D_interface": {
        "oxygen": 1e-5
      }
    }
  ],
  "reactions": [],
  "washouts": []
}
```

### `interfaces[].locs` literal-key rule
`locs` must use the **literal keys** `device1` and `device2` (not dynamic device-id keys).

## Backend run status (optional)
Backend execution is intentionally optional. Current recommended baseline is frontend-only JSON generation.

- The GUI is primarily a **JSON authoring tool**.
- Actual simulation execution is **not performed by the frontend itself**.
- The **"Optional: run backend simulation"** button is an integration hook and only works if a compatible backend server is running.

## Migration note (legacy vanilla implementation)
Legacy vanilla files are currently **kept temporarily** while parity with the React/TypeScript frontend is validated:
- `index.html`
- `style.css`
- `js/`

Plan:
1. Keep these files available during parity checks and fallback verification.
2. Remove them after feature parity is confirmed and the React/Vite app is the sole supported frontend.
