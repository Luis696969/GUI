import { describe, expect, it } from 'vitest';

import { buildConfig } from '../buildConfig';
import {
  MINIMAL_VALID_CONFIG_INPUT,
  REACTION_FOCUSED_CONFIG_INPUT,
  TWO_DEVICE_INTERFACE_CONFIG_INPUT
} from '../examples';

describe('config examples', () => {
  it('minimal example builds with expected root keys and empty washouts', () => {
    const result = buildConfig(MINIMAL_VALID_CONFIG_INPUT);

    expect(Object.keys(result).sort()).toEqual(['devices', 'interfaces', 'reactions', 'simulation', 'washouts']);
    expect(result.washouts).toEqual([]);
  });

  it('two-device interface example preserves literal locs.device1/device2 keys in export', () => {
    const result = buildConfig(TWO_DEVICE_INTERFACE_CONFIG_INPUT);

    expect(result.interfaces).toHaveLength(1);
    expect(Object.keys(result.interfaces[0].locs).sort()).toEqual(['device1', 'device2']);
    expect(result.interfaces[0].locs).toEqual({
      device1: { start: [0, 0], stop: [0, 6] },
      device2: { start: [8, 0], stop: [8, 6] }
    });
  });

  it('reaction-focused example only exports reactions at root after build', () => {
    const result = buildConfig(REACTION_FOCUSED_CONFIG_INPUT);

    expect(result.reactions.length).toBeGreaterThan(0);
    expect(result.devices.every((device) => !('reactions' in device))).toBe(true);
  });
});
