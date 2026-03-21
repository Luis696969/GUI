let deviceCounter = 0;

// Plantillas HTML
const templates = {
  devices: `
  <div class="item-card item-card-device shadow-sm device-entry" data-device-id="" data-collapsible-card>
    ${makeCardHeader('Dispositivo')}

    <div class="collapsible-content">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="flex-grow-1 me-3">
          <label>Nombre del Dispositivo</label>
          <input type="text" class="form-control device-name" value="Device" oninput="refreshAllSelects()">
        </div>
        <button class="btn btn-outline-danger mt-4"
          onclick="this.closest('.device-entry').remove(); refreshAllSelects();">
          Eliminar dispositivo
        </button>
      </div>

      <div class="section-divider"></div>
      <h6 class="mb-3 text-info">Dominio del dispositivo</h6>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <label>Lx</label>
          <input type="number" class="form-control dev_Lx" value="6.0" step="0.1">
        </div>
        <div class="col-md-3">
          <label>Ly</label>
          <input type="number" class="form-control dev_Ly" value="0.3" step="0.1">
        </div>
        <div class="col-md-3">
          <label>Nx</label>
          <input type="number" class="form-control dev_Nx" value="500">
        </div>
        <div class="col-md-3">
          <label>Ny</label>
          <input type="number" class="form-control dev_Ny" value="25">
        </div>
      </div>

      <div class="device-toolbar mb-4">
        <button class="btn btn-sm btn-primary" onclick="addItemInDevice(this, 'chemicals')">+ Añadir Químico</button>
        <button class="btn btn-sm btn-primary" onclick="addItemInDevice(this, 'cells')">+ Añadir Célula</button>
        <button class="btn btn-sm btn-primary" onclick="addItemInDevice(this, 'reactions')">+ Añadir Reacción</button>
      </div>

      <div class="mt-3">
        <h6>Químicos</h6>
        <div class="dynamic-container device-chemicals"></div>
      </div>

      <div class="mt-4">
        <h6>Células</h6>
        <div class="dynamic-container device-cells"></div>
      </div>

      <div class="mt-4">
        <h6>Reacciones</h6>
        <div class="dynamic-container device-reactions"></div>
      </div>
    </div>
  </div>
`,

  chemicals: `
  <div class="item-card shadow-sm chemical-entry" data-collapsible-card>
    ${makeCardHeader('Químico')}

    <div class="collapsible-content">
      <div class="row g-3">
        <div class="col-md-3">
          <label>Nombre Químico</label>
          <input type="text" class="form-control chem-name" value="Glucose" oninput="refreshAllSelects()">
        </div>
        <div class="col-md-3">
          <label>Concentración Máxima</label>
          <input type="number" class="form-control chem-max-concentration" value="5" step="any">
        </div>
        <div class="col-md-3">
          <label>Difusión (coef)</label>
          <input type="number" class="form-control chem-coef" value="0.00065" step="0.00001">
        </div>
        <div class="col-md-3">
          <label>Perfil Inicial</label>
          <select class="form-select chem-profile">
            <option value="uniform">Uniform</option>
            <option value="zero">Zero</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-outline-danger w-100"
            onclick="this.closest('.chemical-entry').remove(); refreshAllSelects();">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
`,
  
  cells: `
  <div class="item-card item-card-cell shadow-sm cell-entry" data-collapsible-card>
    ${makeCardHeader('Célula')}

    <div class="collapsible-content">
      <div class="row g-3">
        <div class="col-md-4">
          <label>Nombre de Célula</label>
          <input type="text" class="form-control cell-name" value="Cancer cells" oninput="refreshAllSelects()">
        </div>
        <div class="col-md-4">
          <label>Concentración</label>
          <input type="number" class="form-control cell-conc" value="10" step="any">
        </div>
        <div class="col-md-4">
          <label>Difusión (coef)</label>
          <input type="number" class="form-control cell-coef" value="0.00065" step="0.00001">
        </div>
        <div class="col-md-4">
          <label>Forma</label>
          <select class="form-select cell-shape">
            <option value="ellipse">Elipse</option>
            <option value="round">Redonda</option>
          </select>
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-outline-danger w-100"
            onclick="this.closest('.cell-entry').remove(); refreshAllSelects();">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
`,

  reactions: `
  <div class="item-card item-card-reaction shadow-sm reaction-entry" data-collapsible-card>
    ${makeCardHeader('Reacción')}

    <div class="collapsible-content">
      <div class="row g-3">
        <div class="col-md-4">
          <label>Tipo</label>
          <input type="text" class="form-control reaction-type" value="cell_consumption_waste">
        </div>

        <div class="col-md-8">
          <label>Substratos</label>
          <div class="input-group">
            <select class="form-select reaction-substrate-select"></select>
            <button class="btn btn-outline-primary" type="button" onclick="addChipFromSelect(this, 'substrates')">Añadir</button>
          </div>
          <div class="chip-container mt-2" data-field="substrates"></div>
        </div>

        <div class="col-md-8">
          <label>Productos</label>
          <div class="input-group">
            <select class="form-select reaction-product-select"></select>
            <button class="btn btn-outline-primary" type="button" onclick="addChipFromSelect(this, 'products')">Añadir</button>
          </div>
          <div class="chip-container mt-2" data-field="products"></div>
        </div>

        <div class="col-md-8">
          <label>Biologicals</label>
          <div class="input-group">
            <select class="form-select reaction-biological-select"></select>
            <button class="btn btn-outline-primary" type="button" onclick="addChipFromSelect(this, 'biologicals')">Añadir</button>
          </div>
          <div class="chip-container mt-2" data-field="biologicals"></div>
        </div>

        <div class="col-md-8">
          <label>Coeficientes (opcional)</label>
          <div class="input-group">
            <input type="number" class="form-control reaction-coef-input" step="any" placeholder="Ej: 0.01">
            <button class="btn btn-outline-primary" type="button" onclick="addCoef(this)">Añadir coef</button>
          </div>
          <div class="chip-container mt-2" data-field="coefficients"></div>
        </div>

        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-outline-danger w-100"
            onclick="this.closest('.reaction-entry').remove(); refreshAllSelects();">
            Eliminar reacción
          </button>
        </div>
      </div>
    </div>
  </div>
`,

  links: `
  <div class="item-card item-card-link shadow-sm link-entry" data-collapsible-card>
    ${makeCardHeader('Conexión')}

    <div class="collapsible-content">
      <div class="row g-3">
        <div class="col-md-4">
          <label>Desde dispositivo</label>
          <select class="form-select link-from"></select>
        </div>
        <div class="col-md-4">
          <label>Hasta dispositivo</label>
          <select class="form-select link-to"></select>
        </div>
        <div class="col-md-3">
          <label>Tipo de conexión</label>
          <input type="text" class="form-control link-type" value="open">
        </div>
        <div class="col-md-1 d-flex align-items-end">
          <button class="btn btn-outline-danger w-100"
            onclick="this.closest('.link-entry').remove(); refreshAllSelects();">
            X
          </button>
        </div>
      </div>
    </div>
  </div>
`,
  
function toggleCollapse(buttonEl) {
  const card = buttonEl.closest('[data-collapsible-card]');
  if (!card) return;

  const content = card.querySelector('.collapsible-content');
  if (!content) return;

  const collapsed = content.classList.toggle('is-collapsed');
  buttonEl.classList.toggle('collapsed', collapsed);
  buttonEl.innerHTML = collapsed ? '▸' : '▾';
}

function makeCardHeader(title, extraClass = '') {
  return `
    <div class="d-flex justify-content-between align-items-center mb-3 ${extraClass}">
      <h6 class="mb-0">${title}</h6>
      <button type="button" class="collapsible-toggle" onclick="toggleCollapse(this)">▾</button>
    </div>
  `;
}

function addItem(type) {
  const container = document.getElementById(`container-${type}`);
  container.insertAdjacentHTML('beforeend', templates[type]);

  if (type === 'devices') {
    const lastDevice = container.lastElementChild;
    deviceCounter += 1;
    const newId = `dev_${deviceCounter}`;
    lastDevice.dataset.deviceId = newId;
    lastDevice.querySelector('.device-name').value = `Device ${deviceCounter}`;
  }

  refreshAllSelects();
}

function addItemInDevice(buttonEl, type) {
  const deviceCard = buttonEl.closest('.device-entry');
  if (!deviceCard) return;

  let container = null;
  if (type === 'chemicals') container = deviceCard.querySelector('.device-chemicals');
  if (type === 'cells') container = deviceCard.querySelector('.device-cells');
  if (type === 'reactions') container = deviceCard.querySelector('.device-reactions');

  if (!container) return;

  container.insertAdjacentHTML('beforeend', templates[type]);
  refreshAllSelects();
}

function normalizeText(s) {
  return (s ?? "").trim();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addChipFromSelect(buttonEl, field) {
  const card = buttonEl.closest('.reaction-entry');
  if (!card) return;

  let select;
  if (field === 'substrates') select = card.querySelector('.reaction-substrate-select');
  if (field === 'products') select = card.querySelector('.reaction-product-select');
  if (field === 'biologicals') select = card.querySelector('.reaction-biological-select');

  if (!select || !select.value) {
    alert("Selecciona un elemento antes de añadir.");
    return;
  }

  const value = normalizeText(decodeURIComponent(select.value));
  if (!value) return;

  const container = card.querySelector(`.chip-container[data-field="${field}"]`);
  if (!container) return;

  const existing = Array.from(container.querySelectorAll('.chip'))
    .map(ch => decodeURIComponent(ch.dataset.value || "").toLowerCase());

  if (existing.includes(value.toLowerCase())) return;

  container.insertAdjacentHTML('beforeend', `
    <span class="chip badge rounded-pill bg-secondary me-2 mb-2" data-value="${encodeURIComponent(value)}">
      ${escapeHtml(value)}
      <button type="button" class="btn btn-sm btn-link text-light p-0 ms-2"
        onclick="this.closest('.chip').remove()" aria-label="Eliminar">✕</button>
    </span>
  `);
}

  let select;
  if (field === 'substrates') select = card.querySelector('.reaction-substrate-select');
  if (field === 'products') select = card.querySelector('.reaction-product-select');
  if (field === 'biologicals') select = card.querySelector('.reaction-biological-select');

  const value = normalizeText(select?.value ? decodeURIComponent(select.value) : "");
  if (!value) return;

  const container = card.querySelector(`.chip-container[data-field="${field}"]`);
  if (!container) return;

  const existing = Array.from(container.querySelectorAll('.chip'))
    .map(ch => decodeURIComponent(ch.dataset.value || "").toLowerCase());

  if (existing.includes(value.toLowerCase())) return;

  container.insertAdjacentHTML('beforeend', `
    <span class="chip badge rounded-pill bg-secondary me-2 mb-2" data-value="${encodeURIComponent(value)}">
      ${escapeHtml(value)}
      <button type="button" class="btn btn-sm btn-link text-light p-0 ms-2"
        onclick="this.closest('.chip').remove()" aria-label="Eliminar">✕</button>
    </span>
  `);
}

function addCoef(buttonEl) {
  const card = buttonEl.closest('.reaction-entry');
  if (!card) return;

  const input = card.querySelector('.reaction-coef-input');
  const raw = normalizeText(input?.value);
  if (raw === "") return;

  const num = Number(raw);
  if (!Number.isFinite(num)) {
    alert("Coeficiente inválido.");
    return;
  }

  const container = card.querySelector(`.chip-container[data-field="coefficients"]`);
  if (!container) return;

  container.insertAdjacentHTML('beforeend', `
    <span class="chip badge rounded-pill bg-success me-2 mb-2" data-value="${num}">
      ${num}
      <button type="button" class="btn btn-sm btn-link text-light p-0 ms-2"
        onclick="this.closest('.chip').remove()" aria-label="Eliminar">✕</button>
    </span>
  `);

  input.value = "";
}

function getChips(card, field) {
  const container = card.querySelector(`.chip-container[data-field="${field}"]`);
  if (!container) return [];

  return Array.from(container.querySelectorAll('.chip'))
    .map(ch => decodeURIComponent(ch.dataset.value || ""));
}

function getDevicesInfo() {
  return Array.from(document.querySelectorAll('.device-entry')).map(deviceEl => ({
    id: deviceEl.dataset.deviceId,
    name: normalizeText(deviceEl.querySelector('.device-name')?.value)
  })).filter(d => d.id && d.name);
}

function fillSelect(selectEl, options, placeholder) {
  if (!selectEl) return;

  const current = selectEl.value;
  const html = [];

  if (placeholder) {
    html.push(`<option value="">${escapeHtml(placeholder)}</option>`);
  }

  options.forEach(opt => {
    html.push(`<option value="${encodeURIComponent(opt.value)}">${escapeHtml(opt.label)}</option>`);
  });

  selectEl.innerHTML = html.join("");

  if (current && Array.from(selectEl.options).some(op => op.value === current)) {
    selectEl.value = current;
  }
}

function refreshLinkSelects() {
  const devices = getDevicesInfo().map(d => ({
    value: d.id,
    label: `${d.name} (${d.id})`
  }));

  document.querySelectorAll('.link-entry').forEach(linkEl => {
    fillSelect(
      linkEl.querySelector('.link-from'),
      devices,
      devices.length ? "Selecciona dispositivo" : "Crea dispositivos primero"
    );
    fillSelect(
      linkEl.querySelector('.link-to'),
      devices,
      devices.length ? "Selecciona dispositivo" : "Crea dispositivos primero"
    );
  });
}

function refreshReactionSelects() {
  document.querySelectorAll('.device-entry').forEach(deviceEl => {
    const chemOptions = Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name'))
      .map(el => normalizeText(el.value))
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));

    const cellOptions = Array.from(deviceEl.querySelectorAll('.cell-entry .cell-name'))
      .map(el => normalizeText(el.value))
      .filter(Boolean)
      .map(name => ({ value: name, label: name }));

    deviceEl.querySelectorAll('.reaction-entry').forEach(reactionEl => {
      fillSelect(
        reactionEl.querySelector('.reaction-substrate-select'),
        chemOptions,
        chemOptions.length ? "Elige químico" : "Crea químicos primero"
      );
      fillSelect(
        reactionEl.querySelector('.reaction-product-select'),
        chemOptions,
        chemOptions.length ? "Elige químico" : "Crea químicos primero"
      );
      fillSelect(
        reactionEl.querySelector('.reaction-biological-select'),
        cellOptions,
        cellOptions.length ? "Elige célula" : "Crea células primero"
      );
    });
  });
}

