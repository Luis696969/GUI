import { ALLOWED_REACTION_TYPES } from '../config/constants.js';
import { parseCsv, parseNumberCsv, normalizeText } from '../utils/parse.js';
import { assertAllowed } from '../validators/field.js';
import { validateReactionSignature } from '../validators/crossEntity.js';
import { compactObject } from './buildUtils.js';

export function reactionFingerprint(reaction) {
  return JSON.stringify({ type: reaction.type, substrates: [...(reaction.substrates || [])].sort(), products: [...(reaction.products || [])].sort(), biologicals: [...(reaction.biologicals || [])].sort(), coefficients: (reaction.coefficients || []).map(Number) });
}

export function buildReaction(reactionEl, deviceName, index) {
  const type = normalizeText(reactionEl.querySelector('.reaction-type')?.value);
  if (!type) throw new Error(`A reaction has no type in ${deviceName} at position ${index + 1}.`);
  assertAllowed(type, ALLOWED_REACTION_TYPES, `Reaction type in ${deviceName}`);

  const coefficients = parseNumberCsv(reactionEl.querySelector('.reaction-coefficients')?.value, `Reaction coefficients in ${deviceName}`);
  const reaction = compactObject({
    type,
    substrates: parseCsv(reactionEl.querySelector('.reaction-substrates')?.value),
    products: parseCsv(reactionEl.querySelector('.reaction-products')?.value),
    biologicals: parseCsv(reactionEl.querySelector('.reaction-biologicals')?.value),
    coefficients: coefficients.length > 0 ? coefficients : undefined
  });

  validateReactionSignature(reaction, deviceName, index + 1);
  return reaction;
}

export function buildReactions(deviceEl, deviceName) {
  return Array.from(deviceEl.querySelectorAll('.reaction-entry')).map((reactionEl, index) => buildReaction(reactionEl, deviceName, index));
}
