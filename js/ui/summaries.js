import { normalizeText } from '../utils/parse.js';

const summaryMap = {
  '.device-entry': (el) => {
    const name = normalizeText(el.querySelector('.device-name')?.value) || 'Device';
    return `${name} · ${el.querySelectorAll('.chemical-entry').length} chemicals · ${el.querySelectorAll('.cell-entry').length} cells · ${el.querySelectorAll('.entry-entry').length} entries · ${el.querySelectorAll('.reaction-entry').length} reactions`;
  },
  '.chemical-entry': (el) => normalizeText(el.querySelector('.chem-name')?.value) || 'Chemical',
  '.cell-entry': (el) => normalizeText(el.querySelector('.cell-name')?.value) || 'Cell population',
  '.entry-entry': (el) => `${el.querySelector('.entry-chemical')?.value || 'chemical'} at (${el.querySelector('.entry-x')?.value || 'x'}, ${el.querySelector('.entry-y')?.value || 'y'})`,
  '.reaction-entry': (el) => normalizeText(el.querySelector('.reaction-type')?.value) || 'Reaction',
  '.interface-entry': (el) => {
    const from = el.querySelector('.iface-device1')?.selectedOptions?.[0]?.textContent || 'Origin';
    const to = el.querySelector('.iface-device2')?.selectedOptions?.[0]?.textContent || 'Destination';
    return `${from} → ${to}`;
  }
};

export function updateCardSummaries(root = document) {
  Object.entries(summaryMap).forEach(([selector, fn]) => {
    root.querySelectorAll(selector).forEach((el) => {
      const target = el.querySelector('.card-summary');
      if (target) target.textContent = fn(el);
    });
  });
}
