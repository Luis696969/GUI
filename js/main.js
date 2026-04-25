import { getDom } from './utils/dom.js';
import { escapeHtml } from './utils/html.js';
import { normalizeText } from './utils/parse.js';
import { revealNewElement } from './utils/scroll.js';
import { deviceCardTemplate, chemicalCardTemplate, cellCardTemplate, entryCardTemplate, reactionCardTemplate, interfaceCardTemplate } from './templates/cards.js';
import { updateCardSummaries } from './ui/summaries.js';
import { updateDeviceCounter, updateInterfaceCounter } from './ui/counters.js';
import { toggleCollapse } from './ui/collapsibles.js';
import { setStatus } from './ui/status.js';
import { renderWarnings } from './ui/warnings.js';
import { renderJsonPreview } from './ui/jsonPreview.js';
import { clearResults, renderBackendResults } from './ui/results.js';
import { buildConfig } from './builders/buildConfig.js';
import { getDeviceSummaries } from './builders/device.js';
import { refreshAllInterfaceCards } from './builders/interface.js';
import { postSimulation } from './services/api.js';

const dom = getDom();
let deviceCounter = 0;
let interfaceCounter = 0;

function refreshAllEntryChemicalOptions() {
  document.querySelectorAll('.device-entry').forEach((deviceEl) => {
    const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name')).map((input) => normalizeText(input.value)).filter(Boolean);
    const options = chemicals.length ? chemicals.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('') : '<option value="">No chemicals available</option>';
    deviceEl.querySelectorAll('.entry-chemical').forEach((select) => {
      const oldValue = select.value;
      select.innerHTML = options;
      if (chemicals.includes(oldValue)) select.value = oldValue;
    });
  });
}

function refreshAllInterfaceCardsFromDom() {
  refreshAllInterfaceCards(dom, getDeviceSummaries(dom));
}

function removeCard(buttonEl) {
  buttonEl.closest('.dynamic-card')?.remove();
  updateDeviceCounter(dom);
  updateInterfaceCounter(dom);
  refreshAllInterfaceCardsFromDom();
  refreshAllEntryChemicalOptions();
  updateCardSummaries();
}

function addDevice() {
  const deviceId = `dev_${++deviceCounter}`;
  dom.devicesContainer.insertAdjacentHTML('beforeend', deviceCardTemplate(deviceId, deviceCounter));
  updateDeviceCounter(dom);
  refreshAllInterfaceCardsFromDom();
  refreshAllEntryChemicalOptions();
  updateCardSummaries();
  revealNewElement(dom.devicesContainer.lastElementChild);
}

function addInterface() {
  const interfaceId = `iface_${++interfaceCounter}`;
  dom.interfacesContainer.insertAdjacentHTML('beforeend', interfaceCardTemplate(interfaceId, interfaceCounter));
  updateInterfaceCounter(dom);
  refreshAllInterfaceCardsFromDom();
  updateCardSummaries();
  revealNewElement(dom.interfacesContainer.lastElementChild);
}

function addNestedCard(buttonEl, type) {
  const deviceCard = buttonEl.closest('.device-entry');
  if (!deviceCard) return;
  const map = {
    chemical: ['.device-chemicals', chemicalCardTemplate],
    cell: ['.device-cells', cellCardTemplate],
    entry: ['.device-entries', entryCardTemplate],
    reaction: ['.device-reactions', reactionCardTemplate]
  };
  const [selector, tmpl] = map[type] || [];
  const container = selector ? deviceCard.querySelector(selector) : null;
  if (!container || !tmpl) return;
  container.insertAdjacentHTML('beforeend', tmpl());
  refreshAllInterfaceCardsFromDom();
  refreshAllEntryChemicalOptions();
  updateCardSummaries();
  revealNewElement(container.lastElementChild);
}

function previewConfig() {
  try {
    const { config, warnings } = buildConfig(dom);
    renderJsonPreview(dom, config);
    renderWarnings(dom, warnings);
    setStatus(dom, warnings.length ? 'running' : 'success', warnings.length ? 'JSON generated with warnings.' : 'JSON generated successfully.');
    return { config, warnings };
  } catch (error) {
    dom.jsonPreview.textContent = 'JSON generation failed.';
    renderWarnings(dom, []);
    setStatus(dom, 'error', error.message);
    throw error;
  }
}

async function runSimulation() {
  let config;
  try { ({ config } = previewConfig()); } catch { return; }
  setStatus(dom, 'running', 'Running optional backend simulation...');
  clearResults(dom);
  try {
    const payload = await postSimulation(config);
    setStatus(dom, 'success', payload?.message || 'Simulation finished successfully.');
    renderBackendResults(dom, payload);
  } catch (error) {
    setStatus(dom, 'running', `JSON is ready. Optional backend run failed: ${error.message}`);
  }
}

async function copyJson() {
  let config;
  try { ({ config } = previewConfig()); } catch { return; }
  const json = JSON.stringify(config, null, 2);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json);
      setStatus(dom, 'success', 'JSON copied to clipboard.');
      return;
    }
  } catch {
    // Fallback below.
  }

  const fallbackInput = document.createElement('textarea');
  fallbackInput.value = json;
  fallbackInput.setAttribute('readonly', '');
  fallbackInput.style.position = 'absolute';
  fallbackInput.style.left = '-9999px';
  document.body.appendChild(fallbackInput);
  fallbackInput.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(fallbackInput);
  setStatus(dom, copied ? 'success' : 'error', copied ? 'JSON copied to clipboard.' : 'Unable to copy JSON.');
}

function downloadJson() {
  let config;
  try { ({ config } = previewConfig()); } catch { return; }
  const json = `${JSON.stringify(config, null, 2)}\n`;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'biosim-config.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(dom, 'success', 'JSON downloaded as biosim-config.json.');
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target.matches('.collapsible-toggle')) toggleCollapse(target);
  if (target.matches('#add-device-btn')) addDevice();
  if (target.matches('#add-interface-btn')) addInterface();
  if (target.matches('.remove-card-btn')) removeCard(target);
  if (target.matches('.add-chemical-btn')) addNestedCard(target, 'chemical');
  if (target.matches('.add-cell-btn')) addNestedCard(target, 'cell');
  if (target.matches('.add-entry-btn')) addNestedCard(target, 'entry');
  if (target.matches('.add-reaction-btn')) addNestedCard(target, 'reaction');
});

document.addEventListener('input', (event) => {
  if (event.target.matches('.device-name, .chem-name, .cell-name, .entry-x, .entry-y, .reaction-type')) updateCardSummaries();
  if (event.target.matches('.chem-name, .dev_Lx, .dev_Ly, .dev_Nx, .dev_Ny')) {
    refreshAllInterfaceCardsFromDom();
    refreshAllEntryChemicalOptions();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('.iface-device1, .iface-device2, .iface-side1, .iface-side2')) {
    refreshAllInterfaceCardsFromDom();
    updateCardSummaries();
  }
  if (event.target.matches('.entry-chemical, .reaction-type, .chem-profile, .cell-shape')) updateCardSummaries();
});

dom.runBtn.addEventListener('click', runSimulation);
dom.previewBtn.addEventListener('click', () => { try { previewConfig(); } catch { /* status shown */ } });
dom.copyBtn.addEventListener('click', copyJson);
dom.downloadBtn.addEventListener('click', downloadJson);

addDevice();
