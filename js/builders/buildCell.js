import { ALLOWED_CELL_SHAPES } from '../config/constants.js';
import { assertAllowed, assertUniqueByName } from '../validators/field.js';
import { normalizeText, readNumber } from '../utils/parse.js';
import { compactObject } from './buildUtils.js';

export function buildCell(cellEl, deviceName, index) {
  const name = normalizeText(cellEl.querySelector('.cell-name')?.value);
  if (!name) throw new Error(`A cell population has no name in ${deviceName} at position ${index + 1}.`);

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
  assertUniqueByName(cells, 'Cell population', deviceName);
  return cells;
}
