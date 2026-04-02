import importlib
import json
import os
import uuid
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).resolve().parent
RUNS_DIR = BASE_DIR / "runs"
RUNS_DIR.mkdir(exist_ok=True)

# Ajusta estas variables de entorno a tu módulo/clase reales.
SIMULATION_MODULE = os.getenv("SIMULATION_MODULE", "simulation_orchestrator")
SIMULATION_CLASS = os.getenv("SIMULATION_CLASS", "SimulationOrchestrator")

app = FastAPI(title="BioSim Local Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/runs", StaticFiles(directory=RUNS_DIR), name="runs")


def get_simulation_class():
    try:
        module = importlib.import_module(SIMULATION_MODULE)
    except Exception as exc:
        raise RuntimeError(
            f"No se pudo importar el módulo '{SIMULATION_MODULE}'. "
            "Configura la variable de entorno SIMULATION_MODULE con el módulo correcto."
        ) from exc

    try:
        return getattr(module, SIMULATION_CLASS)
    except AttributeError as exc:
        raise RuntimeError(
            f"El módulo '{SIMULATION_MODULE}' no contiene la clase '{SIMULATION_CLASS}'. "
            "Configura SIMULATION_CLASS con el nombre correcto."
        ) from exc


def ensure_plot_config(config: dict[str, Any], run_dir: Path) -> dict[str, Any]:
    config = dict(config)
    plot_profiles = dict(config.get("plot_profiles", {}))
    plot_profiles["live_plot"] = False
    plot_profiles.setdefault("plot_path", str(run_dir / "profiles.png"))
    config["plot_profiles"] = plot_profiles
    config.setdefault("interfaces", [])
    config.setdefault("washouts", [])
    return config


def to_jsonable(obj: Any) -> Any:
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if isinstance(obj, dict):
        return {str(k): to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [to_jsonable(item) for item in obj]
    return str(obj)


@app.get("/health")
def healthcheck():
    return {"ok": True}


@app.post("/run-simulation")
def run_simulation(data: dict[str, Any]):
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="El cuerpo debe ser un JSON objeto.")

    run_id = uuid.uuid4().hex[:12]
    run_dir = RUNS_DIR / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    config = ensure_plot_config(data, run_dir)
    config_path = run_dir / "config.json"
    config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")

    try:
        SimulationOrchestrator = get_simulation_class()
        sim = SimulationOrchestrator(config_path=str(config_path))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    images = [f"/runs/{run_id}/{file.name}" for file in sorted(run_dir.glob("*.png"))]

    response = {
        "ok": True,
        "message": "Simulación ejecutada correctamente.",
        "run_id": run_id,
        "config_path": str(config_path),
        "devices": list(getattr(sim, "devices", {}).keys()) if hasattr(sim, "devices") else [],
        "times_to_plot": to_jsonable(getattr(sim, "times_to_plot", [])),
        "results": to_jsonable(getattr(sim, "results", None)),
        "images": images,
        "n_reactions": len(getattr(sim, "reactions", [])) if hasattr(sim, "reactions") else 0,
        "n_interfaces": len(getattr(sim, "interfaces", [])) if hasattr(sim, "interfaces") else 0,
    }

    return response
