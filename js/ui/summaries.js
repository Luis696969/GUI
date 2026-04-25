function normalizeText(value) {
  return (value || '').trim();
}

export function getDeviceSummary(deviceEl) {
  const name = normalizeText(deviceEl.querySelector('.device-name')?.value) || 'Device';
  const chemicals = deviceEl.querySelectorAll('.chemical-entry').length;
  const cells = deviceEl.querySelectorAll('.cell-entry').length;
  const entries = deviceEl.querySelectorAll('.entry-entry').length;
  const reactions = deviceEl.querySelectorAll('.reaction-entry').length;

  return `${name} · ${chemicals} chemicals · ${cells} cells · ${entries} entries · ${reactions} reactions`;
}

export function getChemicalSummary(chemicalEl) {
  return normalizeText(chemicalEl.querySelector('.chem-name')?.value) || 'Chemical';
}

export function getCellSummary(cellEl) {
  return normalizeText(cellEl.querySelector('.cell-name')?.value) || 'Cell population';
}

export function getEntrySummary(entryEl) {
  const chemical = entryEl.querySelector('.entry-chemical')?.value || 'chemical';
  const x = entryEl.querySelector('.entry-x')?.value || 'x';
  const y = entryEl.querySelector('.entry-y')?.value || 'y';

  return `${chemical} at (${x}, ${y})`;
}

export function getReactionSummary(reactionEl) {
  return normalizeText(reactionEl.querySelector('.reaction-type')?.value) || 'Reaction';
}

export function getInterfaceSummary(interfaceEl) {
  const from = interfaceEl.querySelector('.iface-device1');
  const to = interfaceEl.querySelector('.iface-device2');

  const fromText = from?.selectedOptions?.[0]?.textContent || 'Origin';
  const toText = to?.selectedOptions?.[0]?.textContent || 'Destination';

  return `${fromText} → ${toText}`;
}

function updateSummary(selector, builder, root = document) {
  root.querySelectorAll(selector).forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = builder(el);
  });
}

export function updateCardSummaries(root = document) {
  updateSummary('.device-entry', getDeviceSummary, root);
  updateSummary('.chemical-entry', getChemicalSummary, root);
  updateSummary('.cell-entry', getCellSummary, root);
  updateSummary('.entry-entry', getEntrySummary, root);
  updateSummary('.reaction-entry', getReactionSummary, root);
  updateSummary('.interface-entry', getInterfaceSummary, root);
}
