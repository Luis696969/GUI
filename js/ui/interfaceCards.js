import { escapeHtml } from '../utils/html.js';
import { updateCardSummaries } from './summaries.js';

const sideMax = (device, side) => (side === 'left' || side === 'right' ? device.Ly : device.Lx);

export function updateInterfaceLimits(interfaceEl, summaries) {
  const device1 = summaries.find((d) => d.id === interfaceEl.querySelector('.iface-device1')?.value);
  const device2 = summaries.find((d) => d.id === interfaceEl.querySelector('.iface-device2')?.value);
  const side1 = interfaceEl.querySelector('.iface-side1')?.value || 'left';
  const side2 = interfaceEl.querySelector('.iface-side2')?.value || 'right';

  interfaceEl.querySelector('.iface-limit1').value = device1 && Number.isFinite(device1.Lx) && Number.isFinite(device1.Ly) ? sideMax(device1, side1) : '-';
  interfaceEl.querySelector('.iface-limit2').value = device2 && Number.isFinite(device2.Lx) && Number.isFinite(device2.Ly) ? sideMax(device2, side2) : '-';
}

export function renderInterfaceDiffusionRows(interfaceEl, summaries) {
  const device1 = summaries.find((d) => d.id === interfaceEl.querySelector('.iface-device1')?.value);
  const device2 = summaries.find((d) => d.id === interfaceEl.querySelector('.iface-device2')?.value);
  const noteEl = interfaceEl.querySelector('.iface-chemicals-note');
  const container = interfaceEl.querySelector('.iface-diffusion-container');

  const previous = Object.fromEntries(
    Array.from(container.querySelectorAll('.iface-diffusion-entry'))
      .map((row) => [row.dataset.chemical, row.querySelector('.iface-diffusion-value')?.value])
      .filter(([chemical, value]) => chemical && value !== undefined)
  );

  container.innerHTML = '';

  if (!device1 || !device2) {
    noteEl.textContent = 'Select two devices to display shared chemicals.';
    updateCardSummaries();
    return;
  }

  const commonChemicals = device1.chemicals.filter((name) => device2.chemicals.includes(name));
  if (!commonChemicals.length) {
    noteEl.textContent = 'These devices do not share any chemicals.';
    updateCardSummaries();
    return;
  }

  noteEl.textContent = 'Enter one D_interface value for each shared chemical.';
  commonChemicals.forEach((chem) => {
    container.insertAdjacentHTML('beforeend', `<div class="col-md-4 iface-diffusion-entry" data-chemical="${escapeHtml(chem)}"><label class="form-label">${escapeHtml(chem)}</label><input type="number" class="form-control iface-diffusion-value" data-chemical="${escapeHtml(chem)}" min="0" step="any" value="${escapeHtml(previous[chem] ?? '')}"></div>`);
  });

  updateCardSummaries();
}

export function refreshInterfaceDeviceOptions(interfaceEl, summaries) {
  const select1 = interfaceEl.querySelector('.iface-device1');
  const select2 = interfaceEl.querySelector('.iface-device2');
  const old1 = select1.value;
  const old2 = select2.value;

  const options = ['<option value="">Select device</option>', ...summaries.map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} (${escapeHtml(d.id)})</option>`)].join('');
  select1.innerHTML = options;
  select2.innerHTML = options;

  if (summaries.some((d) => d.id === old1)) select1.value = old1;
  if (summaries.some((d) => d.id === old2)) select2.value = old2;
  if (!select1.value && summaries[0]) select1.value = summaries[0].id;
  if (!select2.value && summaries[1]) select2.value = summaries[1].id;

  updateInterfaceLimits(interfaceEl, summaries);
  renderInterfaceDiffusionRows(interfaceEl, summaries);
}

export function refreshAllInterfaceCards(dom, summaries) {
  dom.interfacesContainer.querySelectorAll('.interface-entry').forEach((interfaceEl) => refreshInterfaceDeviceOptions(interfaceEl, summaries));
}
