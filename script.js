import { deviceCardTemplate } from './js/templates/deviceTemplates.js';
import { chemicalCardTemplate } from './js/templates/chemicalTemplates.js';
import { cellCardTemplate } from './js/templates/cellTemplates.js';
import { entryCardTemplate } from './js/templates/entryTemplates.js';
import { reactionCardTemplate } from './js/templates/reactionTemplates.js';
import { interfaceCardTemplate } from './js/templates/interfaceTemplates.js';

const API_URL = 'http://127.0.0.1:8000/run-simulation';

let deviceCounter = 0;
let interfaceCounter = 0;

const ALLOWED_INITIAL_PROFILES = ['uniform', 'zero', 'chamber'];
const ALLOWED_CELL_SHAPES = ['ellipse', 'circle', 'rectangle', 'limacon', 'ying', 'yang'];
const ALLOWED_REACTION_TYPES = ['cell_consumption_waste', 'sink', 'cells_killing_cells'];
const ALLOWED_INTERFACE_SIDES = ['left', 'right', 'top', 'bottom'];

const dom = {
  devicesContainer: document.getElementById('container-devices'),
  devicesEmpty: document.getElementById('devices-empty'),
  countDevices: document.getElementById('count-devices'),

  interfacesContainer: document.getElementById('container-interfaces'),
  interfacesEmpty: document.getElementById('interfaces-empty'),
  countInterfaces: document.getElementById('count-interfaces'),

  runBtn: document.getElementById('run-btn'),
  previewBtn: document.getElementById('preview-btn'),
  addDeviceBtn: document.getElementById('add-device-btn'),
  addInterfaceBtn: document.getElementById('add-interface-btn'),

  simT: document.getElementById('sim_T'),
  simDt: document.getElementById('sim_dt'),
  simRunSolver: document.getElementById('sim_run_solver'),
  simTimesToPlot: document.getElementById('sim_times_to_plot'),

  jsonPreview: document.getElementById('json-preview'),
  statusBox: document.getElementById('status-box'),
  warningsBox: document.getElementById('warnings-box'),
  serverBox: document.getElementById('server-box'),
  resultSummary: document.getElementById('result-summary'),
  plots: document.getElementById('plots')
};

function normalizeText(value) {
  return (value || '').trim();
}

