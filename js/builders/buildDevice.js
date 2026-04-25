import { normalizeText, readNumber } from '../utils/parse.js';
import { buildChemicals } from './buildChemical.js';
import { buildCells } from './buildCell.js';
import { buildEntries } from './buildEntry.js';
import { buildReactions } from './buildReaction.js';
import { validateDomainGrid } from '../validators/validateField.js';
import { validateReactionParticipantsExist } from '../validators/validateReaction.js';
import { compactObject } from './buildUtils.js';

export function getDeviceSummaries(dom) {
  return Array.from(dom.devicesContainer.querySelectorAll('.device-entry')).map((deviceEl, idx) => ({
    id: normalizeText(deviceEl.dataset.deviceId) || `dev_${idx + 1}`,
    name: normalizeText(deviceEl.querySelector('.device-name')?.value) || `dev_${idx + 1}`,
    Lx: Number(deviceEl.querySelector('.dev_Lx')?.value),
    Ly: Number(deviceEl.querySelector('.dev_Ly')?.value),
    Nx: Number(deviceEl.querySelector('.dev_Nx')?.value),
    Ny: Number(deviceEl.querySelector('.dev_Ny')?.value),
    chemicals: Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name')).map((input) => normalizeText(input.value)).filter(Boolean)
  }));
}

export function buildDevice(deviceEl, index, warnings) {
  const id = normalizeText(deviceEl.dataset.deviceId) || `dev_${index + 1}`;
  const deviceName = normalizeText(deviceEl.querySelector('.device-name')?.value) || id;

  const domain = {
    Lx: readNumber(deviceEl.querySelector('.dev_Lx')?.value, `Lx of ${deviceName}`, { strictlyPositive: true }),
    Ly: readNumber(deviceEl.querySelector('.dev_Ly')?.value, `Ly of ${deviceName}`, { strictlyPositive: true }),
    Nx: readNumber(deviceEl.querySelector('.dev_Nx')?.value, `Nx of ${deviceName}`, { integer: true, min: 3 }),
    Ny: readNumber(deviceEl.querySelector('.dev_Ny')?.value, `Ny of ${deviceName}`, { integer: true, min: 3 })
  };
  validateDomainGrid(domain, deviceName);

  const dx = domain.Lx / domain.Nx;
  const dy = domain.Ly / domain.Ny;
  if (dx < 0.0001 || dy < 0.0001) warnings.push(`${deviceName}: grid spacing is very small (dx=${dx}, dy=${dy}). This may cause numerical instability.`);

  const chemicals = buildChemicals(deviceEl, deviceName);
  const cells = buildCells(deviceEl, deviceName);
  const entries = buildEntries(deviceEl, deviceName, domain, chemicals);
  const reactions = buildReactions(deviceEl, deviceName);

  const device = compactObject({ id, domain, entries, chemicals, cells, reactions });
  reactions.forEach((reaction) => validateReactionParticipantsExist(reaction, device, deviceName));
  return device;
}

export function buildDevices(dom, warnings) {
  const deviceEls = Array.from(dom.devicesContainer.querySelectorAll('.device-entry'));
  if (deviceEls.length === 0) throw new Error('At least one device is required.');

  const devices = deviceEls.map((deviceEl, index) => buildDevice(deviceEl, index, warnings));

  const ids = new Set();
  devices.forEach((device) => {
    if (ids.has(device.id)) throw new Error(`Device id "${device.id}" is duplicated.`);
    ids.add(device.id);
  });

  return devices;
}
