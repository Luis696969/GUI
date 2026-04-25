export const ALLOWED_INITIAL_PROFILES = ['uniform', 'zero', 'chamber'];
export const ALLOWED_CELL_SHAPES = ['ellipse', 'circle', 'rectangle', 'limacon', 'ying', 'yang'];
export const ALLOWED_REACTION_TYPES = ['cell_consumption_waste', 'sink', 'cells_killing_cells'];
export const ALLOWED_INTERFACE_SIDES = ['left', 'right', 'top', 'bottom'];

const DEFAULT_API_URL = 'http://127.0.0.1:8000/run-simulation';
export const API_URL = globalThis.APP_CONFIG?.API_URL ?? DEFAULT_API_URL;