function parseCsv(value) {
  return normalizeText(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function parseNumberCsv(value, label) {
  const raw = parseCsv(value);
  const values = raw.map(item => Number(item));

  values.forEach((num, index) => {
    if (!Number.isFinite(num)) {
      throw new Error(`${label}: value "${raw[index]}" is not a valid number.`);
    }
  });

  return values;
}

function readNumber(value, label, { integer = false, min = null, max = null, strictlyPositive = false } = {}) {
  const num = integer ? parseInt(value, 10) : parseFloat(value);

  if (!Number.isFinite(num)) {
    throw new Error(`${label} is not valid.`);
  }

  if (integer && !Number.isInteger(num)) {
    throw new Error(`${label} must be an integer.`);
  }

  if (min !== null && num < min) {
    throw new Error(`${label} must be >= ${min}.`);
  }

  if (max !== null && num > max) {
    throw new Error(`${label} must be <= ${max}.`);
  }

  if (strictlyPositive && num <= 0) {
    throw new Error(`${label} must be > 0.`);
  }

  return num;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildOptions(values, selected = '') {
  return values
    .map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`)
    .join('');
}

function buildTimesToPlot(T, dt) {
  const candidates = [0, 15, 30, 59, T];

  return [...new Set(
    candidates
      .map(v => Math.max(0, Math.min(v, T)))
      .map(v => Math.round(v / dt) * dt)
      .map(v => Number(v.toFixed(12)))
      .filter(v => v >= 0 && v <= T)
  )].sort((a, b) => a - b);
}

function setStatus(type, message) {
  dom.statusBox.className = `status-box status-${type}`;
  dom.statusBox.textContent = message;
}

function renderWarnings(warnings) {
  if (!warnings.length) {
    dom.warningsBox.classList.add('d-none');
    dom.warningsBox.innerHTML = '';
    return;
  }

  dom.warningsBox.classList.remove('d-none');
  dom.warningsBox.innerHTML = `
    <strong>Warnings</strong>
    <ul class="mb-0">
      ${warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}
    </ul>
  `;
}

function toggleCollapse(buttonEl) {
  const card = buttonEl.closest('[data-collapsible-card]');
  if (!card) return;

  const content = card.querySelector('.collapsible-content');
  if (!content) return;

  const collapsed = content.classList.toggle('is-collapsed');
  buttonEl.classList.toggle('collapsed', collapsed);
  buttonEl.innerHTML = collapsed ? '▸' : '▾';
}

function expandCollapsibleCard(card) {
  if (!card) return;

  const content = card.querySelector('.collapsible-content');
  const button = card.querySelector('.collapsible-toggle');

  if (!content || !button) return;

  content.classList.remove('is-collapsed');
  button.classList.remove('collapsed');
  button.innerHTML = '▾';
}

function revealNewElement(element) {
  if (!element) return;

  const parentDevice = element.closest('.device-entry');
  if (parentDevice) expandCollapsibleCard(parentDevice);

  expandCollapsibleCard(element);

  element.classList.add('just-added');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => element.classList.remove('just-added'), 1600);
}

function updateDeviceCounter() {
  const count = dom.devicesContainer.querySelectorAll('.device-entry').length;
  dom.countDevices.textContent = String(count);
  dom.devicesEmpty.classList.toggle('d-none', count > 0);
}

function updateInterfaceCounter() {
  const count = dom.interfacesContainer.querySelectorAll('.interface-entry').length;
  dom.countInterfaces.textContent = String(count);
  dom.interfacesEmpty.classList.toggle('d-none', count > 0);
}

function removeCard(buttonEl) {
  const card = buttonEl.closest('.dynamic-card');
  if (!card) return;

  card.remove();

  updateDeviceCounter();
  updateInterfaceCounter();
  refreshAllInterfaceCards();
  refreshAllEntryChemicalOptions();
  updateCardSummaries();
}

function addDevice() {
  deviceCounter += 1;
  const deviceId = `dev_${deviceCounter}`;

  dom.devicesContainer.insertAdjacentHTML('beforeend', deviceCardTemplate(deviceId, deviceCounter));

  const newElement = dom.devicesContainer.lastElementChild;

  updateDeviceCounter();
  refreshAllInterfaceCards();
  refreshAllEntryChemicalOptions();
  updateCardSummaries();
  revealNewElement(newElement);
}

function addInterface() {
  interfaceCounter += 1;
  const interfaceId = `iface_${interfaceCounter}`;

  dom.interfacesContainer.insertAdjacentHTML('beforeend', interfaceCardTemplate(interfaceId, interfaceCounter, {
    buildOptions,
    allowedInterfaceSides: ALLOWED_INTERFACE_SIDES
  }));

  const newElement = dom.interfacesContainer.lastElementChild;

  updateInterfaceCounter();
  refreshAllInterfaceCards();
  updateCardSummaries();
  revealNewElement(newElement);
}

function addNestedCard(buttonEl, type) {
  const deviceCard = buttonEl.closest('.device-entry');
  if (!deviceCard) return;

  expandCollapsibleCard(deviceCard);

  let container;
  let html;

  if (type === 'chemical') {
    container = deviceCard.querySelector('.device-chemicals');
    html = chemicalCardTemplate({
      buildOptions,
      allowedInitialProfiles: ALLOWED_INITIAL_PROFILES
    });
  } else if (type === 'cell') {
    container = deviceCard.querySelector('.device-cells');
    html = cellCardTemplate({
      buildOptions,
      allowedCellShapes: ALLOWED_CELL_SHAPES
    });
  } else if (type === 'entry') {
    container = deviceCard.querySelector('.device-entries');
    html = entryCardTemplate();
  } else if (type === 'reaction') {
    container = deviceCard.querySelector('.device-reactions');
    html = reactionCardTemplate({
      buildOptions,
      allowedReactionTypes: ALLOWED_REACTION_TYPES
    });
  }

  if (container && html) {
    container.insertAdjacentHTML('beforeend', html);

    const newElement = container.lastElementChild;

    refreshAllInterfaceCards();
    refreshAllEntryChemicalOptions();
    updateCardSummaries();
    revealNewElement(newElement);
  }
}

function getDeviceSummary(deviceEl) {
  const name = normalizeText(deviceEl.querySelector('.device-name')?.value) || 'Device';
  const chemicals = deviceEl.querySelectorAll('.chemical-entry').length;
  const cells = deviceEl.querySelectorAll('.cell-entry').length;
  const entries = deviceEl.querySelectorAll('.entry-entry').length;
  const reactions = deviceEl.querySelectorAll('.reaction-entry').length;

  return `${name} · ${chemicals} chemicals · ${cells} cells · ${entries} entries · ${reactions} reactions`;
}

function getChemicalSummary(chemicalEl) {
  return normalizeText(chemicalEl.querySelector('.chem-name')?.value) || 'Chemical';
}

function getCellSummary(cellEl) {
  return normalizeText(cellEl.querySelector('.cell-name')?.value) || 'Cell population';
}

function getEntrySummary(entryEl) {
  const chemical = entryEl.querySelector('.entry-chemical')?.value || 'chemical';
  const x = entryEl.querySelector('.entry-x')?.value || 'x';
  const y = entryEl.querySelector('.entry-y')?.value || 'y';

  return `${chemical} at (${x}, ${y})`;
}

function getReactionSummary(reactionEl) {
  return normalizeText(reactionEl.querySelector('.reaction-type')?.value) || 'Reaction';
}

function getInterfaceSummary(interfaceEl) {
  const from = interfaceEl.querySelector('.iface-device1');
  const to = interfaceEl.querySelector('.iface-device2');

  const fromText = from?.selectedOptions?.[0]?.textContent || 'Origin';
  const toText = to?.selectedOptions?.[0]?.textContent || 'Destination';

  return `${fromText} → ${toText}`;
}

function updateCardSummaries() {
  document.querySelectorAll('.device-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getDeviceSummary(el);
  });

  document.querySelectorAll('.chemical-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getChemicalSummary(el);
  });

  document.querySelectorAll('.cell-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getCellSummary(el);
  });

  document.querySelectorAll('.entry-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getEntrySummary(el);
  });

  document.querySelectorAll('.reaction-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getReactionSummary(el);
  });

  document.querySelectorAll('.interface-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getInterfaceSummary(el);
  });
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} must be one of: ${allowed.join(', ')}.`);
  }
}

function assertUniqueByName(items, label, deviceName) {
  const seen = new Set();

  items.forEach(item => {
    const key = item.name.toLowerCase();

    if (seen.has(key)) {
      throw new Error(`${label} "${item.name}" is duplicated in ${deviceName}.`);
    }

    seen.add(key);
  });
}

function collectChemicals(deviceEl, deviceName) {
  const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry')).map((el, index) => {
    const name = normalizeText(el.querySelector('.chem-name')?.value);

    if (!name) {
      throw new Error(`A chemical has no name in ${deviceName} at position ${index + 1}.`);
    }

    const initialProfile = normalizeText(el.querySelector('.chem-profile')?.value) || 'uniform';
    assertAllowed(initialProfile, ALLOWED_INITIAL_PROFILES, `Initial profile for ${name}`);

    return {
      name,
      max_concentration: readNumber(
        el.querySelector('.chem-max-concentration')?.value,
        `Max concentration of ${name} in ${deviceName}`,
        { min: 0 }
      ),
      diffusion_coef: readNumber(
        el.querySelector('.chem-coef')?.value,
        `Diffusion coefficient of ${name} in ${deviceName}`,
        { min: 0 }
      ),
      initial_profile: initialProfile
    };
  });

  assertUniqueByName(chemicals, 'Chemical', deviceName);
  return chemicals;
}

