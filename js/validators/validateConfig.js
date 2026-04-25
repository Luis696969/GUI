import { validateDomainGrid, validateTimeStep, validateTimesToPlot } from './validateField.js';
import { validateInterfaceDevicesDiffer, validateInterfaceDiffusion } from './validateInterface.js';
import { validateReactionTypeAndParticipants } from './validateReaction.js';

export function validateSimulationConfig(simulation) {
  validateTimeStep(simulation.T, simulation.dt);
  validateTimesToPlot(simulation.times_to_plot || [], simulation.T);
}

export function validateDeviceConfig(device) {
  validateDomainGrid(device.domain, device.id);
}

export function validateInterfaceConfig(iface, index) {
  validateInterfaceDevicesDiffer(iface.device1, iface.device2, index);
  validateInterfaceDiffusion(iface.D_interface, `Interface ${index + 1}`);
}

export function validateReactionConfig(reaction, deviceName, reactionNumber) {
  validateReactionTypeAndParticipants(reaction, deviceName, reactionNumber);
}
