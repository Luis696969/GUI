const API_URL = 'http://127.0.0.1:8000/run-simulation';

let deviceCounter = 0;
let interfaceCounter = 0;

const dom = {
  devicesContainer: document.getElementById('container-devices'),
  devicesEmpty: document.getElementById('devices-empty'),
  countDevices: document.getElementById('count-devices'),
  interfacesContainer: document.getElementById('container-interfaces'),
  interfacesEmpty: document.getElementById('interfaces-empty'),
  countInterfaces: document.getElementById('count-interfaces'),
  runBtn: document.getElementById('run-btn'),
  addDeviceBtn: document.getElementById('add-device-btn'),
  addInterfaceBtn: document.getElementById('add-interface-btn'),
  jsonPreview: document.getElementById('json-preview'),
  statusBox: document.getElementById('status-box'),
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

function readNumber(value, label, { integer = false, min = null, strictlyPositive = false } = {}) {
  const num = integer ? parseInt(value, 10) : parseFloat(value);

  if (!Number.isFinite(num)) {
    throw new Error(`${label} no es válido.`);
  }
  if (min !== null && num < min) {
    throw new Error(`${label} debe ser >= ${min}.`);
  }
  if (strictlyPositive && num <= 0) {
    throw new Error(`${label} debe ser > 0.`);
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

function buildTimesToPlot(T) {
  const candidates = [0, 15, 30, 59, T];
  return [...new Set(
    candidates
      .map(v => Math.round(Math.max(0, Math.min(v, T))))
      .filter(v => v <= T)
  )].sort((a, b) => a - b);
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

function setStatus(type, message) {
  dom.statusBox.className = `status-box status-${type}`;
  dom.statusBox.textContent = message;
}

function makeCardHeader(title, subtitle = '', extraClass = '') {
  return `
    <div class="card-header-row">
      <div class="card-title-wrap">
        <button type="button" class="collapsible-toggle" aria-label="Contraer/expandir" onclick="toggleCollapse(this)">▾</button>
        <div class="min-w-0">
          <h3 class="card-title ${extraClass}">${title}</h3>
          <div class="card-summary">${subtitle}</div>
        </div>
      </div>
    </div>
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

  const ancestors = element.closest('.device-entry');
  if (ancestors) expandCollapsibleCard(ancestors);
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
  updateCardSummaries();
}

function deviceCardTemplate(deviceId, index) {
  return `
    <div class="dynamic-card device-entry" data-device-id="${deviceId}" data-collapsible-card>
      ${makeCardHeader(`Dispositivo ${index}`, 'Dominio, químicos, células y reacciones asociadas.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre del dispositivo</label>
            <input type="text" class="form-control device-name" value="Device ${index}" placeholder="Device ${index}">
          </div>
          <div class="col-md-3">
            <label class="form-label">Lx</label>
            <input type="number" class="form-control dev_Lx" min="0.000001" step="any" value="0.3">
          </div>
          <div class="col-md-3">
            <label class="form-label">Ly</label>
            <input type="number" class="form-control dev_Ly" min="0.000001" step="any" value="9.75">
          </div>
          <div class="col-md-3">
            <label class="form-label">Nx</label>
            <input type="number" class="form-control dev_Nx" min="1" step="1" value="20">
          </div>
          <div class="col-md-3">
            <label class="form-label">Ny</label>
            <input type="number" class="form-control dev_Ny" min="1" step="1" value="500">
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar dispositivo</button>
          </div>
        </div>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Químicos</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-chemical-btn">+ Añadir químico</button>
          </div>
          <div class="items-container device-chemicals"></div>
        </section>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Células</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-cell-btn">+ Añadir célula</button>
          </div>
          <div class="items-container device-cells"></div>
        </section>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Reacciones</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-reaction-btn">+ Añadir reacción</button>
          </div>
          <div class="items-container device-reactions"></div>
        </section>
      </div>
    </div>
  `;
}

function chemicalCardTemplate() {
  return `
    <div class="dynamic-card chemical-entry" data-collapsible-card>
      ${makeCardHeader('Químico', 'Define especie química, concentración máxima y difusión.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control chem-name" placeholder="Ej. Glucose">
          </div>
          <div class="col-md-3">
            <label class="form-label">Concentración máxima</label>
            <input type="number" class="form-control chem-max-concentration" min="0" step="any" value="1">
          </div>
          <div class="col-md-3">
            <label class="form-label">Difusión</label>
            <input type="number" class="form-control chem-coef" min="0" step="any" value="0.01">
          </div>
          <div class="col-md-6">
            <label class="form-label">Perfil inicial</label>
            <select class="form-select chem-profile">
              <option value="uniform">uniform</option>
              <option value="zero">zero</option>
              <option value="empty">empty</option>
            </select>
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function cellCardTemplate() {
  return `
    <div class="dynamic-card cell-entry" data-collapsible-card>
      ${makeCardHeader('Célula', 'Concentración, difusión y forma geométrica inicial.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control cell-name" placeholder="Ej. Cancer cells">
          </div>
          <div class="col-md-3">
            <label class="form-label">Concentración</label>
            <input type="number" class="form-control cell-conc" min="0" step="any" value="1">
          </div>
          <div class="col-md-3">
            <label class="form-label">Difusión</label>
            <input type="number" class="form-control cell-coef" min="0" step="any" value="0.0">
          </div>
          <div class="col-md-6">
            <label class="form-label">Forma</label>
            <select class="form-select cell-shape">
              <option value="ellipse">ellipse</option>
              <option value="round">round</option>
            </select>
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function reactionCardTemplate() {
  return `
    <div class="dynamic-card reaction-entry" data-collapsible-card>
      ${makeCardHeader('Reacción', 'Se exporta a nivel global para esta primera versión.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Tipo</label>
            <input type="text" class="form-control reaction-type" placeholder="cell_consumption_waste">
          </div>
          <div class="col-md-6">
            <label class="form-label">Substratos</label>
            <input type="text" class="form-control reaction-substrates" placeholder="A, B">
          </div>
          <div class="col-md-6">
            <label class="form-label">Productos</label>
            <input type="text" class="form-control reaction-products" placeholder="P1, P2">
          </div>
          <div class="col-md-6">
            <label class="form-label">Biologicals</label>
            <input type="text" class="form-control reaction-biologicals" placeholder="Cell_A, Cell_B">
          </div>
          <div class="col-12">
            <label class="form-label">Coeficientes (opcional)</label>
            <input type="text" class="form-control reaction-coefficients" placeholder="1.0, 0.5, 2">
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar reacción</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function interfaceCardTemplate(interfaceId, index) {
  return `
    <div class="dynamic-card interface-entry" data-interface-id="${interfaceId}" data-collapsible-card>
      ${makeCardHeader(`Interfaz ${index}`, 'Conecta dos dispositivos mediante un segmento de borde en cada uno.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Dispositivo 1</label>
            <select class="form-select iface-device1"></select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Dispositivo 2</label>
            <select class="form-select iface-device2"></select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Lado dispositivo 1</label>
            <select class="form-select iface-side1">
              <option value="left">left</option>
              <option value="right">right</option>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Inicio tramo 1</label>
            <input type="number" class="form-control iface-start1" step="any" value="0">
          </div>
          <div class="col-md-3">
            <label class="form-label">Fin tramo 1</label>
            <input type="number" class="form-control iface-stop1" step="any" value="1">
          </div>
          <div class="col-md-3">
            <label class="form-label">Longitud borde 1</label>
            <input type="text" class="form-control iface-limit1" disabled value="-">
          </div>

          <div class="col-md-3">
            <label class="form-label">Lado dispositivo 2</label>
            <select class="form-select iface-side2">
              <option value="left">left</option>
              <option value="right">right</option>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Inicio tramo 2</label>
            <input type="number" class="form-control iface-start2" step="any" value="0">
          </div>
          <div class="col-md-3">
            <label class="form-label">Fin tramo 2</label>
            <input type="number" class="form-control iface-stop2" step="any" value="1">
          </div>
          <div class="col-md-3">
            <label class="form-label">Longitud borde 2</label>
            <input type="text" class="form-control iface-limit2" disabled value="-">
          </div>
        </div>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Difusión interfacial por químico</h4>
          </div>
          <div class="iface-chemicals-note text-muted small mb-2">
            Selecciona dos dispositivos para mostrar los químicos compartidos.
          </div>
          <div class="iface-diffusion-container row g-3"></div>
        </section>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar interfaz</button>
        </div>
      </div>
    </div>
  `;
}

function addDevice() {
  deviceCounter += 1;
  const deviceId = `dev_${deviceCounter}`;
  dom.devicesContainer.insertAdjacentHTML('beforeend', deviceCardTemplate(deviceId, deviceCounter));
  const newElement = dom.devicesContainer.lastElementChild;
  updateDeviceCounter();
  refreshAllInterfaceCards();
  updateCardSummaries();
  revealNewElement(newElement);
}

function addInterface() {
  interfaceCounter += 1;
  const interfaceId = `iface_${interfaceCounter}`;
  dom.interfacesContainer.insertAdjacentHTML('beforeend', interfaceCardTemplate(interfaceId, interfaceCounter));
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
    html = chemicalCardTemplate();
  } else if (type === 'cell') {
    container = deviceCard.querySelector('.device-cells');
    html = cellCardTemplate();
  } else if (type === 'reaction') {
    container = deviceCard.querySelector('.device-reactions');
    html = reactionCardTemplate();
  }

  if (container && html) {
    container.insertAdjacentHTML('beforeend', html);
    const newElement = container.lastElementChild;
    refreshAllInterfaceCards();
    updateCardSummaries();
    revealNewElement(newElement);
  }
}

function getDeviceSummary(deviceEl) {
  const name = normalizeText(deviceEl.querySelector('.device-name')?.value) || 'Dispositivo';
  const chemicals = deviceEl.querySelectorAll('.chemical-entry').length;
  const cells = deviceEl.querySelectorAll('.cell-entry').length;
  const reactions = deviceEl.querySelectorAll('.reaction-entry').length;
  return `${name} · ${chemicals} químicos · ${cells} células · ${reactions} reacciones`;
}

function getChemicalSummary(chemicalEl) {
  return normalizeText(chemicalEl.querySelector('.chem-name')?.value) || 'Químico';
}

function getCellSummary(cellEl) {
  return normalizeText(cellEl.querySelector('.cell-name')?.value) || 'Célula';
}

function getReactionSummary(reactionEl) {
  return normalizeText(reactionEl.querySelector('.reaction-type')?.value) || 'Reacción';
}

function getInterfaceSummary(interfaceEl) {
  const from = interfaceEl.querySelector('.iface-device1');
  const to = interfaceEl.querySelector('.iface-device2');
  const fromText = from?.selectedOptions?.[0]?.textContent || 'Origen';
  const toText = to?.selectedOptions?.[0]?.textContent || 'Destino';
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
  document.querySelectorAll('.reaction-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getReactionSummary(el);
  });
  document.querySelectorAll('.interface-entry').forEach(el => {
    const target = el.querySelector('.card-summary');
    if (target) target.textContent = getInterfaceSummary(el);
  });
}

function collectChemicals(deviceEl, deviceName) {
  return Array.from(deviceEl.querySelectorAll('.chemical-entry')).map((el, index) => {
    const name = normalizeText(el.querySelector('.chem-name')?.value);
    if (!name) {
      throw new Error(`Hay un químico sin nombre en ${deviceName} (posición ${index + 1}).`);
    }

    return {
      name,
      max_concentration: readNumber(
        el.querySelector('.chem-max-concentration')?.value,
        `Concentración máxima de ${name} en ${deviceName}`,
        { min: 0 }
      ),
      diffusion_coef: readNumber(
        el.querySelector('.chem-coef')?.value,
        `Difusión de ${name} en ${deviceName}`,
        { min: 0 }
      ),
      initial_profile: normalizeText(el.querySelector('.chem-profile')?.value) || 'uniform'
    };
  });
}

function collectCells(deviceEl, deviceName) {
  return Array.from(deviceEl.querySelectorAll('.cell-entry')).map((el, index) => {
    const name = normalizeText(el.querySelector('.cell-name')?.value);
    if (!name) {
      throw new Error(`Hay una célula sin nombre en ${deviceName} (posición ${index + 1}).`);
    }

    return {
      name,
      concentration: readNumber(
        el.querySelector('.cell-conc')?.value,
        `Concentración de ${name} en ${deviceName}`,
        { min: 0 }
      ),
      diffusion_coef: readNumber(
        el.querySelector('.cell-coef')?.value,
        `Difusión de ${name} en ${deviceName}`,
        { min: 0 }
      ),
      shape: normalizeText(el.querySelector('.cell-shape')?.value) || 'ellipse'
    };
  });
}

function collectReactions(deviceEl, deviceName) {
  return Array.from(deviceEl.querySelectorAll('.reaction-entry')).map((el, index) => {
    const type = normalizeText(el.querySelector('.reaction-type')?.value);
    if (!type) {
      throw new Error(`Hay una reacción sin tipo en ${deviceName} (posición ${index + 1}).`);
    }

    const coefficients = parseCsv(el.querySelector('.reaction-coefficients')?.value)
      .map(Number)
      .filter(Number.isFinite);

    const reaction = {
      type,
      substrates: parseCsv(el.querySelector('.reaction-substrates')?.value),
      products: parseCsv(el.querySelector('.reaction-products')?.value),
      biologicals: parseCsv(el.querySelector('.reaction-biologicals')?.value)
    };

    if (coefficients.length > 0) {
      reaction.coefficients = coefficients;
    }

    return reaction;
  });
}

function getDeviceSummaries() {
  return Array.from(dom.devicesContainer.querySelectorAll('.device-entry')).map((deviceEl, idx) => {
    const id = normalizeText(deviceEl.dataset.deviceId) || `dev_${idx + 1}`;
    const name = normalizeText(deviceEl.querySelector('.device-name')?.value) || id;
    const Lx = Number(deviceEl.querySelector('.dev_Lx')?.value);
    const Ly = Number(deviceEl.querySelector('.dev_Ly')?.value);

    const chemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name'))
      .map(input => normalizeText(input.value))
      .filter(Boolean);

    return { id, name, Lx, Ly, chemicals };
  });
}

function sideMax(device, side) {
  return side === 'left' || side === 'right' ? device.Ly : device.Lx;
}

function pointForSide(device, side, value) {
  if (side === 'left') return [0.0, value];
  if (side === 'right') return [device.Lx, value];
  if (side === 'bottom') return [value, 0.0];
  if (side === 'top') return [value, device.Ly];
  throw new Error(`Lado no reconocido: ${side}`);
}

function buildInterfaceSideLoc(device, side, startValue, stopValue, label) {
  const max = sideMax(device, side);

  if (startValue < 0 || startValue > max) {
    throw new Error(`${label}: el inicio debe estar entre 0 y ${max}.`);
  }
  if (stopValue < 0 || stopValue > max) {
    throw new Error(`${label}: el fin debe estar entre 0 y ${max}.`);
  }
  if (startValue === stopValue) {
    throw new Error(`${label}: el tramo no puede tener longitud cero.`);
  }

  const start = Math.min(startValue, stopValue);
  const stop = Math.max(startValue, stopValue);

  return {
    start: pointForSide(device, side, start),
    stop: pointForSide(device, side, stop)
  };
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

  limit1.value = device1 ? sideMax(device1, side1) : '-';
  limit2.value = device2 ? sideMax(device2, side2) : '-';
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
    noteEl.textContent = 'Selecciona dos dispositivos para mostrar los químicos compartidos.';
    updateCardSummaries();
    return;
  }

  const commonChemicals = device1.chemicals.filter(name => device2.chemicals.includes(name));

  if (commonChemicals.length === 0) {
    noteEl.textContent = 'Estos dispositivos no tienen químicos compartidos.';
    updateCardSummaries();
    return;
  }

  noteEl.textContent = 'Introduce un valor de D_interface para cada químico compartido.';

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
          placeholder="Ej. 0.00012"
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

  const options = ['<option value="">Selecciona dispositivo</option>']
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
  Array.from(dom.interfacesContainer.querySelectorAll('.interface-entry')).forEach(interfaceEl => {
    refreshInterfaceDeviceOptions(interfaceEl, summaries);
  });
  updateCardSummaries();
}

function collectInterfaces(deviceSummaries) {
  return Array.from(dom.interfacesContainer.querySelectorAll('.interface-entry')).map((el, index) => {
    const device1Id = normalizeText(el.querySelector('.iface-device1')?.value);
    const device2Id = normalizeText(el.querySelector('.iface-device2')?.value);
    const side1 = normalizeText(el.querySelector('.iface-side1')?.value);
    const side2 = normalizeText(el.querySelector('.iface-side2')?.value);

    if (!device1Id || !device2Id) {
      throw new Error(`Interfaz ${index + 1}: debes seleccionar dos dispositivos.`);
    }
    if (device1Id === device2Id) {
      throw new Error(`Interfaz ${index + 1}: device1 y device2 no pueden ser el mismo.`);
    }

    const device1 = deviceSummaries.find(d => d.id === device1Id);
    const device2 = deviceSummaries.find(d => d.id === device2Id);

    if (!device1 || !device2) {
      throw new Error(`Interfaz ${index + 1}: uno de los dispositivos ya no existe.`);
    }

    const start1 = readNumber(el.querySelector('.iface-start1')?.value, `Inicio tramo 1 de interfaz ${index + 1}`);
    const stop1 = readNumber(el.querySelector('.iface-stop1')?.value, `Fin tramo 1 de interfaz ${index + 1}`);
    const start2 = readNumber(el.querySelector('.iface-start2')?.value, `Inicio tramo 2 de interfaz ${index + 1}`);
    const stop2 = readNumber(el.querySelector('.iface-stop2')?.value, `Fin tramo 2 de interfaz ${index + 1}`);

    const locs1 = buildInterfaceSideLoc(device1, side1, start1, stop1, `Interfaz ${index + 1} / device1`);
    const locs2 = buildInterfaceSideLoc(device2, side2, start2, stop2, `Interfaz ${index + 1} / device2`);

    const D_interface = {};
    el.querySelectorAll('.iface-diffusion-value').forEach(input => {
      const chemical = normalizeText(input.dataset.chemical);
      const raw = normalizeText(input.value);
      if (!chemical || !raw) return;
      D_interface[chemical] = readNumber(raw, `D_interface de ${chemical} en interfaz ${index + 1}`, { min: 0 });
    });

    if (Object.keys(D_interface).length === 0) {
      throw new Error(`Interfaz ${index + 1}: debes introducir al menos un valor de D_interface.`);
    }

    return {
      device1: device1Id,
      device2: device2Id,
      locs: {
        device1: locs1,
        device2: locs2
      },
      D_interface
    };
  });
}

function buildCompatibleJSON() {
  const deviceEntries = Array.from(dom.devicesContainer.querySelectorAll('.device-entry'));
  if (deviceEntries.length === 0) {
    throw new Error('Debes añadir al menos un dispositivo.');
  }

  const T = readNumber(document.getElementById('sim_T').value, 'T', {
    integer: true,
    strictlyPositive: true
  });

  const dt = readNumber(document.getElementById('sim_dt').value, 'dt', {
    strictlyPositive: true
  });

  const payload = {
    simulation: {
      T,
      dt,
      times_to_plot: buildTimesToPlot(T),
      run_solver: true
    },
    plot_profiles: {
      live_plot: false
    },
    devices: [],
    reactions: [],
    interfaces: [],
    washouts: []
  };

  const globalReactions = new Map();

  deviceEntries.forEach((deviceEl, idx) => {
    const deviceId = normalizeText(deviceEl.dataset.deviceId) || `dev_${idx + 1}`;
    const deviceName = normalizeText(deviceEl.querySelector('.device-name')?.value) || deviceId;

    const deviceObj = {
      id: deviceId,
      name: deviceName,
      domain: {
        Lx: readNumber(deviceEl.querySelector('.dev_Lx')?.value, `Lx de ${deviceName}`, { strictlyPositive: true }),
        Ly: readNumber(deviceEl.querySelector('.dev_Ly')?.value, `Ly de ${deviceName}`, { strictlyPositive: true }),
        Nx: readNumber(deviceEl.querySelector('.dev_Nx')?.value, `Nx de ${deviceName}`, { integer: true, strictlyPositive: true }),
        Ny: readNumber(deviceEl.querySelector('.dev_Ny')?.value, `Ny de ${deviceName}`, { integer: true, strictlyPositive: true })
      },
      entries: [],
      chemicals: collectChemicals(deviceEl, deviceName),
      cells: collectCells(deviceEl, deviceName)
    };

    collectReactions(deviceEl, deviceName).forEach(reactionObj => {
      const key = reactionFingerprint(reactionObj);
      if (!globalReactions.has(key)) {
        globalReactions.set(key, reactionObj);
      }
    });

    payload.devices.push(deviceObj);
  });

  payload.reactions = Array.from(globalReactions.values());

  const deviceSummaries = payload.devices.map(device => ({
    id: device.id,
    name: device.name,
    Lx: device.domain.Lx,
    Ly: device.domain.Ly,
    chemicals: device.chemicals.map(c => c.name)
  }));

  payload.interfaces = collectInterfaces(deviceSummaries);

  return payload;
}

function renderServerResponse(data) {
  dom.serverBox.classList.remove('d-none');
  dom.serverBox.innerHTML = `<strong>Respuesta del backend:</strong><pre class="json-preview mt-2 mb-0">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;

  const items = [];
  if (Array.isArray(data.devices) && data.devices.length) {
    items.push(`<li><strong>Dispositivos:</strong> ${data.devices.join(', ')}</li>`);
  }
  if (Array.isArray(data.times_to_plot) && data.times_to_plot.length) {
    items.push(`<li><strong>times_to_plot:</strong> ${data.times_to_plot.join(', ')}</li>`);
  }
  if (typeof data.n_reactions === 'number') {
    items.push(`<li><strong>Reacciones activas:</strong> ${data.n_reactions}</li>`);
  }
  if (typeof data.n_interfaces === 'number') {
    items.push(`<li><strong>Interfaces:</strong> ${data.n_interfaces}</li>`);
  }
  if (data.run_id) {
    items.push(`<li><strong>Run ID:</strong> ${escapeHtml(data.run_id)}</li>`);
  }

  dom.resultSummary.innerHTML = items.length
    ? `<ul class="result-list">${items.join('')}</ul>`
    : 'La simulación se ejecutó, pero no llegó un resumen estructurado.';

  dom.plots.innerHTML = '';
  if (Array.isArray(data.images)) {
    data.images.forEach(src => {
      const wrapper = document.createElement('div');
      wrapper.className = 'result-card';
      wrapper.innerHTML = `
        <img class="plot-img" src="http://127.0.0.1:8000${src}" alt="Plot de simulación">
        <a class="plot-link" href="http://127.0.0.1:8000${src}" target="_blank" rel="noopener noreferrer">Abrir imagen</a>
      `;
      dom.plots.appendChild(wrapper);
    });
  }
}

async function ejecutarSimulacion() {
  let finalJSON;

  try {
    finalJSON = buildCompatibleJSON();
    dom.jsonPreview.textContent = JSON.stringify(finalJSON, null, 2);
  } catch (error) {
    setStatus('error', error.message || 'Hay errores en la configuración.');
    return;
  }

  setStatus('running', 'Ejecutando simulación local...');
  dom.serverBox.classList.add('d-none');
  dom.resultSummary.textContent = 'Esperando respuesta del backend...';
  dom.plots.innerHTML = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalJSON)
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.detail || `Error HTTP ${response.status}`);
    }

    setStatus('success', data.message || 'Simulación completada correctamente.');
    renderServerResponse(data);
  } catch (error) {
    setStatus('error', error.message || 'Error al conectar con el backend.');
  }
}

dom.addDeviceBtn.addEventListener('click', addDevice);
dom.addInterfaceBtn.addEventListener('click', addInterface);
dom.runBtn.addEventListener('click', ejecutarSimulacion);

dom.devicesContainer.addEventListener('click', event => {
  const target = event.target;

  if (target.classList.contains('remove-card-btn')) {
    removeCard(target);
    return;
  }
  if (target.classList.contains('add-chemical-btn')) {
    addNestedCard(target, 'chemical');
    return;
  }
  if (target.classList.contains('add-cell-btn')) {
    addNestedCard(target, 'cell');
    return;
  }
  if (target.classList.contains('add-reaction-btn')) {
    addNestedCard(target, 'reaction');
  }
});

dom.devicesContainer.addEventListener('input', () => {
  refreshAllInterfaceCards();
  updateCardSummaries();
});

dom.devicesContainer.addEventListener('change', () => {
  refreshAllInterfaceCards();
  updateCardSummaries();
});

dom.interfacesContainer.addEventListener('change', event => {
  const interfaceEl = event.target.closest('.interface-entry');
  if (!interfaceEl) return;
  const summaries = getDeviceSummaries();
  updateInterfaceLimits(interfaceEl, summaries);
  renderInterfaceDiffusionRows(interfaceEl, summaries);
  updateCardSummaries();
});

dom.interfacesContainer.addEventListener('input', () => {
  updateCardSummaries();
});

dom.interfacesContainer.addEventListener('click', event => {
  const target = event.target;
  if (target.classList.contains('remove-card-btn')) {
    removeCard(target);
  }
});

updateDeviceCounter();
updateInterfaceCounter();
updateCardSummaries();

window.toggleCollapse = toggleCollapse;