function collectCells(deviceEl, deviceName) {
  const cells = Array.from(deviceEl.querySelectorAll('.cell-entry')).map((el, index) => {
    const name = normalizeText(el.querySelector('.cell-name')?.value);

    if (!name) {
      throw new Error(`A cell population has no name in ${deviceName} at position ${index + 1}.`);
    }

    const shape = normalizeText(el.querySelector('.cell-shape')?.value) || 'ellipse';
    assertAllowed(shape, ALLOWED_CELL_SHAPES, `Shape for ${name}`);

    return {
      name,
      concentration: readNumber(
        el.querySelector('.cell-conc')?.value,
        `Concentration of ${name} in ${deviceName}`,
        { min: 0 }
      ),
      diffusion_coef: readNumber(
        el.querySelector('.cell-coef')?.value,
        `Diffusion coefficient of ${name} in ${deviceName}`,
        { min: 0 }
      ),
      shape
    };
  });

  assertUniqueByName(cells, 'Cell population', deviceName);
  return cells;
}

function collectEntries(deviceEl, deviceName, domain, chemicals) {
  const chemicalNames = new Set(chemicals.map(chemical => chemical.name));

  return Array.from(deviceEl.querySelectorAll('.entry-entry')).map((el, index) => {
    const x = readNumber(
      el.querySelector('.entry-x')?.value,
      `Entry ${index + 1} x position in ${deviceName}`,
      { min: 0, max: domain.Lx }
    );

    const y = readNumber(
      el.querySelector('.entry-y')?.value,
      `Entry ${index + 1} y position in ${deviceName}`,
      { min: 0, max: domain.Ly }
    );

    const chemical = normalizeText(el.querySelector('.entry-chemical')?.value);

    if (!chemical) {
      throw new Error(`Entry ${index + 1} in ${deviceName} must select a chemical.`);
    }

    if (!chemicalNames.has(chemical)) {
      throw new Error(`Entry ${index + 1} in ${deviceName} references missing chemical "${chemical}".`);
    }

    return {
      position: [x, y],
      chemical,
      concentration: readNumber(
        el.querySelector('.entry-concentration')?.value,
        `Entry ${index + 1} concentration in ${deviceName}`,
        { min: 0 }
      )
    };
  });
}

