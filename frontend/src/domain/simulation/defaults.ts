import type { SimulationModel } from './types';

export const DEFAULT_TIMES_TO_PLOT: number[] = [];

export const DEFAULT_SIMULATION: SimulationModel = {
  T: 1,
  dt: 0.1,
  run_solver: true,
  times_to_plot: DEFAULT_TIMES_TO_PLOT
};
