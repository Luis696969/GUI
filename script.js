const API_URL = 'http://127.0.0.1:8000/run-simulation';

let deviceCounter = 0;

const dom = {
  devicesContainer: document.getElementById('container-devices'),
  devicesEmpty: document.getElementById('devices-empty'),
  countDevices: document.getElementById('count-devices'),
  runBtn: document.getElementById('run-btn'),
  addDeviceBtn: document.getElementById('add-device-btn'),
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function updateDeviceCounter() {
  const count = dom.devicesContainer.querySelectorAll('.device-entry').length;
  dom.countDevices.textContent = String(count);
  dom.devicesEmpty.classList.toggle('d-none', count > 0);
}

function removeCard(buttonEl) {
  const card = buttonEl.closest('.dynamic-card');
  if (!card) return;
  card.remove();
  updateDeviceCounter();
}

function chemicalCardTemplate() {
  return `
    <div class="dynamic-card chemical-entry">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">Químico</h3>
          <div class="card-subtitle">Define especie química, concentración máxima y difusión.</div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar</button>
      </div>
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
          </select>
        </div>
      </div>
    </div>
  `;
}

function cellCardTemplate() {
  return `
    <div class="dynamic-card cell-entry">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">Célula</h3>
          <div class="card-subtitle">Concentración, difusión y forma geométrica inicial.</div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control cell-name" placeholder="Ej. Cell_A">
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
      </div>
    </div>
  `;
}

function reactionCardTemplate() {
  return `
    <div class="dynamic-card reaction-entry">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">Reacción</h3>
          <div class="card-subtitle">Se exporta a nivel global para esta primera versión.</div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar</button>
      </div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <input type="text" class="form-control reaction-type" placeholder="Nombre del método en ReactionKinetics">
        </div>
        <div class="col-md-6">
          <label class="form-label">Substratos</label>
          <input type="text" class="form-control reaction-substrates" placeholder="A, B, C">
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
      </div>
    </div>
  `;
}

function deviceCardTemplate(deviceId, index) {
  return `
    <div class="dynamic-card device-entry" data-device-id="${deviceId}">
      <div class="card-header-row">
        <div>
          <h3 class="card-title">Dispositivo ${index}</h3>
          <div class="card-subtitle">Dominio, químicos, células y reacciones asociadas.</div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Eliminar dispositivo</button>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Nombre del dispositivo</label>
          <input type="text" class="form-control device-name" value="Device ${index}" placeholder="Device ${index}">
        </div>
        <div class="col-md-3">
          <label class="form-label">Lx</label>
          <input type="number" class="form-control dev_Lx" min="0.000001" step="any" value="1">
        </div>
        <div class="col-md-3">
          <label class="form-label">Ly</label>
          <input type="number" class="form-control dev_Ly" min="0.000001" step="any" value="1">
        </div>
        <div class="col-md-3">
          <label class="form-label">Nx</label>
          <input type="number" class="form-control dev_Nx" min="1" step="1" value="100">
        </div>
        <div class="col-md-3">
          <label class="form-label">Ny</label>
          <input type="number" class="form-control dev_Ny" min="1" step="1" value="100">
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
  `;
}

function addDevice() {
  deviceCounter += 1;
  const deviceId = `dev_${deviceCounter}`;
  dom.devicesContainer.insertAdjacentHTML('beforeend', deviceCardTemplate(deviceId, deviceCounter));
  updateDeviceCounter();
}

function addNestedCard(buttonEl, type) {
  const deviceCard = buttonEl.closest('.device-entry');
  if (!deviceCard) return;

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
  }
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

updateDeviceCounter();
