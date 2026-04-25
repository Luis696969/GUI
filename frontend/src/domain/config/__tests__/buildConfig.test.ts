import { describe, expect, it } from 'vitest';

import { buildConfig } from '../buildConfig';
import { validateConfig } from '../schema';

function makeValidConfigInput() {
  return buildConfig({
    simulation: {
      T: 10,
      dt: 1,
      run_solver: true,
      times_to_plot: [0, 5, 10]
    },
    devices: [
      {
        id: 'device1',
        domain: { Lx: 100, Ly: 80, Nx: 10, Ny: 12 },
        chemicals: [{ name: 'glucose' }],
        cells: [{ name: 'cellA' }],
        entries: [{ position: [10, 10], chemical: 'glucose', concentration: 1 }],
        reactions: [
          {
            type: 'cell_consumption_waste',
            substrates: ['glucose'],
            products: ['lactate'],
            biologicals: ['cellA'],
            coefficients: [1, 1]
          }
        ]
      },
      {
        id: 'device2',
        domain: { Lx: 90, Ly: 70, Nx: 9, Ny: 11 },
        chemicals: [{ name: 'oxygen' }],
        cells: [{ name: 'cellB' }],
        entries: [{ position: [20, 20], chemical: 'oxygen', concentration: 2 }],
        reactions: [
          {
            type: 'sink',
            substrates: ['oxygen'],
            products: [],
            biologicals: [],
            coefficients: [1]
          }
        ]
      }
    ],
    interfaces: [
      {
        device1: 'device1',
        device2: 'device2',
        locs: {
          device1: { start: [0, 0], stop: [0, 10] },
          device2: { start: [1, 0], stop: [1, 10] }
        },
        D_interface: { glucose: 0.1 }
      }
    ]
  });
}

describe('buildConfig export structure', () => {
  it('exports exact root keys and no top-level config wrapper', () => {
    const result = makeValidConfigInput();

    expect(Object.keys(result).sort()).toEqual(['devices', 'interfaces', 'reactions', 'simulation', 'washouts']);
    expect(result).not.toHaveProperty('config');
  });

  it('deduplicates byte-identical reactions into a single root reaction', () => {
    const identicalReaction = {
      type: 'cell_consumption_waste' as const,
      substrates: ['glucose'],
      products: ['lactate'],
      biologicals: ['cellA'],
      coefficients: [1, 1]
    };

    const result = buildConfig({
      devices: [
        {
          id: 'device1',
          domain: { Lx: 100, Ly: 80, Nx: 10, Ny: 12 },
          chemicals: [{ name: 'glucose' }],
          cells: [{ name: 'cellA' }],
          entries: [{ position: [10, 10], chemical: 'glucose', concentration: 1 }],
          reactions: [identicalReaction]
        },
        {
          id: 'device2',
          domain: { Lx: 90, Ly: 70, Nx: 9, Ny: 11 },
          chemicals: [{ name: 'glucose' }],
          cells: [{ name: 'cellA' }],
          entries: [{ position: [20, 20], chemical: 'glucose', concentration: 2 }],
          reactions: [identicalReaction]
        }
      ]
    });

    expect(result.reactions).toHaveLength(1);
  });

  it('exports reactions at root and removes nested device reactions', () => {
    const result = makeValidConfigInput();

    expect(result.reactions).toHaveLength(2);
    expect(result.devices.every((device) => !('reactions' in device))).toBe(true);
  });

  it('exports interface locs with literal keys device1 and device2 only', () => {
    const result = buildConfig({
      interfaces: [
        {
          device1: 'device1',
          device2: 'device2',
          locs: {
            device1: { start: [0, 0], stop: [0, 10] },
            device2: { start: [1, 0], stop: [1, 10] },
            dynamicDeviceA: { start: [2, 0], stop: [2, 10] },
            dynamicDeviceB: { start: [3, 0], stop: [3, 10] }
          } as unknown as Record<string, { start: [number, number]; stop: [number, number] }>
        } as Parameters<typeof buildConfig>[0]['interfaces'][number]
      ]
    });

    expect(result.interfaces[0].locs).toEqual({
      device1: { start: [0, 0], stop: [0, 10] },
      device2: { start: [1, 0], stop: [1, 10] }
    });
    expect(Object.keys(result.interfaces[0].locs).sort()).toEqual(['device1', 'device2']);
  });

  it('defaults washouts to an empty array', () => {
    const result = makeValidConfigInput();

    expect(result.washouts).toEqual([]);
  });

  it('keeps primitive JavaScript types for exported key fields', () => {
    const result = makeValidConfigInput();

    expect(typeof result.simulation.T).toBe('number');
    expect(typeof result.simulation.dt).toBe('number');
    expect(typeof result.simulation.run_solver).toBe('boolean');
    expect(typeof result.simulation.times_to_plot[0]).toBe('number');
    expect(typeof result.devices[0].id).toBe('string');
    expect(typeof result.interfaces[0].device1).toBe('string');
  });
});

describe('validateConfig', () => {
  it('returns validation errors for invalid T/dt/domain/times/interface D values', () => {
    const config = makeValidConfigInput();

    const brokenConfig = {
      ...config,
      simulation: {
        ...config.simulation,
        T: -1,
        dt: 2,
        times_to_plot: [0, 3]
      },
      devices: [
        {
          ...config.devices[0],
          domain: {
            ...config.devices[0].domain,
            Nx: 2
          }
        },
        ...config.devices.slice(1)
      ],
      interfaces: [
        {
          ...config.interfaces[0],
          D_interface: { glucose: -0.01 }
        }
      ]
    };

    const result = validateConfig(brokenConfig);

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));

    expect(paths).toContain('simulation.T');
    expect(paths).toContain('simulation.dt');
    expect(paths).toContain('simulation.times_to_plot.1');
    expect(paths).toContain('devices.0.domain.Nx');
    expect(paths).toContain('interfaces.0.D_interface.glucose');
  });

  it('rejects duplicate chemical and cell names', () => {
    const config = makeValidConfigInput();

    const duplicateNamesConfig = {
      ...config,
      devices: [
        {
          ...config.devices[0],
          chemicals: [{ name: 'dup' }, { name: 'dup' }],
          cells: [{ name: 'same' }, { name: 'same' }]
        },
        ...config.devices.slice(1)
      ]
    };

    const result = validateConfig(duplicateNamesConfig);

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const messages = result.errors.issues.map((issue) => issue.message);

    expect(messages).toContain('Duplicate chemical name "dup" in device "device1".');
    expect(messages).toContain('Duplicate cell name "same" in device "device1".');
  });
});
