import { ALLOWED_INITIAL_PROFILES } from '../config/constants.js';
import { assertAllowed } from '../validators/field.js';
import { validateNoDuplicateNames, validateNonEmptyName } from '../validators/validateField.js';
import { normalizeText, readNumber } from '../utils/parse.js';
import { compactObject } from './buildUtils.js';

export function buildChemical(chemicalEl, deviceName, index) {
  const name = normalizeText(chemicalEl.querySelector('.chem-name')?.value);
  validateNonEmptyName(name, 'chemical', deviceName, index + 1);

  const initialProfile = normalizeText(chemicalEl.querySelector('.chem-profile')?.value) || 'uniform';
  assertAllowed(initialProfile, ALLOWED_INITIAL_PROFILES, `Initial profile for ${name}`);

  return compactObject({
    name,
    max_concentration: readNumber(chemicalEl.querySelector('.chem-max-concentration')?.value, `Max concentration of ${name} in ${deviceName}`, { min: 0 }),
    diffusion_coef: readNumber(chemicalEl.querySelector('.chem-coef')?.value, `Diffusion coefficient of ${name} in ${deviceName}`, { min: 0 }),
    initial_profile: initialProfile
  });
}

export function buildChemicals(deviceEl, deviceName) {
  const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry')).map((chemicalEl, index) => buildChemical(chemicalEl, deviceName, index));
  validateNoDuplicateNames(chemicals, 'Chemical', deviceName);
  return chemicals;
}
