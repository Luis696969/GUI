import { buildSimulation } from './buildSimulation.js';
import { buildDevices } from './buildDevice.js';
import { buildInterfaces } from './buildInterface.js';
import { collectGlobalReactions, validateUnusedChemicals } from '../validators/crossEntity.js';
import { compactObject } from './buildUtils.js';

export function buildConfig(dom) {
  const warnings = [];
  const simulation = buildSimulation(dom, warnings);
  const devices = buildDevices(dom, warnings);
  const interfaces = buildInterfaces(dom, devices, warnings);
  const reactions = collectGlobalReactions(devices, warnings);

  validateUnusedChemicals(devices, interfaces, reactions, warnings);

  const exportDevices = devices.map((device) => {
    const { reactions: _reactions, ...deviceWithoutReactions } = device;
    return compactObject(deviceWithoutReactions);
  });

  return {
    config: compactObject({
      simulation,
      devices: exportDevices,
      interfaces,
      reactions
    }),
    warnings
  };
}
