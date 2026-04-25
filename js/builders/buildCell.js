import { ALLOWED_CELL_SHAPES } from '../config/constants.js';
import { assertAllowed } from '../validators/field.js';
import { validateNoDuplicateNames, validateNonEmptyName } from '../validators/validateField.js';
import { normalizeText, readNumber } from '../utils/parse.js';
import { compactObject } from './buildUtils.js';

export function buildCell(cellEl, deviceName, index) {
  const name = normalizeText(cellEl.querySelector('.cell-name')?.value);
  validateNonEmptyName(name, 'cell population', deviceName, index + 1);

  const shape = normalizeText(cellEl.querySelector('.cell-shape')?.value) || 'ellipse';
  assertAllowed(shape, ALLOWED_CELL_SHAPES, `Shape for ${name}`);

  return compactObject({
    name,
    concentration: readNumber(cellEl.querySelector('.cell-conc')?.value, `Concentration of ${name} in ${deviceName}`, { min: 0 }),
    diffusion_coef: readNumber(cellEl.querySelector('.cell-coef')?.value, `Diffusion coefficient of ${name} in ${deviceName}`, { min: 0 }),
    shape
  });
}

export function buildCells(deviceEl, deviceName) {
  const cells = Array.from(deviceEl.querySelectorAll('.cell-entry')).map((cellEl, index) => buildCell(cellEl, deviceName, index));
  validateNoDuplicateNames(cells, 'Cell population', deviceName);
  return cells;
}
