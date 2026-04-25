import { ALLOWED_REACTION_TYPES } from '../config/constants.js';

export function validateReactionTypeAndParticipants(reaction, deviceName, reactionNumber) {
  if (!ALLOWED_REACTION_TYPES.includes(reaction.type)) {
    throw new Error(`Reaction ${reactionNumber} in ${deviceName}: invalid type "${reaction.type}".`);
  }

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

export function validateReactionParticipantsExist(reaction, device, deviceName) {
  const chemicalNames = new Set(device.chemicals.map((chemical) => chemical.name));
  const cellNames = new Set(device.cells.map((cell) => cell.name));

  (reaction.substrates || []).forEach((substrate) => {
    if (!chemicalNames.has(substrate)) throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing substrate "${substrate}".`);
  });

  (reaction.products || []).forEach((product) => {
    if (!chemicalNames.has(product)) throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing product "${product}".`);
  });

  (reaction.biologicals || []).forEach((biological) => {
    if (!cellNames.has(biological)) throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing biological "${biological}".`);
  });
}
