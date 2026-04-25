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
- **Frontend stack:** React + Vite + TypeScript + Zod
- **Testing:** Vitest
- **Optional backend:** FastAPI (`main.py`) exposing `POST /run-simulation` for local integration

## Project structure
Top-level files/folders:
- `frontend/` – React/Vite TypeScript application.
- `main.py` – optional FastAPI adapter for local simulation orchestration.
- Legacy vanilla prototype files (`index.html`, `style.css`, `js/`) are still present during migration.

## Install
From the repository root:

```bash
cd frontend && npm install
```

## Run / build / test
From `frontend/`:

```bash
npm run dev
npm run build
npm test
```

These frontend commands are expected and supported as written:
- `npm run dev`
- `npm run build`
- `npm test`

## JSON workflow (refresh / validate / copy / download)
In the **Run** section of the UI:

1. Click **Generate JSON preview** (refresh)
   - Rebuilds the payload from current form state.
   - Refreshes the preview panel with the latest JSON.
2. Validation occurs during generate/copy/download actions
   - The app validates form inputs before exporting JSON.
   - Invalid state is surfaced in the UI and blocks export actions.
3. Click **Copy JSON**
   - Regenerates + validates JSON, then copies to clipboard.
4. Click **Download JSON**
   - Regenerates + validates JSON, then downloads `biosim-config.json`.

Typical use today:
- Build config in UI.
- Refresh preview as you edit.
- Copy or download validated JSON.
- Run your simulator externally (script, notebook, CLI, or another service).

## Examples usage
Use examples to quickly populate the editor and inspect expected structures.

How to load an example:
1. Open the example selector in the UI.
2. Choose an example preset.
3. Click **Generate JSON preview** to refresh and validate the loaded state.
4. Review the generated JSON, then copy/download as needed.

What examples demonstrate:
- Baseline simulation metadata shape (`simulation` fields and plotting times).
- Device/domain setup patterns (`devices`, chemicals, cells, entries).
- Root-level reaction payload format (`reactions` at root).
- Interface linking format (`interfaces` with literal `locs.device1` / `locs.device2` keys).
- End-to-end export flow from loaded example to copy/download output.

## JSON contract (required root-level shape)
Generated JSON must include the following required root-level keys:
- `simulation` (object)
- `devices` (array)
- `interfaces` (array)
- `reactions` (array)
- `washouts` (array; default `[]` when unused)

The exported contract is guarded by Vitest contract tests and must keep this shape:
- Root-level path `simulation/devices/interfaces/reactions/washouts`
- `interfaces[].locs` with literal keys `device1` and `device2`
- **No** top-level `config` key

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

## Backend status: explicit optional
Backend execution is intentionally optional. Current recommended baseline is frontend-only JSON generation.

- The GUI is primarily a **JSON authoring tool**.
- Actual simulation execution is **not performed by the frontend itself**.
- The **"Optional: run backend simulation"** button is an integration hook and only works if a compatible backend server is running.
- JSON **copy** and **download** workflows remain fully usable independently, even when backend execution is not used.

## Known limitations
- Frontend does not run simulation kernels directly.
- Backend integration assumes a compatible local service and is not auto-provisioned.
- Validation is focused on JSON schema/contract conformance and UI field-level checks.
- Legacy vanilla files are still present during migration and may not reflect the latest React UI behavior.

## Non-goals
- Replacing external simulation orchestration pipelines.
- Providing cluster scheduling, remote job management, or result post-processing.
- Supporting alternative JSON contracts that wrap payloads in a top-level `config` object.
- Emitting interface location maps keyed by arbitrary device IDs (must remain literal `device1` / `device2`).

## Migration note (legacy vanilla implementation)
Legacy vanilla files are currently **kept temporarily** while parity with the React/TypeScript frontend is validated:
- `index.html`
- `style.css`
- `js/`

Plan:
1. Keep these files available during parity checks and fallback verification.
2. Remove them after feature parity is confirmed and the React/Vite app is the sole supported frontend.
