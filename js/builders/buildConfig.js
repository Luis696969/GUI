import { buildSimulation } from './buildSimulation.js';
import { buildDevices } from './buildDevice.js';
import { buildInterfaces } from './buildInterface.js';
import { collectGlobalReactions, validateUnusedChemicals } from '../validators/crossEntity.js';
import { validateDeviceConfig, validateInterfaceConfig, validateSimulationConfig } from '../validators/validateConfig.js';
import { compactObject } from './buildUtils.js';

export function buildConfig(dom) {
  const warnings = [];
  const simulation = buildSimulation(dom, warnings);
  validateSimulationConfig(simulation);
  const devices = buildDevices(dom, warnings);
  devices.forEach((device) => validateDeviceConfig(device));
  const interfaces = buildInterfaces(dom, devices, warnings);
  interfaces.forEach((iface, index) => validateInterfaceConfig(iface, index));
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
