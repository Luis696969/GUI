import { describe, expect, it } from 'vitest';

import { buildConfig } from '../buildConfig';
import { CONFIG_EXAMPLES } from '../examples';
import { validateConfig } from '../validateConfig';

describe('config examples export + validation contract', () => {
  it.each(CONFIG_EXAMPLES)('builds/exports "$key" with expected shape and non-blocking validation', ({ input }) => {
    const exported = buildConfig(input);
    const validation = validateConfig(exported);

    expect(Object.keys(exported).sort()).toEqual(['devices', 'interfaces', 'reactions', 'simulation', 'washouts']);
    expect(exported).not.toHaveProperty('config');

    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(Array.isArray(validation.warnings)).toBe(true);
    }

    exported.interfaces.forEach((iface) => {
      expect(Object.keys(iface.locs).sort()).toEqual(['device1', 'device2']);
    });

    expect(exported.devices.every((device) => !('reactions' in device))).toBe(true);
    expect(exported.washouts).toEqual([]);
  });
});
