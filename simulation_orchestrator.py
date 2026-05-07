"""Bridge module that exposes the real rd_copia SimulationOrchestrator.

The FastAPI backend in ``main.py`` dynamically imports ``simulation_orchestrator``
by default.  This file keeps that contract intact while loading the real
orchestrator from a sibling checkout of ``rd_copia``::

    parent/
    ├── GUI/
    └── rd_copia/
        └── physioRD-main/
            └── core_orchestrator.py
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


GUI_DIR = Path(__file__).resolve().parent
RD_COPIA_DIR = GUI_DIR.parent / "rd_copia"
PHYSIORD_DIR = RD_COPIA_DIR / "physioRD-main"
CORE_ORCHESTRATOR_PATH = PHYSIORD_DIR / "core_orchestrator.py"
MODULE_NAME = "rd_copia_core_orchestrator"


if not CORE_ORCHESTRATOR_PATH.is_file():
    raise ImportError(
        "Could not find rd_copia SimulationOrchestrator at "
        f"'{CORE_ORCHESTRATOR_PATH}'. Clone rd_copia as a sibling directory of GUI "
        "or set SIMULATION_MODULE/SIMULATION_CLASS to another implementation."
    )

# core_orchestrator.py and its sibling modules are not in an importable Python
# package because the directory name contains a hyphen.  Add physioRD-main to
# sys.path before executing the module so imports inside rd_copia keep working.
physiord_path = str(PHYSIORD_DIR)
if physiord_path not in sys.path:
    sys.path.insert(0, physiord_path)

spec = importlib.util.spec_from_file_location(MODULE_NAME, CORE_ORCHESTRATOR_PATH)
if spec is None or spec.loader is None:
    raise ImportError(f"Could not load import spec for '{CORE_ORCHESTRATOR_PATH}'.")

module = importlib.util.module_from_spec(spec)
sys.modules[MODULE_NAME] = module
spec.loader.exec_module(module)

try:
    SimulationOrchestrator = module.SimulationOrchestrator
except AttributeError as exc:
    raise ImportError(
        f"'{CORE_ORCHESTRATOR_PATH}' does not expose SimulationOrchestrator."
    ) from exc


__all__ = ["SimulationOrchestrator"]
