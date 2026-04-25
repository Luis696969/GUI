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
│   └── buildUtils.js
├── config/
│   └── constants.js
├── services/
│   └── api.js
├── templates/
│   ├── cards.js
│   └── shared.js
├── ui/
│   ├── collapsibles.js
│   ├── counters.js
│   ├── interfaceCards.js
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

## Verification checklist
Use this checklist after changes to confirm core authoring behavior and JSON contract consistency.

1. **Static server launch**
   - **Action:** Start a local static server (for example `python -m http.server 8080`) and open `http://127.0.0.1:8080/`.
   - **Expected outcome:** App loads successfully, forms render, and there are no blank sections or fatal load failures.
   - **Inspect:** Browser UI (main page and all major cards/sections).

2. **No module import errors in browser console**
   - **Action:** Open browser DevTools Console immediately after page load and after clicking **Generate JSON preview** once.
   - **Expected outcome:** No `Failed to load module script`, `Cannot use import statement outside a module`, or unresolved import/path errors.
   - **Inspect:** Browser DevTools Console.

3. **Add/remove device**
   - **Action:** Add at least one device card, fill required fields, then remove a device card.
   - **Expected outcome:** Device counters and card indices update cleanly; removed device no longer appears in summaries or generated JSON.
   - **Inspect:** Devices UI panel and JSON preview panel.

4. **Add/remove nested cards (chemical / cell / entry / reaction)**
   - **Action:** Within a device, add/remove chemical, cell, entry, and reaction cards. In the generated JSON, reactions must be exported at root level, not nested under devices.
   - **Expected outcome:** Nested counters and collapsible labels stay consistent; deleted nested objects are absent from preview/download output.
   - **Inspect:** Device sub-panels, Reactions UI panel, and JSON preview panel.

5. **Add/remove interface**
   - **Action:** Add an interface between two devices, then remove it.
   - **Expected outcome:** Interface list updates without stale references; JSON reflects current interfaces only.
   - **Inspect:** Interfaces UI panel and JSON preview panel.

6. **JSON preview / copy / download behavior**
   - **Action:** Run **Generate JSON preview**, **Copy JSON**, and **Download JSON** on a valid configuration.
   - **Expected outcome:** Preview updates with current payload; copy places current payload on clipboard; download saves `biosim-config.json` containing the same payload.
   - **Inspect:** JSON preview panel, clipboard paste target (temporary text editor), and downloaded file contents.

7. **Contract spot-check**
   - **Action:** Validate generated JSON shape in preview and downloaded file.
   - **Expected outcome:** 
     - `reactions` exists at the **root level** (not nested under devices).
     - `washouts` exists at the **root level** and defaults to `[]` when unused.
     - Each interface uses `locs.device1` and `locs.device2` as literal keys.
   - **Inspect:** JSON preview panel and downloaded `biosim-config.json`.

## Simulation execution status (explicit)
- The GUI is primarily a **JSON authoring tool**.
- Actual simulation execution is **not performed by the frontend itself**.
- The **"Optional: run backend simulation"** button is an integration hook and only works if a compatible backend server is running.

## Expected JSON structure
The generated payload is expected to follow this high-level shape:

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

Required pattern:
```json
"locs": {
  "device1": { "start": [x, y], "stop": [x, y] },
  "device2": { "start": [x, y], "stop": [x, y] }
}
```

`device1` and `device2` fields still store the actual selected device IDs (for example, `dev_1` and `dev_2`). A matching interface object looks like:
```json
{
  "device1": "dev_1",
  "device2": "dev_2",
  "locs": {
    "device1": { "start": [0, 0], "stop": [0, 5] },
    "device2": { "start": [2, 0], "stop": [2, 5] }
  },
  "D_interface": {
    "oxygen": 1e-5
  }
}
```

## Backend integration (future / optional)
Backend execution is intentionally optional. Current recommended baseline is frontend-only JSON generation.

If/when you enable backend integration:
- Run a local FastAPI server (`main.py`) and expose `POST /run-simulation`.
- Ensure your simulation module/class wiring is configured.
- Use the frontend's optional run button as a convenience API client.

In other words: backend-run support exists as an integration path, but it is not required for day-to-day JSON authoring and should be treated as a future/optional layer.
