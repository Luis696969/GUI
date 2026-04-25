# BioSim Interface GUI

## Purpose
This repository provides a browser-based configuration GUI for building BioSim-compatible JSON input files.

Current goals:
- Configure simulation metadata (`simulation` section).
- Create devices, chemicals, cells, entries, reactions, and interfaces with form validation.
- Generate, preview, copy, or download the JSON payload used by the simulator.
- Optionally send that JSON to a local backend endpoint when one is available.

> **Important:** Simulation execution itself is currently **manual/external by default**. The frontend focuses on generating valid JSON; running the simulation engine is done outside this UI unless you wire and run the optional backend.

## Current stack
- **Frontend:** Vanilla JavaScript ES modules (`type="module"`), HTML, CSS.
- **UI framework:** Bootstrap 5 (CDN).
- **Optional backend:** FastAPI (`main.py`) exposing `POST /run-simulation` for local integration.

## Project structure
Top-level files:
- `index.html` – frontend shell.
- `style.css` – app styles.
- `js/` – modular frontend implementation.
- `main.py` – optional FastAPI adapter for local simulation orchestration.

### `js/` folder tree
```text
js/
├── main.js
├── builders/
│   ├── buildCell.js
│   ├── buildChemical.js
│   ├── buildConfig.js
│   ├── buildDevice.js
│   ├── buildEntry.js
│   ├── buildInterface.js
│   ├── buildReaction.js
│   ├── buildSimulation.js
│   ├── buildUtils.js
│   ├── cell.js
│   ├── chemical.js
│   ├── device.js
│   ├── entry.js
│   ├── interface.js
│   ├── reaction.js
├── config/
│   └── constants.js
├── services/
│   └── api.js
├── templates/
│   ├── cards.js
│   ├── shared.js
├── ui/
│   ├── collapsibles.js
│   ├── counters.js
│   ├── jsonPreview.js
│   ├── results.js
│   ├── status.js
│   ├── summaries.js
│   └── warnings.js
├── utils/
│   ├── dom.js
│   ├── html.js
│   ├── parse.js
│   └── scroll.js
└── validators/
    ├── crossEntity.js
    ├── field.js
    ├── validateConfig.js
    ├── validateField.js
    ├── validateInterface.js
    └── validateReaction.js
```

## How to open the frontend
You can open the UI with any simple static server (recommended so ES modules and browser security rules behave predictably):

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node (if installed)
npx serve .
```

Then open:
- `http://127.0.0.1:8080/` (Python example), or
- the URL printed by your static server.

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

## Simulation execution status (explicit)
- The GUI is primarily a **JSON authoring tool**.
- Actual simulation execution is **not performed by the frontend itself**.
- The **"Optional: run backend simulation"** button is an integration hook and only works if a compatible backend server is running.

## Expected JSON structure
The generated payload is expected to follow this high-level shape:

```json
{
  "config": {
    "simulation": {
      "T": 650,
      "dt": 0.1,
      "run_solver": true,
      "times_to_plot": [0, 15, 30, 59, 650]
    },
    "devices": [
      {
        "id": "device_1",
        "domain": { "Lx": 0.3, "Ly": 9.75, "Nx": 20, "Ny": 500 },
        "chemicals": [],
        "cells": [],
        "entries": []
      }
    ],
    "reactions": [],
    "interfaces": [
      {
        "device1": "device_1",
        "device2": "device_2",
        "locs": {
          "device_1": { "start": [0, 0], "stop": [0, 1] },
          "device_2": { "start": [1, 0], "stop": [1, 1] }
        },
        "D_interface": {
          "oxygen": 1e-5
        }
      }
    ],
    "washouts": []
  }
}
```

### `interfaces[].locs` literal-key rule
`locs` must use **literal device-id keys** matching `device1` and `device2` exactly.

Correct pattern:
```json
"locs": {
  "<device1-id>": { "start": [x, y], "stop": [x, y] },
  "<device2-id>": { "start": [x, y], "stop": [x, y] }
}
```

So if `device1 = "biofilm_A"` and `device2 = "channel_B"`, then `locs` must be:
```json
"locs": {
  "biofilm_A": { "start": [0, 0], "stop": [0, 5] },
  "channel_B": { "start": [2, 0], "stop": [2, 5] }
}
```

## Backend integration (future / optional)
Backend execution is intentionally optional. Current recommended baseline is frontend-only JSON generation.

If/when you enable backend integration:
- Run a local FastAPI server (`main.py`) and expose `POST /run-simulation`.
- Ensure your simulation module/class wiring is configured.
- Use the frontend's optional run button as a convenience API client.

In other words: backend-run support exists as an integration path, but it is not required for day-to-day JSON authoring and should be treated as a future/optional layer.
