import {
  addDevice,
  addInterface,
  addNestedCard,
  bindDom,
  copyPreviewJson,
  downloadPreviewJson,
  previewConfig,
  refreshAllEntryChemicalOptions,
  refreshAllInterfaceCards,
  removeCard,
  runSimulation,
  toggleCollapse,
  updateCardSummaries
} from './app.js';

const dom = {
  devicesContainer: document.getElementById('container-devices'),
  devicesEmpty: document.getElementById('devices-empty'),
  countDevices: document.getElementById('count-devices'),

  interfacesContainer: document.getElementById('container-interfaces'),
  interfacesEmpty: document.getElementById('interfaces-empty'),
  countInterfaces: document.getElementById('count-interfaces'),

  runBtn: document.getElementById('run-btn'),
  previewBtn: document.getElementById('preview-btn'),
  copyBtn: document.getElementById('copy-btn'),
  downloadBtn: document.getElementById('download-btn'),

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

bindDom(dom);

document.addEventListener('click', event => {
  const target = event.target;

  if (target.matches('.collapsible-toggle')) {
    toggleCollapse(target);
  }

  if (target.matches('#add-device-btn')) {
    addDevice();
  }

  if (target.matches('#add-interface-btn')) {
    addInterface();
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

dom.runBtn?.addEventListener('click', runSimulation);
dom.previewBtn?.addEventListener('click', () => {
  try {
    previewConfig();
  } catch {
    // Status box already contains the error.
  }
});

dom.copyBtn?.addEventListener('click', async () => {
  try {
    await copyPreviewJson();
  } catch (error) {
    dom.statusBox.className = 'status-box status-error';
    dom.statusBox.textContent = error.message;
  }
});

dom.downloadBtn?.addEventListener('click', () => {
  try {
    downloadPreviewJson();
  } catch (error) {
    dom.statusBox.className = 'status-box status-error';
    dom.statusBox.textContent = error.message;
  }
});

addDevice();