function collectReactions(deviceEl, deviceName) {
  return Array.from(deviceEl.querySelectorAll('.reaction-entry')).map((el, index) => {
    const type = normalizeText(el.querySelector('.reaction-type')?.value);

    if (!type) {
      throw new Error(`A reaction has no type in ${deviceName} at position ${index + 1}.`);
    }

    assertAllowed(type, ALLOWED_REACTION_TYPES, `Reaction type in ${deviceName}`);

    const coefficients = parseNumberCsv(
      el.querySelector('.reaction-coefficients')?.value,
      `Reaction coefficients in ${deviceName}`
    );

    const reaction = {
      type,
      substrates: parseCsv(el.querySelector('.reaction-substrates')?.value),
      products: parseCsv(el.querySelector('.reaction-products')?.value),
      biologicals: parseCsv(el.querySelector('.reaction-biologicals')?.value)
    };

    if (coefficients.length > 0) {
      reaction.coefficients = coefficients;
    }

    validateReactionSignature(reaction, deviceName, index + 1);

    return reaction;
  });
}

function validateReactionSignature(reaction, deviceName, reactionNumber) {
  if (reaction.type === 'cell_consumption_waste') {
    if (reaction.substrates.length !== 1 || reaction.products.length !== 1 || reaction.biologicals.length !== 1) {
      throw new Error(
        `Reaction ${reactionNumber} in ${deviceName}: cell_consumption_waste requires one substrate, one product and one biological.`
      );
    }
  }

  if (reaction.type === 'sink') {
    if (reaction.substrates.length < 1) {
      throw new Error(`Reaction ${reactionNumber} in ${deviceName}: sink requires at least one substrate.`);
    }
  }

  if (reaction.type === 'cells_killing_cells') {
    if (reaction.biologicals.length < 2) {
      throw new Error(`Reaction ${reactionNumber} in ${deviceName}: cells_killing_cells requires at least two biologicals.`);
    }
  }
}

function validateReactionSpecies(reaction, device, deviceName) {
  const chemicalNames = new Set(device.chemicals.map(chemical => chemical.name));
  const cellNames = new Set(device.cells.map(cell => cell.name));

  for (const substrate of reaction.substrates || []) {
    if (!chemicalNames.has(substrate)) {
      throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing substrate "${substrate}".`);
    }
  }

  for (const product of reaction.products || []) {
    if (!chemicalNames.has(product)) {
      throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing product "${product}".`);
    }
  }

  for (const biological of reaction.biologicals || []) {
    if (!cellNames.has(biological)) {
      throw new Error(`Reaction "${reaction.type}" in ${deviceName} references missing biological "${biological}".`);
    }
  }
}

function reactionFingerprint(reaction) {
  return JSON.stringify({
    type: reaction.type,
    substrates: [...(reaction.substrates || [])].sort(),
    products: [...(reaction.products || [])].sort(),
    biologicals: [...(reaction.biologicals || [])].sort(),
    coefficients: (reaction.coefficients || []).map(Number)
  });
}

function getDeviceSummaries() {
  return Array.from(dom.devicesContainer.querySelectorAll('.device-entry')).map((deviceEl, idx) => {
    const id = normalizeText(deviceEl.dataset.deviceId) || `dev_${idx + 1}`;
    const name = normalizeText(deviceEl.querySelector('.device-name')?.value) || id;
    const Lx = Number(deviceEl.querySelector('.dev_Lx')?.value);
    const Ly = Number(deviceEl.querySelector('.dev_Ly')?.value);
    const Nx = Number(deviceEl.querySelector('.dev_Nx')?.value);
    const Ny = Number(deviceEl.querySelector('.dev_Ny')?.value);

    const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name'))
      .map(input => normalizeText(input.value))
      .filter(Boolean);

    return { id, name, Lx, Ly, Nx, Ny, chemicals };
  });
}

function sideMax(device, side) {
  return side === 'left' || side === 'right' ? device.Ly : device.Lx;
}

function sideSpacing(device, side) {
  return side === 'left' || side === 'right'
    ? device.Ly / device.Ny
    : device.Lx / device.Nx;
}

function pointForSide(device, side, value) {
  if (side === 'left') return [0.0, value];
  if (side === 'right') return [device.Lx, value];
  if (side === 'bottom') return [value, 0.0];
  if (side === 'top') return [value, device.Ly];

  throw new Error(`Unknown interface side: ${side}.`);
}

function buildInterfaceSideLoc(device, side, startValue, stopValue, label) {
  const max = sideMax(device, side);

  if (startValue < 0 || startValue > max) {
    throw new Error(`${label}: start must be between 0 and ${max}.`);
  }

  if (stopValue < 0 || stopValue > max) {
    throw new Error(`${label}: end must be between 0 and ${max}.`);
  }

  if (startValue === stopValue) {
    throw new Error(`${label}: the segment cannot have zero length.`);
  }

  const start = Math.min(startValue, stopValue);
  const stop = Math.max(startValue, stopValue);

  return {
    start,
    stop,
    loc: {
      start: pointForSide(device, side, start),
      stop: pointForSide(device, side, stop)
    }
  };
}

