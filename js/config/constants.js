export const API_URL = 'http://127.0.0.1:8000/run-simulation';

export const ALLOWED_INITIAL_PROFILES = ['uniform', 'zero', 'chamber'];
export const ALLOWED_CELL_SHAPES = ['ellipse', 'circle', 'rectangle', 'limacon', 'ying', 'yang'];
export const ALLOWED_REACTION_TYPES = ['cell_consumption_waste', 'sink', 'cells_killing_cells'];
export const ALLOWED_INTERFACE_SIDES = ['left', 'right', 'top', 'bottom'];

export const DEFAULTS = {
  sim: { T: 650, dt: 0.1, runSolver: true },
  cardFlashMs: 1600
};