function checkDuplicateNamesInDevice(deviceEl, entrySelector, inputSelector, label) {
  const seen = new Set();

  deviceEl.querySelectorAll(entrySelector).forEach(el => {
    const name = normalizeText(el.querySelector(inputSelector)?.value);
    if (!name) return;

    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Nombre duplicado en ${label}: "${name}"`);
    }
    seen.add(key);
  });
}

function forceReactionCleanup() {
  document.querySelectorAll('.device-entry').forEach(deviceEl => {
    const validChemicals = Array.from(deviceEl.querySelectorAll('.chemical-entry .chem-name'))
      .map(el => normalizeText(el.value))
      .filter(Boolean);

    const validCells = Array.from(deviceEl.querySelectorAll('.cell-entry .cell-name'))
      .map(el => normalizeText(el.value))
      .filter(Boolean);

    deviceEl.querySelectorAll('.reaction-entry').forEach(reactionEl => {
      ['substrates', 'products', 'biologicals'].forEach(field => {
        const validOptions = field === 'biologicals' ? validCells : validChemicals;
        const container = reactionEl.querySelector(`.chip-container[data-field="${field}"]`);
        if (!container) return;

        Array.from(container.querySelectorAll('.chip')).forEach(chip => {
          const value = decodeURIComponent(chip.dataset.value || "");
          if (!validOptions.includes(value)) {
            chip.remove();
          }
        });
      });
    });
  });
}

function refreshAllSelects() {
  refreshReactionSelects();
  refreshLinkSelects();
  forceReactionCleanup();
}

function ejecutarSimulacion() {
  const deviceEntries = document.querySelectorAll('.device-entry');

  if (deviceEntries.length === 0) {
    alert("Debes añadir al menos un dispositivo.");
    return;
  }

  const finalJSON = {
    simulation: {
      T: parseInt(document.getElementById('sim_T').value),
      dt: parseFloat(document.getElementById('sim_dt').value),
      times_to_plot: [0, 15, 30, 59],
      run_solver: true
    },
    devices: [],
    links: []
  };

  try {
    deviceEntries.forEach(deviceEl => {
      const deviceName = normalizeText(deviceEl.querySelector('.device-name')?.value);
      if (!deviceName) {
        throw new Error("Todos los dispositivos deben tener nombre.");
      }

      checkDuplicateNamesInDevice(deviceEl, '.chemical-entry', '.chem-name', 'químicos');
      checkDuplicateNamesInDevice(deviceEl, '.cell-entry', '.cell-name', 'células');

      const deviceObj = {
        id: deviceEl.dataset.deviceId,
        name: deviceName,
        domain: {
          Lx: parseFloat(deviceEl.querySelector('.dev_Lx').value),
          Ly: parseFloat(deviceEl.querySelector('.dev_Ly').value),
          Nx: parseInt(deviceEl.querySelector('.dev_Nx').value),
          Ny: parseInt(deviceEl.querySelector('.dev_Ny').value)
        },
        chemicals: [],
        cells: [],
        reactions: []
      };

      deviceEl.querySelectorAll('.chemical-entry').forEach(el => {
        const name = normalizeText(el.querySelector('.chem-name').value);
        if (!name) {
          throw new Error(`Hay un químico sin nombre en ${deviceName}.`);
        }

        deviceObj.chemicals.push({
          name,
          max_concentration: parseFloat(el.querySelector('.chem-max-concentration').value),
          diffusion_coef: parseFloat(el.querySelector('.chem-coef').value),
          initial_profile: el.querySelector('.chem-profile').value
        });
      });

      deviceEl.querySelectorAll('.cell-entry').forEach(el => {
        const name = normalizeText(el.querySelector('.cell-name').value);
        if (!name) {
          throw new Error(`Hay una célula sin nombre en ${deviceName}.`);
        }

        deviceObj.cells.push({
          name,
          concentration: parseFloat(el.querySelector('.cell-conc').value),
          diffusion_coef: parseFloat(el.querySelector('.cell-coef').value),
          shape: el.querySelector('.cell-shape').value
        });
      });

      deviceEl.querySelectorAll('.reaction-entry').forEach(el => {
        const type = normalizeText(el.querySelector('.reaction-type')?.value);
        const substrates = getChips(el, 'substrates');
        const products = getChips(el, 'products');
        const biologicals = getChips(el, 'biologicals');
        const coefficients = getChips(el, 'coefficients')
          .map(v => Number(v))
          .filter(n => Number.isFinite(n));

        if (!type) {
          throw new Error(`Hay una reacción sin tipo en ${deviceName}.`);
        }

        const reactionObj = {
          type,
          substrates,
          products,
          biologicals
        };

        if (coefficients.length > 0) {
          reactionObj.coefficients = coefficients;
        }

        deviceObj.reactions.push(reactionObj);
      });

      finalJSON.devices.push(deviceObj);
    });

    document.querySelectorAll('.link-entry').forEach(linkEl => {
      const from = linkEl.querySelector('.link-from')?.value
        ? decodeURIComponent(linkEl.querySelector('.link-from').value)
        : "";

      const to = linkEl.querySelector('.link-to')?.value
        ? decodeURIComponent(linkEl.querySelector('.link-to').value)
        : "";

      const type = normalizeText(linkEl.querySelector('.link-type')?.value);

      if (!from || !to) return;

      if (from === to) {
        throw new Error("Un dispositivo no puede conectarse consigo mismo.");
      }

      finalJSON.links.push({ from, to, type });
    });

  } catch (error) {
    alert(error.message || "Hay errores en la configuración.");
    return;
  }

  document.getElementById('json-preview').innerText = JSON.stringify(finalJSON, null, 2);

  console.log("Enviando JSON a Python...", finalJSON);

  fetch('http://127.0.0.1:8000/run-simulation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(finalJSON),
  })
    .then(response => response.json())
    .then(data => {
      alert("Servidor responde: " + data.message);
      console.log('Éxito:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert("Error al conectar con el servidor de Python");
    });
}
