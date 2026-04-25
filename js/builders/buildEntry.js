import { normalizeText, readNumber } from '../utils/parse.js';
import { compactObject } from './buildUtils.js';

export function buildEntry(entryEl, deviceName, domain, chemicalNames, index) {
  const x = readNumber(entryEl.querySelector('.entry-x')?.value, `Entry ${index + 1} x position in ${deviceName}`, { min: 0, max: domain.Lx });
  const y = readNumber(entryEl.querySelector('.entry-y')?.value, `Entry ${index + 1} y position in ${deviceName}`, { min: 0, max: domain.Ly });
  const chemical = normalizeText(entryEl.querySelector('.entry-chemical')?.value);

  if (!chemical) throw new Error(`Entry ${index + 1} in ${deviceName} must select a chemical.`);
  if (!chemicalNames.has(chemical)) throw new Error(`Entry ${index + 1} in ${deviceName} references missing chemical "${chemical}".`);

  return compactObject({
    position: [x, y],
    chemical,
    concentration: readNumber(entryEl.querySelector('.entry-concentration')?.value, `Entry ${index + 1} concentration in ${deviceName}`, { min: 0 })
  });
}

export function buildEntries(deviceEl, deviceName, domain, chemicals) {
  const chemicalNames = new Set(chemicals.map((chemical) => chemical.name));
  return Array.from(deviceEl.querySelectorAll('.entry-entry')).map((entryEl, index) => buildEntry(entryEl, deviceName, domain, chemicalNames, index));
}
