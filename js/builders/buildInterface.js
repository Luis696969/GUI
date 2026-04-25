import { ALLOWED_INTERFACE_SIDES } from '../config/constants.js';
import { escapeHtml } from '../utils/html.js';
import { normalizeText, readNumber } from '../utils/parse.js';
import { assertAllowed } from '../validators/field.js';
import { validateInterfaceDevicesDiffer, validateInterfaceDiffusion, validateInterfaceSegmentPointsInDomain } from '../validators/validateInterface.js';
import { updateCardSummaries } from '../ui/summaries.js';
import { compactObject } from './buildUtils.js';

const sideMax = (device, side) => (side === 'left' || side === 'right' ? device.Ly : device.Lx);
const sideSpacing = (device, side) => (side === 'left' || side === 'right' ? device.Ly / device.Ny : device.Lx / device.Nx);
const pointForSide = (device, side, value) => ({ left: [0, value], right: [device.Lx, value], bottom: [value, 0], top: [value, device.Ly] }[side]);

function buildInterfaceSideLoc(device, side, startValue, stopValue, label) {
  const max = sideMax(device, side);
  if (startValue < 0 || startValue > max) throw new Error(`${label}: start must be between 0 and ${max}.`);
  if (stopValue < 0 || stopValue > max) throw new Error(`${label}: end must be between 0 and ${max}.`);
  if (startValue === stopValue) throw new Error(`${label}: the segment cannot have zero length.`);
  const start = Math.min(startValue, stopValue);
  const stop = Math.max(startValue, stopValue);
  return { start, stop, loc: { start: pointForSide(device, side, start), stop: pointForSide(device, side, stop) } };
}

const interfaceGridLength = (device, side, start, stop) => Math.round(Math.abs(stop - start) / sideSpacing(device, side));

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

export function buildInterface(interfaceEl, index, deviceById, warnings) {
  const device1Id = normalizeText(interfaceEl.querySelector('.iface-device1')?.value);
  const device2Id = normalizeText(interfaceEl.querySelector('.iface-device2')?.value);
  if (!device1Id || !deviceById[device1Id]) throw new Error(`Interface ${index + 1}: device 1 was not found.`);
  if (!device2Id || !deviceById[device2Id]) throw new Error(`Interface ${index + 1}: device 2 was not found.`);
  validateInterfaceDevicesDiffer(device1Id, device2Id, index);

  const device1 = { id: deviceById[device1Id].id, ...deviceById[device1Id].domain };
  const device2 = { id: deviceById[device2Id].id, ...deviceById[device2Id].domain };

  const side1 = normalizeText(interfaceEl.querySelector('.iface-side1')?.value);
  const side2 = normalizeText(interfaceEl.querySelector('.iface-side2')?.value);
  assertAllowed(side1, ALLOWED_INTERFACE_SIDES, `Interface ${index + 1} side 1`);
  assertAllowed(side2, ALLOWED_INTERFACE_SIDES, `Interface ${index + 1} side 2`);

  const sideLoc1 = buildInterfaceSideLoc(
    device1,
    side1,
    readNumber(interfaceEl.querySelector('.iface-start1')?.value, `Interface ${index + 1} segment 1 start`),
    readNumber(interfaceEl.querySelector('.iface-stop1')?.value, `Interface ${index + 1} segment 1 end`),
    `Interface ${index + 1}, device 1`
  );

  const sideLoc2 = buildInterfaceSideLoc(
    device2,
    side2,
    readNumber(interfaceEl.querySelector('.iface-start2')?.value, `Interface ${index + 1} segment 2 start`),
    readNumber(interfaceEl.querySelector('.iface-stop2')?.value, `Interface ${index + 1} segment 2 end`),
    `Interface ${index + 1}, device 2`
  );

  const n1 = interfaceGridLength(device1, side1, sideLoc1.start, sideLoc1.stop);
  const n2 = interfaceGridLength(device2, side2, sideLoc2.start, sideLoc2.stop);
  validateInterfaceSegmentPointsInDomain(sideLoc1.loc, device1, `Interface ${index + 1}, device 1`);
  validateInterfaceSegmentPointsInDomain(sideLoc2.loc, device2, `Interface ${index + 1}, device 2`);
  if (!Number.isFinite(n1) || !Number.isFinite(n2) || n1 <= 0 || n2 <= 0) throw new Error(`Interface ${index + 1}: could not compute interface grid size.`);
  if (n1 !== n2) throw new Error(`Interface ${index + 1}: mismatched interface discretization (${n1} vs ${n2} grid intervals).`);

  const chemicals1 = deviceById[device1Id].chemicals.map((chemical) => chemical.name);
  const chemicals2 = deviceById[device2Id].chemicals.map((chemical) => chemical.name);
  const commonChemicals = chemicals1.filter((name) => chemicals2.includes(name));
  if (!commonChemicals.length) warnings.push(`Interface ${index + 1}: the selected devices do not share any chemicals.`);

  const D_interface = {};
  interfaceEl.querySelectorAll('.iface-diffusion-value').forEach((input) => {
    const chemical = normalizeText(input.dataset.chemical);
    if (chemical) {
      D_interface[chemical] = readNumber(input.value, `Interface ${index + 1} D_interface for ${chemical}`, { min: 0 });
    }
  });

  commonChemicals.forEach((chemical) => {
    if (!(chemical in D_interface)) {
      D_interface[chemical] = 0;
      warnings.push(`Interface ${index + 1}: D_interface for ${chemical} was not provided; defaulting to 0.`);
    }
  });
  validateInterfaceDiffusion(D_interface, `Interface ${index + 1}`);

  return compactObject({
    device1: device1Id,
    device2: device2Id,
    locs: {
      device1: sideLoc1.loc,
      device2: sideLoc2.loc
    },
    D_interface
  });
}

export function buildInterfaces(dom, devices, warnings) {
  const deviceById = Object.fromEntries(devices.map((device) => [device.id, device]));
  return Array.from(dom.interfacesContainer.querySelectorAll('.interface-entry')).map((interfaceEl, index) => buildInterface(interfaceEl, index, deviceById, warnings));
}