function interfaceGridLength(device, side, start, stop) {
  const length = Math.abs(stop - start);
  const spacing = sideSpacing(device, side);

  if (!Number.isFinite(spacing) || spacing <= 0) {
    return NaN;
  }

  return Math.round(length / spacing);
}

function updateInterfaceLimits(interfaceEl, summaries) {
  const dev1Id = interfaceEl.querySelector('.iface-device1')?.value;
  const dev2Id = interfaceEl.querySelector('.iface-device2')?.value;
  const side1 = interfaceEl.querySelector('.iface-side1')?.value || 'left';
  const side2 = interfaceEl.querySelector('.iface-side2')?.value || 'right';

  const device1 = summaries.find(d => d.id === dev1Id);
  const device2 = summaries.find(d => d.id === dev2Id);

  const limit1 = interfaceEl.querySelector('.iface-limit1');
  const limit2 = interfaceEl.querySelector('.iface-limit2');

  limit1.value = device1 && Number.isFinite(device1.Lx) && Number.isFinite(device1.Ly) ? sideMax(device1, side1) : '-';
  limit2.value = device2 && Number.isFinite(device2.Lx) && Number.isFinite(device2.Ly) ? sideMax(device2, side2) : '-';
}

function renderInterfaceDiffusionRows(interfaceEl, summaries) {
  const dev1Id = interfaceEl.querySelector('.iface-device1')?.value;
  const dev2Id = interfaceEl.querySelector('.iface-device2')?.value;

  const device1 = summaries.find(d => d.id === dev1Id);
  const device2 = summaries.find(d => d.id === dev2Id);

  const noteEl = interfaceEl.querySelector('.iface-chemicals-note');
  const container = interfaceEl.querySelector('.iface-diffusion-container');

  const previous = {};

  container.querySelectorAll('.iface-diffusion-entry').forEach(row => {
    const chem = row.dataset.chemical;
    const input = row.querySelector('.iface-diffusion-value');

    if (chem && input) previous[chem] = input.value;
  });

  container.innerHTML = '';

  if (!device1 || !device2) {
    noteEl.textContent = 'Select two devices to display shared chemicals.';
    updateCardSummaries();
    return;
  }

  const commonChemicals = device1.chemicals.filter(name => device2.chemicals.includes(name));

  if (commonChemicals.length === 0) {
    noteEl.textContent = 'These devices do not share any chemicals.';
    updateCardSummaries();
    return;
  }

  noteEl.textContent = 'Enter one D_interface value for each shared chemical.';

  commonChemicals.forEach(chem => {
    const value = previous[chem] ?? '';

    container.insertAdjacentHTML('beforeend', `
      <div class="col-md-4 iface-diffusion-entry" data-chemical="${escapeHtml(chem)}">
        <label class="form-label">${escapeHtml(chem)}</label>
        <input
          type="number"
          class="form-control iface-diffusion-value"
          data-chemical="${escapeHtml(chem)}"
          min="0"
          step="any"
          value="${escapeHtml(value)}"
          placeholder="Example: 0.00065"
        >
      </div>
    `);
  });

  updateCardSummaries();
}

