import { reactionFingerprint } from '../builders/buildReaction.js';

export function validateReactionSignature(reaction, deviceName, reactionNumber) {
  if (reaction.type === 'cell_consumption_waste' && (reaction.substrates.length !== 1 || reaction.products.length !== 1 || reaction.biologicals.length !== 1)) {
    throw new Error(`Reaction ${reactionNumber} in ${deviceName}: cell_consumption_waste requires one substrate, one product and one biological.`);
  }
  if (reaction.type === 'sink' && reaction.substrates.length < 1) {
    throw new Error(`Reaction ${reactionNumber} in ${deviceName}: sink requires at least one substrate.`);
  }
  if (reaction.type === 'cells_killing_cells' && reaction.biologicals.length < 2) {
    throw new Error(`Reaction ${reactionNumber} in ${deviceName}: cells_killing_cells requires at least two biologicals.`);
  }
}

export function validateReactionSpecies(reaction, device, deviceName) {
  const chemicalNames = new Set(device.chemicals.map((c) => c.name));
  const cellNames = new Set(device.cells.map((c) => c.name));
  (reaction.substrates || []).forEach((s) => { if (!chemicalNames.has(s)) throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing substrate "${s}".`); });
  (reaction.products || []).forEach((p) => { if (!chemicalNames.has(p)) throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing product "${p}".`); });
  (reaction.biologicals || []).forEach((b) => { if (!cellNames.has(b)) throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing biological "${b}".`); });
}

export function collectGlobalReactions(devices, warnings) {
  const fingerprints = new Set();
  const reactions = [];
  devices.forEach((device) => (device.reactions || []).forEach((reaction) => {
    const fp = reactionFingerprint(reaction);
    if (!fingerprints.has(fp)) {
      fingerprints.add(fp);
      reactions.push(reaction);
    }
  }));
  if (!reactions.length) warnings.push('No reactions have been defined.');
  return reactions;
}

export function validateUnusedChemicals(devices, interfaces, reactions, warnings) {
  const inInterfaces = new Set();
  interfaces.forEach((iface) => Object.keys(iface.D_interface || {}).forEach((c) => inInterfaces.add(c)));
  const inReactions = new Set();
  reactions.forEach((reaction) => [...(reaction.substrates || []), ...(reaction.products || [])].forEach((c) => inReactions.add(c)));
  devices.forEach((device) => device.chemicals.forEach((chemical) => {
    if (!inInterfaces.has(chemical.name) && !inReactions.has(chemical.name)) warnings.push(`${device.id}: chemical "${chemical.name}" is not used by any interface or reaction.`);
  }));
}
