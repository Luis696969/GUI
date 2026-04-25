import type { DeviceModel } from './types';

export const DEFAULT_DEVICE: DeviceModel = {
  id: 'device_1',
  domain: {
    Lx: 1,
    Ly: 1,
    Nx: 10,
    Ny: 10
  },
  chemicals: [],
  cells: [],
  entries: [],
  reactions: []
};