function refreshInterfaceDeviceOptions(interfaceEl, summaries) {
  const select1 = interfaceEl.querySelector('.iface-device1');
  const select2 = interfaceEl.querySelector('.iface-device2');

  const old1 = select1.value;
  const old2 = select2.value;

  const options = ['<option value="">Select device</option>']
    .concat(
      summaries.map(d => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} (${escapeHtml(d.id)})</option>`)
    )
    .join('');

  select1.innerHTML = options;
  select2.innerHTML = options;

  if (summaries.some(d => d.id === old1)) select1.value = old1;
  if (summaries.some(d => d.id === old2)) select2.value = old2;

  if (!select1.value && summaries[0]) select1.value = summaries[0].id;
  if (!select2.value && summaries[1]) select2.value = summaries[1].id;

  updateInterfaceLimits(interfaceEl, summaries);
  renderInterfaceDiffusionRows(interfaceEl, summaries);
}

function refreshAllInterfaceCards() {
  const summaries = getDeviceSummaries();

  dom.interfacesContainer.querySelectorAll('.interface-entry').forEach(interfaceEl => {
    refreshInterfaceDeviceOptions(interfaceEl, summaries);
  });
}

function refreshEntryChemicalOptionsForDevice(deviceEl) {
  const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name'))
    .map(input => normalizeText(input.value))
    .filter(Boolean);

  const options = chemicals.length
    ? chemicals.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')
    : '<option value="">No chemicals available</option>';

  deviceEl.querySelectorAll('.entry-chemical').forEach(select => {
    const oldValue = select.value;
    select.innerHTML = options;

    if (chemicals.includes(oldValue)) {
      select.value = oldValue;
    }
  });
}

function refreshAllEntryChemicalOptions() {
  document.querySelectorAll('.device-entry').forEach(refreshEntryChemicalOptionsForDevice);
}

function collectSimulation(warnings) {
  const T = readNumber(dom.simT.value, 'Total simulation time T', { strictlyPositive: true });
  const dt = readNumber(dom.simDt.value, 'Time step dt', { strictlyPositive: true });

  if (dt > T) {
    throw new Error('Time step dt must be lower than or equal to total simulation time T.');
  }

  const manualTimes = parseNumberCsv(dom.simTimesToPlot.value, 'Times to plot');

  const timesToPlot = manualTimes.length > 0
    ? manualTimes
    : buildTimesToPlot(T, dt);

  timesToPlot.forEach(time => {
    if (time < 0 || time > T) {
      throw new Error(`Time to plot ${time} must be between 0 and T (${T}).`);
    }

    const step = time / dt;
    if (Math.abs(step - Math.round(step)) > 1e-8) {
      warnings.push(`Time to plot ${time} is not aligned with dt=${dt}; the backend may round it.`);
    }
  });

  return {
    T,
    dt,
    times_to_plot: timesToPlot,
    run_solver: dom.simRunSolver.value === 'true'
  };
}

function collectDevices(warnings) {
  const deviceEls = Array.from(dom.devicesContainer.querySelectorAll('.device-entry'));

  if (deviceEls.length === 0) {
    throw new Error('At least one device is required.');
  }

  const devices = deviceEls.map((deviceEl, index) => {
    const id = normalizeText(deviceEl.dataset.deviceId) || `dev_${index + 1}`;
    const deviceName = normalizeText(deviceEl.querySelector('.device-name')?.value) || id;

    const domain = {
      Lx: readNumber(deviceEl.querySelector('.dev_Lx')?.value, `Lx of ${deviceName}`, { strictlyPositive: true }),
      Ly: readNumber(deviceEl.querySelector('.dev_Ly')?.value, `Ly of ${deviceName}`, { strictlyPositive: true }),
      Nx: readNumber(deviceEl.querySelector('.dev_Nx')?.value, `Nx of ${deviceName}`, { integer: true, min: 3 }),
      Ny: readNumber(deviceEl.querySelector('.dev_Ny')?.value, `Ny of ${deviceName}`, { integer: true, min: 3 })
    };

    const dx = domain.Lx / domain.Nx;
    const dy = domain.Ly / domain.Ny;

    if (dx < 0.0001 || dy < 0.0001) {
      warnings.push(`${deviceName}: grid spacing is very small (dx=${dx}, dy=${dy}). This may cause numerical instability.`);
    }

    const chemicals = collectChemicals(deviceEl, deviceName);
    const cells = collectCells(deviceEl, deviceName);
    const entries = collectEntries(deviceEl, deviceName, domain, chemicals);
    const reactions = collectReactions(deviceEl, deviceName);

    const device = {
      id,
      domain,
      entries,
      chemicals,
      cells,
      reactions
    };

    reactions.forEach(reaction => validateReactionSpecies(reaction, device, deviceName));

    return device;
  });

  const ids = new Set();

  devices.forEach(device => {
    if (ids.has(device.id)) {
      throw new Error(`Device id "${device.id}" is duplicated.`);
    }

    ids.add(device.id);
  });

  return devices;
}

function collectInterfaces(devices, warnings) {
  const deviceById = Object.fromEntries(devices.map(device => [device.id, device]));

  return Array.from(dom.interfacesContainer.querySelectorAll('.interface-entry')).map((el, index) => {
    const device1Id = normalizeText(el.querySelector('.iface-device1')?.value);
    const device2Id = normalizeText(el.querySelector('.iface-device2')?.value);

    if (!device1Id || !deviceById[device1Id]) {
      throw new Error(`Interface ${index + 1}: device 1 was not found.`);
    }

    if (!device2Id || !deviceById[device2Id]) {
      throw new Error(`Interface ${index + 1}: device 2 was not found.`);
    }

    if (device1Id === device2Id) {
      throw new Error(`Interface ${index + 1}: device 1 and device 2 must be different.`);
    }

    const device1 = deviceById[device1Id];
    const device2 = deviceById[device2Id];

    const d1Info = {
      id: device1.id,
      ...device1.domain
    };

    const d2Info = {
      id: device2.id,
      ...device2.domain
    };

    const side1 = normalizeText(el.querySelector('.iface-side1')?.value);
    const side2 = normalizeText(el.querySelector('.iface-side2')?.value);

    assertAllowed(side1, ALLOWED_INTERFACE_SIDES, `Interface ${index + 1} side 1`);
    assertAllowed(side2, ALLOWED_INTERFACE_SIDES, `Interface ${index + 1} side 2`);

    const start1 = readNumber(el.querySelector('.iface-start1')?.value, `Interface ${index + 1} segment 1 start`);
    const stop1 = readNumber(el.querySelector('.iface-stop1')?.value, `Interface ${index + 1} segment 1 end`);
    const start2 = readNumber(el.querySelector('.iface-start2')?.value, `Interface ${index + 1} segment 2 start`);
    const stop2 = readNumber(el.querySelector('.iface-stop2')?.value, `Interface ${index + 1} segment 2 end`);

    const sideLoc1 = buildInterfaceSideLoc(d1Info, side1, start1, stop1, `Interface ${index + 1}, device 1`);
    const sideLoc2 = buildInterfaceSideLoc(d2Info, side2, start2, stop2, `Interface ${index + 1}, device 2`);

    const n1 = interfaceGridLength(d1Info, side1, sideLoc1.start, sideLoc1.stop);
    const n2 = interfaceGridLength(d2Info, side2, sideLoc2.start, sideLoc2.stop);

    if (!Number.isFinite(n1) || !Number.isFinite(n2) || n1 <= 0 || n2 <= 0) {
      throw new Error(`Interface ${index + 1}: could not compute interface grid size.`);
    }

    if (n1 !== n2) {
      throw new Error(`Interface ${index + 1}: mismatched interface discretization (${n1} vs ${n2} grid intervals).`);
    }

    const chemicals1 = device1.chemicals.map(chemical => chemical.name);
    const chemicals2 = device2.chemicals.map(chemical => chemical.name);
    const commonChemicals = chemicals1.filter(name => chemicals2.includes(name));

    const missingShared = [
      ...chemicals1.filter(name => !chemicals2.includes(name)).map(name => `${name} missing in ${device2.id}`),
      ...chemicals2.filter(name => !chemicals1.includes(name)).map(name => `${name} missing in ${device1.id}`)
    ];

    if (missingShared.length > 0) {
      warnings.push(`Interface ${index + 1}: only chemicals present in both devices will diffuse. ${missingShared.join('; ')}.`);
    }

    if (commonChemicals.length === 0) {
      warnings.push(`Interface ${index + 1}: the selected devices do not share any chemicals.`);
    }

    const D_interface = {};

    el.querySelectorAll('.iface-diffusion-value').forEach(input => {
      const chemical = normalizeText(input.dataset.chemical);
      if (!chemical) return;

      D_interface[chemical] = readNumber(
        input.value,
        `Interface ${index + 1} D_interface for ${chemical}`,
        { min: 0 }
      );
    });

    commonChemicals.forEach(chemical => {
      if (!(chemical in D_interface)) {
        warnings.push(`Interface ${index + 1}: D_interface for ${chemical} was not provided; defaulting to 0.`);
        D_interface[chemical] = 0;
      }
    });

    return {
      device1: device1Id,
      device2: device2Id,
      locs: {
        [device1Id]: sideLoc1.loc,
        [device2Id]: sideLoc2.loc
      },
      D_interface
    };
  });
}

function collectGlobalReactions(devices, warnings) {
  const fingerprints = new Set();
  const reactions = [];

  devices.forEach(device => {
    (device.reactions || []).forEach(reaction => {
      const fingerprint = reactionFingerprint(reaction);

      if (!fingerprints.has(fingerprint)) {
        fingerprints.add(fingerprint);
        reactions.push(reaction);
      }
    });
  });

  if (reactions.length === 0) {
    warnings.push('No reactions have been defined.');
  }

  return reactions;
}

function validateUnusedChemicals(devices, interfaces, reactions, warnings) {
  const chemicalsUsedInInterfaces = new Set();

  interfaces.forEach(iface => {
    Object.keys(iface.D_interface || {}).forEach(chemical => chemicalsUsedInInterfaces.add(chemical));
  });

  const chemicalsUsedInReactions = new Set();

  reactions.forEach(reaction => {
    [...(reaction.substrates || []), ...(reaction.products || [])].forEach(chemical => {
      chemicalsUsedInReactions.add(chemical);
    });
  });

  devices.forEach(device => {
    device.chemicals.forEach(chemical => {
      if (!chemicalsUsedInInterfaces.has(chemical.name) && !chemicalsUsedInReactions.has(chemical.name)) {
        warnings.push(`${device.id}: chemical "${chemical.name}" is not used by any interface or reaction.`);
      }
    });
  });
}

function buildConfig() {
  const warnings = [];

  const simulation = collectSimulation(warnings);
  const devices = collectDevices(warnings);
  const interfaces = collectInterfaces(devices, warnings);
  const reactions = collectGlobalReactions(devices, warnings);

  validateUnusedChemicals(devices, interfaces, reactions, warnings);

  const exportDevices = devices.map(device => {
    const cloned = { ...device };
    delete cloned.reactions;
    return cloned;
  });

  return {
    config: {
      simulation,
      devices: exportDevices,
      interfaces,
      reactions
    },
    warnings
  };
}

function previewConfig() {
  try {
    const { config, warnings } = buildConfig();

    dom.jsonPreview.textContent = JSON.stringify(config, null, 2);
    renderWarnings(warnings);
    setStatus(warnings.length ? 'running' : 'success', warnings.length ? 'JSON generated with warnings.' : 'JSON generated successfully.');
    return { config, warnings };
  } catch (error) {
    dom.jsonPreview.textContent = 'JSON generation failed.';
    renderWarnings([]);
    setStatus('error', error.message);
    throw error;
  }
}

async function runSimulation() {
  let config;

  try {
    ({ config } = previewConfig());
  } catch {
    return;
  }

  setStatus('running', 'Running simulation...');
  dom.resultSummary.innerHTML = '';
  dom.plots.innerHTML = '';
  dom.serverBox.classList.add('d-none');
  dom.serverBox.innerHTML = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = payload?.detail || response.statusText || 'Unknown backend error.';
      throw new Error(detail);
    }

    setStatus('success', payload?.message || 'Simulation finished successfully.');
    renderBackendResults(payload);
  } catch (error) {
    setStatus('error', error.message);
  }
}

function renderBackendResults(payload) {
  if (!payload) return;

  const devices = payload.devices || [];
  const images = payload.images || [];

  dom.resultSummary.innerHTML = `
    <div class="result-card">
      <ul class="result-list">
        <li><strong>Run id:</strong> ${escapeHtml(payload.run_id || '-')}</li>
        <li><strong>Devices:</strong> ${escapeHtml(devices.join(', ') || '-')}</li>
        <li><strong>Interfaces:</strong> ${escapeHtml(payload.n_interfaces ?? '-')}</li>
        <li><strong>Reactions:</strong> ${escapeHtml(payload.n_reactions ?? '-')}</li>
      </ul>
    </div>
  `;

  dom.plots.innerHTML = '';

  images.forEach(imagePath => {
    const absolutePath = imagePath.startsWith('http')
      ? imagePath
      : `http://127.0.0.1:8000${imagePath}`;

    dom.plots.insertAdjacentHTML('beforeend', `
      <div class="result-card">
        <img class="plot-img" src="${escapeHtml(absolutePath)}" alt="Simulation plot">
        <a class="plot-link" href="${escapeHtml(absolutePath)}" target="_blank" rel="noopener">Open image</a>
      </div>
    `);
  });

  dom.serverBox.classList.remove('d-none');
  dom.serverBox.innerHTML = `
    <div class="result-card">
      <strong>Backend response</strong>
      <pre class="json-preview mt-3 mb-0">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
    </div>
  `;
}

