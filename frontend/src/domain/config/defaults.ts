import { DEFAULT_SIMULATION } from '../simulation/defaults';
import type { ExportConfig } from './types';

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  simulation: DEFAULT_SIMULATION,
  devices: [],
  interfaces: [],
  reactions: [],
  washouts: []
};
