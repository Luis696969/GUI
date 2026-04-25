import { ALLOWED_REACTION_TYPES } from '../config/constants.js';
import { parseCsv, parseNumberCsv, normalizeText } from '../utils/parse.js';
import { assertAllowed } from '../validators/field.js';
import { validateReactionSignature } from '../validators/crossEntity.js';

export function reactionFingerprint(reaction) {
  return JSON.stringify({ type: reaction.type, substrates: [...(reaction.substrates || [])].sort(), products: [...(reaction.products || [])].sort(), biologicals: [...(reaction.biologicals || [])].sort(), coefficients: (reaction.coefficients || []).map(Number) });
}

export function buildReactions(deviceEl, deviceName) {
  return Array.from(deviceEl.querySelectorAll('.reaction-entry')).map((el, index) => {
    const type = normalizeText(el.querySelector('.reaction-type')?.value);
    if (!type) throw new Error(`A reaction has no type in ${deviceName} at position ${index + 1}.`);
    assertAllowed(type, ALLOWED_REACTION_TYPES, `Reaction type in ${deviceName}`);
    const coefficients = parseNumberCsv(el.querySelector('.reaction-coefficients')?.value, `Reaction coefficients in ${deviceName}`);
    const reaction = { type, substrates: parseCsv(el.querySelector('.reaction-substrates')?.value), products: parseCsv(el.querySelector('.reaction-products')?.value), biologicals: parseCsv(el.querySelector('.reaction-biologicals')?.value) };
    if (coefficients.length > 0) reaction.coefficients = coefficients;
    validateReactionSignature(reaction, deviceName, index + 1);
    return reaction;
  });
}
