import { describe, expect, it } from 'vitest';

import { validateConfig } from '../validateConfig';

function makeValidConfig() {
  return {
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
        chemicals: [{ name: 'glucose' }, { name: 'oxygen' }],
        cells: [{ name: 'cellA' }],
        entries: [{ position: [10, 10], chemical: 'glucose', concentration: 1 }]
      },
      {
        id: 'device2',
        domain: { Lx: 90, Ly: 70, Nx: 9, Ny: 11 },
        chemicals: [{ name: 'lactate' }, { name: 'oxygen' }],
        cells: [{ name: 'cellB' }],
        entries: [{ position: [20, 20], chemical: 'lactate', concentration: 2 }]
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
        D_interface: { oxygen: 0.1 }
      }
    ],
    reactions: [
      {
        type: 'cell_consumption_waste',
        substrates: ['glucose'],
        products: ['lactate'],
        biologicals: ['cellA'],
        coefficients: [1, 1]
      }
    ],
    washouts: []
  };
}

describe('validateConfig edge cases', () => {
  it('validates simulation constraints for T, dt, dt <= T, and times_to_plot bounds', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      simulation: {
        ...config.simulation,
        T: -1,
        dt: 2,
        times_to_plot: [0, 3]
      }
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('simulation.T');
    expect(paths).toContain('simulation.dt');
    expect(paths).toContain('simulation.times_to_plot.1');
  });

  it('enforces domain bounds and grid constraints for Lx/Ly/Nx/Ny', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      devices: [
        {
          ...config.devices[0],
          domain: {
            Lx: 0,
            Ly: -1,
            Nx: 2.5,
            Ny: 2
          }
        },
        config.devices[1]
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('devices.0.domain.Lx');
    expect(paths).toContain('devices.0.domain.Ly');
    expect(paths).toContain('devices.0.domain.Nx');
    expect(paths).toContain('devices.0.domain.Ny');
  });

  it('fails on duplicate chemical and cell names per device', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      devices: [
        {
          ...config.devices[0],
          chemicals: [{ name: 'dup' }, { name: 'dup' }],
          cells: [{ name: 'same' }, { name: 'same' }]
        },
        config.devices[1]
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const messages = result.errors.issues.map((issue) => issue.message);
    expect(messages).toContain('Duplicate chemical name "dup" in device "device1".');
    expect(messages).toContain('Duplicate cell name "same" in device "device1".');
  });

  it('fails when an entry position is outside of the device domain', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      devices: [
        {
          ...config.devices[0],
          entries: [{ position: [101, 10], chemical: 'glucose', concentration: 1 }]
        },
        config.devices[1]
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('devices.0.entries.0.position');
  });

  it('fails when an interface connects the same device', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      interfaces: [
        {
          ...config.interfaces[0],
          device2: 'device1'
        }
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('interfaces.0.device2');
    expect(result.errors.issues.some((issue) => issue.message.includes('must be different'))).toBe(true);
  });

  it('fails when D_interface contains a negative value', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      interfaces: [
        {
          ...config.interfaces[0],
          D_interface: {
            oxygen: -0.01
          }
        }
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('interfaces.0.D_interface.oxygen');
  });

  it('fails when a reaction type is invalid', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      reactions: [
        {
          ...config.reactions[0],
          type: 'not_a_real_reaction'
        }
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('reactions.0.type');
  });

  it('fails cross-entity checks for unknown entities, interface devices, and interface bounds', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      devices: [
        {
          ...config.devices[0],
          entries: [{ position: [10, 10], chemical: 'missing_chemical', concentration: 1 }]
        },
        config.devices[1]
      ],
      interfaces: [
        {
          ...config.interfaces[0],
          device1: 'missing-device-a',
          device2: 'missing-device-b'
        },
        {
          ...config.interfaces[0],
          locs: {
            device1: { start: [0, 0], stop: [1000, 1000] },
            device2: { start: [1, 0], stop: [1, 10] }
          }
        }
      ],
      reactions: [
        {
          ...config.reactions[0],
          substrates: ['missing-substrate'],
          products: ['missing-product'],
          biologicals: ['missing-cell']
        }
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const paths = result.errors.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('devices.0.entries.0.chemical');
    expect(paths).toContain('reactions.0.substrates.0');
    expect(paths).toContain('reactions.0.products.0');
    expect(paths).toContain('reactions.0.biologicals.0');
    expect(paths).toContain('interfaces.0.device1');
    expect(paths).toContain('interfaces.0.device2');
    expect(paths).toContain('interfaces.1.locs.device1');
  });

  it('emits warning (without parse failure) when interface devices share no chemicals', () => {
    const config = makeValidConfig();

    const result = validateConfig({
      ...config,
      devices: [
        {
          ...config.devices[0],
          chemicals: [{ name: 'glucose' }]
        },
        {
          ...config.devices[1],
          chemicals: [{ name: 'lactate' }]
        }
      ]
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected validation to succeed with warnings');
    }

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].message).toContain('zero shared chemicals');
  });
});