document.addEventListener('click', event => {
  const target = event.target;

  if (target.matches('#add-device-btn')) {
    addDevice();
  }

  if (target.matches('#add-interface-btn')) {
    addInterface();
  }

  if (target.matches('[data-action="toggle-collapse"], .collapsible-toggle')) {
    toggleCollapse(target);
  }

  if (target.matches('.remove-card-btn')) {
    removeCard(target);
  }

  if (target.matches('.add-chemical-btn')) {
    addNestedCard(target, 'chemical');
  }

  if (target.matches('.add-cell-btn')) {
    addNestedCard(target, 'cell');
  }

  if (target.matches('.add-entry-btn')) {
    addNestedCard(target, 'entry');
  }

  if (target.matches('.add-reaction-btn')) {
    addNestedCard(target, 'reaction');
  }
});

document.addEventListener('input', event => {
  if (
    event.target.matches('.device-name') ||
    event.target.matches('.chem-name') ||
    event.target.matches('.cell-name') ||
    event.target.matches('.entry-x') ||
    event.target.matches('.entry-y') ||
    event.target.matches('.reaction-type')
  ) {
    updateCardSummaries();
  }

  if (
    event.target.matches('.chem-name') ||
    event.target.matches('.dev_Lx') ||
    event.target.matches('.dev_Ly') ||
    event.target.matches('.dev_Nx') ||
    event.target.matches('.dev_Ny')
  ) {
    refreshAllInterfaceCards();
    refreshAllEntryChemicalOptions();
  }
});

document.addEventListener('change', event => {
  if (
    event.target.matches('.iface-device1') ||
    event.target.matches('.iface-device2') ||
    event.target.matches('.iface-side1') ||
    event.target.matches('.iface-side2')
  ) {
    refreshAllInterfaceCards();
    updateCardSummaries();
  }

  if (
    event.target.matches('.entry-chemical') ||
    event.target.matches('.reaction-type') ||
    event.target.matches('.chem-profile') ||
    event.target.matches('.cell-shape')
  ) {
    updateCardSummaries();
  }
});

dom.runBtn.addEventListener('click', runSimulation);
dom.previewBtn.addEventListener('click', () => {
  try {
    previewConfig();
  } catch {
    // Status box already contains the error.
  }
});

addDevice();
