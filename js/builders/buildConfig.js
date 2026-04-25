import { buildSimulation } from './simulation.js';
import { buildDevices } from './device.js';
import { buildInterfaces } from './interface.js';
import { collectGlobalReactions, validateUnusedChemicals } from '../validators/crossEntity.js';

export function buildConfig(dom) {
  const warnings = [];
  const simulation = buildSimulation(dom, warnings);
  const devices = buildDevices(dom, warnings);
  const interfaces = buildInterfaces(dom, devices, warnings);
  const reactions = collectGlobalReactions(devices, warnings);
  validateUnusedChemicals(devices, interfaces, reactions, warnings);
  const exportDevices = devices.map((d) => {
    const cloned = { ...d };
    delete cloned.reactions;
    return cloned;
  });
  return { config: { simulation, devices: exportDevices, interfaces, reactions }, warnings };
}
