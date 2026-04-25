import type { BuildConfigInput } from './types';

export type ConfigExample = {
  key: 'minimal' | 'two-device-interface' | 'reaction-focused';
  label: string;
  description: string;
  input: BuildConfigInput;
};

export const MINIMAL_VALID_CONFIG_INPUT: BuildConfigInput = {
  simulation: {
    T: 1,
    dt: 0.1,
    run_solver: true,
    times_to_plot: []
  },
  devices: [
    {
      id: 'device_1',
      domain: { Lx: 1, Ly: 1, Nx: 3, Ny: 3 },
      chemicals: [{ name: 'signal' }],
      cells: [{ name: 'cell_a' }],
      entries: [{ position: [0.5, 0.5], chemical: 'signal', concentration: 1 }],
      reactions: []
    }
  ],
  interfaces: []
};

export const TWO_DEVICE_INTERFACE_CONFIG_INPUT: BuildConfigInput = {
  simulation: {
    T: 8,
    dt: 0.2,
    run_solver: true,
    times_to_plot: [0, 4, 8]
  },
  devices: [
    {
      id: 'device_A',
      domain: { Lx: 8, Ly: 6, Nx: 8, Ny: 6 },
      chemicals: [{ name: 'glucose' }],
      cells: [{ name: 'cell_A' }],
      entries: [{ position: [1, 1], chemical: 'glucose', concentration: 2 }],
      reactions: []
    },
    {
      id: 'device_B',
      domain: { Lx: 8, Ly: 6, Nx: 8, Ny: 6 },
      chemicals: [{ name: 'glucose' }, { name: 'oxygen' }],
      cells: [{ name: 'cell_B' }],
      entries: [{ position: [2, 2], chemical: 'oxygen', concentration: 1 }],
      reactions: []
    }
  ],
  interfaces: [
    {
      device1: 'device_A',
      device2: 'device_B',
      locs: {
        device1: { start: [0, 0], stop: [0, 6] },
        device2: { start: [8, 0], stop: [8, 6] }
      },
      D_interface: {
        glucose: 0.05,
        oxygen: 0.08
      }
    }
  ]
};

export const REACTION_FOCUSED_CONFIG_INPUT: BuildConfigInput = {
  simulation: {
    T: 12,
    dt: 0.5,
    run_solver: true,
    times_to_plot: [0, 6, 12]
  },
  devices: [
    {
      id: 'reactor_1',
      domain: { Lx: 10, Ly: 10, Nx: 10, Ny: 10 },
      chemicals: [{ name: 'substrate' }, { name: 'waste' }],
      cells: [{ name: 'cells' }],
      entries: [{ position: [3, 3], chemical: 'substrate', concentration: 1.2 }],
      reactions: [
        {
          type: 'cell_consumption_waste',
          substrates: ['substrate'],
          products: ['waste'],
          biologicals: ['cells'],
          coefficients: [1, 1]
        },
        {
          type: 'sink',
          substrates: ['waste'],
          products: [],
          biologicals: [],
          coefficients: [1]
        }
      ]
    },
    {
      id: 'reactor_2',
      domain: { Lx: 10, Ly: 10, Nx: 10, Ny: 10 },
      chemicals: [{ name: 'substrate' }, { name: 'waste' }],
      cells: [{ name: 'cells' }],
      entries: [{ position: [5, 5], chemical: 'substrate', concentration: 0.6 }],
      reactions: [
        {
          type: 'cell_consumption_waste',
          substrates: ['substrate'],
          products: ['waste'],
          biologicals: ['cells'],
          coefficients: [1, 1]
        }
      ]
    }
  ],
  interfaces: []
};

export const CONFIG_EXAMPLES: ConfigExample[] = [
  {
    key: 'minimal',
    label: 'Load minimal',
    description: 'Single-device minimal valid configuration state.',
    input: MINIMAL_VALID_CONFIG_INPUT
  },
  {
    key: 'two-device-interface',
    label: 'Load 2-device interface',
    description: 'Two devices linked by one interface using literal locs.device1/device2 keys.',
    input: TWO_DEVICE_INTERFACE_CONFIG_INPUT
  },
  {
    key: 'reaction-focused',
    label: 'Load reaction-focused',
    description: 'Two reactors with shared reactions for root-level projection/dedup during build.',
    input: REACTION_FOCUSED_CONFIG_INPUT
  }
];
