import { ALLOWED_CELL_SHAPES } from '../config/constants.js';
import { assertAllowed, assertUniqueByName } from '../validators/field.js';
import { normalizeText, readNumber } from '../utils/parse.js';

export function buildCells(deviceEl, deviceName) {
  const cells = Array.from(deviceEl.querySelectorAll('.cell-entry')).map((el, index) => {
    const name = normalizeText(el.querySelector('.cell-name')?.value);
    if (!name) throw new Error(`A cell population has no name in ${deviceName} at position ${index + 1}.`);
    const shape = normalizeText(el.querySelector('.cell-shape')?.value) || 'ellipse';
    assertAllowed(shape, ALLOWED_CELL_SHAPES, `Shape for ${name}`);
    return {
      name,
      concentration: readNumber(el.querySelector('.cell-conc')?.value, `Concentration of ${name} in ${deviceName}`, { min: 0 }),
      diffusion_coef: readNumber(el.querySelector('.cell-coef')?.value, `Diffusion coefficient of ${name} in ${deviceName}`, { min: 0 }),
      shape
    };
  });
  assertUniqueByName(cells, 'Cell population', deviceName);
  return cells;
}
