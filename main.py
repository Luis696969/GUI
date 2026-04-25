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

SIMULATION_MODULE = os.getenv("SIMULATION_MODULE", "simulation_orchestrator")
SIMULATION_CLASS = os.getenv("SIMULATION_CLASS", "SimulationOrchestrator")

ALLOWED_INITIAL_PROFILES = {"uniform", "zero", "chamber"}
ALLOWED_CELL_SHAPES = {"ellipse", "circle", "rectangle", "limacon", "ying", "yang"}
ALLOWED_REACTION_TYPES = {"cell_consumption_waste", "sink", "cells_killing_cells"}

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
            f"Could not import module '{SIMULATION_MODULE}'. "
            "Set the SIMULATION_MODULE environment variable to the correct module."
        ) from exc

    try:
        return getattr(module, SIMULATION_CLASS)
    except AttributeError as exc:
        raise RuntimeError(
            f"Module '{SIMULATION_MODULE}' does not contain class '{SIMULATION_CLASS}'. "
            "Set SIMULATION_CLASS to the correct class name."
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

    if isinstance(obj, np.integer):
        return int(obj)

    if isinstance(obj, np.floating):
        return float(obj)

    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj

    if isinstance(obj, dict):
        return {str(key): to_jsonable(value) for key, value in obj.items()}

    if isinstance(obj, (list, tuple, set)):
        return [to_jsonable(item) for item in obj]

    return str(obj)


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object.")
    return value


def require_list(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        raise ValueError(f"{label} must be a list.")
    return value


def require_number(value: Any, label: str, *, minimum: float | None = None, strictly_positive: bool = False) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"{label} must be a number.")

    value = float(value)

    if strictly_positive and value <= 0:
        raise ValueError(f"{label} must be > 0.")

    if minimum is not None and value < minimum:
        raise ValueError(f"{label} must be >= {minimum}.")

    return value


def require_int(value: Any, label: str, *, minimum: int | None = None) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValueError(f"{label} must be an integer.")

    if minimum is not None and value < minimum:
        raise ValueError(f"{label} must be >= {minimum}.")

    return value


def require_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{label} must be a non-empty string.")

    return value.strip()


def validate_config(config: dict[str, Any]) -> list[str]:
    warnings: list[str] = []

    simulation = require_object(config.get("simulation"), "simulation")
    T = require_number(simulation.get("T"), "simulation.T", strictly_positive=True)
    dt = require_number(simulation.get("dt"), "simulation.dt", strictly_positive=True)

    if dt > T:
        raise ValueError("simulation.dt must be lower than or equal to simulation.T.")

    if "run_solver" in simulation and not isinstance(simulation["run_solver"], bool):
        raise ValueError("simulation.run_solver must be a boolean.")

    times_to_plot = simulation.get("times_to_plot", [])
    times_to_plot = require_list(times_to_plot, "simulation.times_to_plot")

    for index, value in enumerate(times_to_plot):
      time = require_number(value, f"simulation.times_to_plot[{index}]")

      if time < 0 or time > T:
          raise ValueError(f"simulation.times_to_plot[{index}] must be between 0 and T.")

      step = time / dt
      if abs(step - round(step)) > 1e-8:
          warnings.append(f"simulation.times_to_plot[{index}] is not aligned with dt and may be rounded.")

    devices = require_list(config.get("devices"), "devices")
    if not devices:
        raise ValueError("At least one device is required.")

    device_ids: set[str] = set()
    device_by_id: dict[str, dict[str, Any]] = {}

    for device_index, device in enumerate(devices):
        device = require_object(device, f"devices[{device_index}]")
        device_id = require_string(device.get("id"), f"devices[{device_index}].id")

        if device_id in device_ids:
            raise ValueError(f"Duplicated device id: {device_id}.")

        device_ids.add(device_id)
        device_by_id[device_id] = device

        domain = require_object(device.get("domain"), f"devices[{device_index}].domain")
        Lx = require_number(domain.get("Lx"), f"{device_id}.domain.Lx", strictly_positive=True)
        Ly = require_number(domain.get("Ly"), f"{device_id}.domain.Ly", strictly_positive=True)
        Nx = require_int(domain.get("Nx"), f"{device_id}.domain.Nx", minimum=3)
        Ny = require_int(domain.get("Ny"), f"{device_id}.domain.Ny", minimum=3)

        dx = Lx / Nx
        dy = Ly / Ny

        if dx < 0.0001 or dy < 0.0001:
            warnings.append(f"{device_id}: grid spacing is very small and may cause numerical instability.")

        chemicals = require_list(device.get("chemicals", []), f"{device_id}.chemicals")
        chemical_names: set[str] = set()

        for chemical_index, chemical in enumerate(chemicals):
            chemical = require_object(chemical, f"{device_id}.chemicals[{chemical_index}]")
            name = require_string(chemical.get("name"), f"{device_id}.chemicals[{chemical_index}].name")

            if name.lower() in {chemical_name.lower() for chemical_name in chemical_names}:
                raise ValueError(f"{device_id}: duplicated chemical name '{name}'.")

            chemical_names.add(name)

            require_number(chemical.get("max_concentration"), f"{device_id}.{name}.max_concentration", minimum=0)
            require_number(chemical.get("diffusion_coef"), f"{device_id}.{name}.diffusion_coef", minimum=0)

            initial_profile = chemical.get("initial_profile", "uniform")
            if initial_profile not in ALLOWED_INITIAL_PROFILES:
                raise ValueError(
                    f"{device_id}.{name}.initial_profile must be one of: {', '.join(sorted(ALLOWED_INITIAL_PROFILES))}."
                )

        cells = require_list(device.get("cells", []), f"{device_id}.cells")
        cell_names: set[str] = set()

        for cell_index, cell in enumerate(cells):
            cell = require_object(cell, f"{device_id}.cells[{cell_index}]")
            name = require_string(cell.get("name"), f"{device_id}.cells[{cell_index}].name")

            if name.lower() in {cell_name.lower() for cell_name in cell_names}:
                raise ValueError(f"{device_id}: duplicated cell population name '{name}'.")

            cell_names.add(name)

            require_number(cell.get("concentration"), f"{device_id}.{name}.concentration", minimum=0)
            require_number(cell.get("diffusion_coef"), f"{device_id}.{name}.diffusion_coef", minimum=0)

            shape = cell.get("shape", "ellipse")
            if shape not in ALLOWED_CELL_SHAPES:
                raise ValueError(
                    f"{device_id}.{name}.shape must be one of: {', '.join(sorted(ALLOWED_CELL_SHAPES))}."
                )

        entries = require_list(device.get("entries", []), f"{device_id}.entries")

        for entry_index, entry in enumerate(entries):
            entry = require_object(entry, f"{device_id}.entries[{entry_index}]")
            position = require_list(entry.get("position"), f"{device_id}.entries[{entry_index}].position")

            if len(position) != 2:
                raise ValueError(f"{device_id}.entries[{entry_index}].position must contain exactly two values.")

            x = require_number(position[0], f"{device_id}.entries[{entry_index}].position[0]")
            y = require_number(position[1], f"{device_id}.entries[{entry_index}].position[1]")

            if x < 0 or x > Lx or y < 0 or y > Ly:
                raise ValueError(f"{device_id}.entries[{entry_index}].position must be inside the device domain.")

            chemical = require_string(entry.get("chemical"), f"{device_id}.entries[{entry_index}].chemical")

            if chemical not in chemical_names:
                raise ValueError(f"{device_id}.entries[{entry_index}] references missing chemical '{chemical}'.")

            require_number(entry.get("concentration"), f"{device_id}.entries[{entry_index}].concentration", minimum=0)

    reactions = require_list(config.get("reactions", []), "reactions")

    for reaction_index, reaction in enumerate(reactions):
        reaction = require_object(reaction, f"reactions[{reaction_index}]")
        reaction_type = require_string(reaction.get("type"), f"reactions[{reaction_index}].type")

        if reaction_type not in ALLOWED_REACTION_TYPES:
            raise ValueError(
                f"reactions[{reaction_index}].type must be one of: {', '.join(sorted(ALLOWED_REACTION_TYPES))}."
            )

        substrates = require_list(reaction.get("substrates", []), f"reactions[{reaction_index}].substrates")
        products = require_list(reaction.get("products", []), f"reactions[{reaction_index}].products")
        biologicals = require_list(reaction.get("biologicals", []), f"reactions[{reaction_index}].biologicals")

        for species in substrates + products + biologicals:
            require_string(species, f"reactions[{reaction_index}] species")

        if "coefficients" in reaction:
            coefficients = require_list(reaction["coefficients"], f"reactions[{reaction_index}].coefficients")
            for coefficient_index, coefficient in enumerate(coefficients):
                require_number(coefficient, f"reactions[{reaction_index}].coefficients[{coefficient_index}]")

        if reaction_type == "cell_consumption_waste":
            if len(substrates) != 1 or len(products) != 1 or len(biologicals) != 1:
                raise ValueError(
                    f"reactions[{reaction_index}]: cell_consumption_waste requires one substrate, one product and one biological."
                )

        if reaction_type == "sink" and not substrates:
            raise ValueError(f"reactions[{reaction_index}]: sink requires at least one substrate.")

        if reaction_type == "cells_killing_cells" and len(biologicals) < 2:
            raise ValueError(f"reactions[{reaction_index}]: cells_killing_cells requires at least two biologicals.")

    interfaces = require_list(config.get("interfaces", []), "interfaces")

    for interface_index, interface in enumerate(interfaces):
        interface = require_object(interface, f"interfaces[{interface_index}]")

        device1_id = require_string(interface.get("device1"), f"interfaces[{interface_index}].device1")
        device2_id = require_string(interface.get("device2"), f"interfaces[{interface_index}].device2")

        if device1_id not in device_by_id:
            raise ValueError(f"interfaces[{interface_index}]: device1 '{device1_id}' was not found.")

        if device2_id not in device_by_id:
            raise ValueError(f"interfaces[{interface_index}]: device2 '{device2_id}' was not found.")

        if device1_id == device2_id:
            raise ValueError(f"interfaces[{interface_index}]: device1 and device2 must be different.")

        locs = require_object(interface.get("locs"), f"interfaces[{interface_index}].locs")

        for device_id in (device1_id, device2_id):
            loc = require_object(locs.get(device_id), f"interfaces[{interface_index}].locs.{device_id}")
            start = require_list(loc.get("start"), f"interfaces[{interface_index}].locs.{device_id}.start")
            stop = require_list(loc.get("stop"), f"interfaces[{interface_index}].locs.{device_id}.stop")

            if len(start) != 2 or len(stop) != 2:
                raise ValueError(f"interfaces[{interface_index}].locs.{device_id} start/stop must contain two coordinates.")

            domain = device_by_id[device_id]["domain"]
            Lx = float(domain["Lx"])
            Ly = float(domain["Ly"])

            for point_name, point in (("start", start), ("stop", stop)):
                x = require_number(point[0], f"interfaces[{interface_index}].locs.{device_id}.{point_name}[0]")
                y = require_number(point[1], f"interfaces[{interface_index}].locs.{device_id}.{point_name}[1]")

                if x < 0 or x > Lx or y < 0 or y > Ly:
                    raise ValueError(f"interfaces[{interface_index}].locs.{device_id}.{point_name} is outside the domain.")

        D_interface = interface.get("D_interface", {})

        if isinstance(D_interface, dict):
            for chemical, value in D_interface.items():
                require_string(chemical, f"interfaces[{interface_index}].D_interface chemical")
                require_number(value, f"interfaces[{interface_index}].D_interface.{chemical}", minimum=0)
        else:
            require_number(D_interface, f"interfaces[{interface_index}].D_interface", minimum=0)

        chemicals1 = {chemical["name"] for chemical in device_by_id[device1_id].get("chemicals", [])}
        chemicals2 = {chemical["name"] for chemical in device_by_id[device2_id].get("chemicals", [])}

        shared = chemicals1.intersection(chemicals2)

        if not shared:
            warnings.append(f"interfaces[{interface_index}]: selected devices do not share any chemicals.")

        missing = chemicals1.symmetric_difference(chemicals2)
        if missing:
            warnings.append(
                f"interfaces[{interface_index}]: only chemicals present in both devices will diffuse. "
                f"Non-shared chemicals: {', '.join(sorted(missing))}."
            )

    return warnings


@app.get("/health")
def healthcheck():
    return {"ok": True}


@app.post("/run-simulation")
def run_simulation(data: dict[str, Any]):
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Request body must be a JSON object.")

    try:
        validation_warnings = validate_config(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

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
        "message": "Simulation completed successfully.",
        "warnings": validation_warnings,
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
