import { ALLOWED_INITIAL_PROFILES } from '../config/constants.js';
import { assertAllowed, assertUniqueByName } from '../validators/field.js';
import { normalizeText, readNumber } from '../utils/parse.js';

export function buildChemicals(deviceEl, deviceName) {
  const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry')).map((el, index) => {
    const name = normalizeText(el.querySelector('.chem-name')?.value);
    if (!name) throw new Error(`A chemical has no name in ${deviceName} at position ${index + 1}.`);
    const initialProfile = normalizeText(el.querySelector('.chem-profile')?.value) || 'uniform';
    assertAllowed(initialProfile, ALLOWED_INITIAL_PROFILES, `Initial profile for ${name}`);
    return {
      name,
      max_concentration: readNumber(el.querySelector('.chem-max-concentration')?.value, `Max concentration of ${name} in ${deviceName}`, { min: 0 }),
      diffusion_coef: readNumber(el.querySelector('.chem-coef')?.value, `Diffusion coefficient of ${name} in ${deviceName}`, { min: 0 }),
      initial_profile: initialProfile
    };
  });
  assertUniqueByName(chemicals, 'Chemical', deviceName);
  return chemicals;
}
