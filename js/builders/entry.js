import { normalizeText, readNumber } from '../utils/parse.js';

export function buildEntries(deviceEl, deviceName, domain, chemicals) {
  const chemicalNames = new Set(chemicals.map((chemical) => chemical.name));
  return Array.from(deviceEl.querySelectorAll('.entry-entry')).map((el, index) => {
    const x = readNumber(el.querySelector('.entry-x')?.value, `Entry ${index + 1} x position in ${deviceName}`, { min: 0, max: domain.Lx });
    const y = readNumber(el.querySelector('.entry-y')?.value, `Entry ${index + 1} y position in ${deviceName}`, { min: 0, max: domain.Ly });
    const chemical = normalizeText(el.querySelector('.entry-chemical')?.value);
    if (!chemical) throw new Error(`Entry ${index + 1} in ${deviceName} must select a chemical.`);
    if (!chemicalNames.has(chemical)) throw new Error(`Entry ${index + 1} in ${deviceName} references missing chemical "${chemical}".`);
    return { position: [x, y], chemical, concentration: readNumber(el.querySelector('.entry-concentration')?.value, `Entry ${index + 1} concentration in ${deviceName}`, { min: 0 }) };
  });
}
