// Plantillas HTML para los nuevos elementos
const templates = {
    chemicals: `
        <div class="item-card shadow-sm chemical-entry">
            <div class="row g-3">
                <div class="col-md-3">
                    <label>Nombre Químico</label>
                    <input type="text" class="form-control chem-name" value="Glucose">
                </div>
                <div class="col-md-3">
                    <label>Concentración Máxima</label>
                    <input type="number" class="form-control chem-max-concentration" value="5">
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
                    <button class="btn btn-outline-danger w-100" onclick="this.closest('.item-card').remove()">Eliminar</button>
                </div>
            </div>
        </div>
    `,
    cells: `
        <div class="item-card item-card-cell shadow-sm cell-entry">
            <div class="row g-3">
                <div class="col-md-4">
                    <label>Nombre de Célula</label>
                    <input type="text" class="form-control cell-name" value="Cancer cells">
                </div>
                <div class="col-md-4">
                    <label>Concentración</label>
                    <input type="number" class="form-control cell-conc" value="10">
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
                    <button class="btn btn-outline-danger w-100" onclick="this.closest('.item-card').remove()">Eliminar</button>
                </div>
            </div>
        </div>
    `,
    reactions: `
        <div class="item-card item-card-reaction shadow-sm reaction-entry">
          <div class="row g-3">

            <div class="col-md-4">
              <label>Tipo</label>
              <input type="text" class="form-control reaction-type" value="cell_consumption_waste">
            </div>

            <!-- SUBSTRATES -->
            <div class="col-md-8">
              <label>Substratos</label>
              <div class="input-group">
                <input type="text" class="form-control reaction-substrate-input" placeholder="Ej: Glucose">
                <button class="btn btn-outline-primary" type="button" onclick="addChip(this, 'substrates')">Añadir</button>
              </div>
              <div class="chip-container mt-2" data-field="substrates"></div>
            </div>

            <!-- PRODUCTS -->
            <div class="col-md-8">
              <label>Productos</label>
              <div class="input-group">
                <input type="text" class="form-control reaction-product-input" placeholder="Ej: Lactate">
                <button class="btn btn-outline-primary" type="button" onclick="addChip(this, 'products')">Añadir</button>
              </div>
              <div class="chip-container mt-2" data-field="products"></div>
            </div>

            <!-- BIOLOGICALS -->
            <div class="col-md-8">
              <label>Biologicals</label>
              <div class="input-group">
                <input type="text" class="form-control reaction-biological-input" placeholder="Ej: Cancer cells">
                <button class="btn btn-outline-primary" type="button" onclick="addChip(this, 'biologicals')">Añadir</button>
              </div>
              <div class="chip-container mt-2" data-field="biologicals"></div>
            </div>

            <!-- COEFFICIENTS -->
            <div class="col-md-8">
              <label>Coeficientes (opcional)</label>
              <div class="input-group">
                <input type="number" class="form-control reaction-coef-input" step="any" placeholder="Ej: 0.01">
                <button class="btn btn-outline-primary" type="button" onclick="addCoef(this)">Añadir coef</button>
              </div>
              <div class="chip-container mt-2" data-field="coefficients"></div>
              <div class="text-muted small mt-1">Déjalo vacío si esa reacción no usa coefficients.</div>
            </div>

            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-outline-danger w-100" onclick="this.closest('.item-card').remove()">Eliminar reacción</button>
            </div>

          </div>
        </div>
    `,


    //reactions: `
    //    <div class="item-card shadow-sm reaction-entry">
    //        <div class="row g-3">
    //            <div class="col-md-5">
    //                <label>Tipo</label>
    //                <input type="text" class="form-control reaction-type" value="cell consumption waste">
    //            </div>
    //            <div class="col-md-5">
    //                <label>Substrato</label>
    //                <input type="text" class="form-control reaction-substrates" value="Glucose">
    //            </div>
    //            <div class="col-md-5">
    //                <label>Producto</label>
    //                <input type="text" class="form-control reaction-products" value="Waste">
    //            </div>
    //            <div class="col-md-5">
    //                <label>Biológicos</label>
    //                <input type="text" class="form-control reaction-biologicals" value="Cancer cells">
    //            </div>
    //            <div class="col-md-5">
    //                <label>Coeficientes</label>
    //                <input type="number" class="form-control reaction-coef" value="0.01" step="0.001">
    //            </div>
    //            <div class="col-md-5 d-flex align-items-end">
    //                <button class="btn btn-outline-danger w-100" onclick="this.closest('.item-card').remove()">Eliminar</button>
    //            </div>
    //        </div>
    //    </div>
    //`,
};

function addItem(type) {
    const container = document.getElementById(`container-${type}`);
    container.insertAdjacentHTML('beforeend', templates[type]);
}

function normalizeText(s) {
  return (s ?? "").trim();
}

function addChip(buttonEl, field) {
  const card = buttonEl.closest('.reaction-entry');
  if (!card) return;

  let input;
  if (field === 'substrates') input = card.querySelector('.reaction-substrate-input');
  if (field === 'products') input = card.querySelector('.reaction-product-input');
  if (field === 'biologicals') input = card.querySelector('.reaction-biological-input');

  const value = normalizeText(input?.value);
  if (!value) return;

  const container = card.querySelector(`.chip-container[data-field="${field}"]`);
  if (!container) return;

  // evita duplicados (case-insensitive)
  const existing = Array.from(container.querySelectorAll('.chip'))
    .map(ch => (ch.dataset.value ?? "").toLowerCase());
  if (existing.includes(value.toLowerCase())) {
    input.value = "";
    return;
  }

  container.insertAdjacentHTML('beforeend', `
    <span class="chip badge rounded-pill bg-secondary me-2 mb-2" data-value="${encodeURIComponent(value)}">
      ${escapeHtml(value)}
      <button type="button" class="btn btn-sm btn-link text-light p-0 ms-2"
        onclick="this.closest('.chip').remove()" aria-label="Eliminar">✕</button>
    </span>
    `);

  input.value = "";
}

function addCoef(buttonEl) {
  const card = buttonEl.closest('.reaction-entry');
  if (!card) return;

  const input = card.querySelector('.reaction-coef-input');
  const raw = normalizeText(input?.value);
  if (raw === "") return;

  const num = Number(raw);
  if (!Number.isFinite(num)) {
    alert("Coeficiente inválido (debe ser un número).");
    return;
  }

  const container = card.querySelector(`.chip-container[data-field="coefficients"]`);
  if (!container) return;

  container.insertAdjacentHTML('beforeend', `
    <span class="chip badge rounded-pill bg-success me-2 mb-2" data-value="${num}">
      ${num}
      <button type="button" class="btn btn-sm btn-link text-light p-0 ms-2" onclick="this.closest('.chip').remove()" aria-label="Eliminar">✕</button>
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

// mini-escape para evitar HTML raro si pegan caracteres especiales
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ejecutarSimulacion() {
    // Construimos el JSON final siguiendo tu estructura
    const finalJSON = {
        domain: {
            Lx: parseFloat(document.getElementById('dom_Lx').value),
            Ly: parseFloat(document.getElementById('dom_Ly').value),
            Nx: parseInt(document.getElementById('dom_Nx').value),
            Ny: parseInt(document.getElementById('dom_Ny').value)
        },
        simulation: {
            T: parseInt(document.getElementById('sim_T').value),
            dt: parseFloat(document.getElementById('sim_dt').value),
            times_to_plot: [0, 15, 30, 59],
            run_solver: true
        },
        chemicals: [],
        cells: [],
        reactions: [] 
    };

    // Extraemos los químicos añadidos
    document.querySelectorAll('.chemical-entry').forEach(el => {
        finalJSON.chemicals.push({
            name: el.querySelector('.chem-name').value,
            max_concentration: parseFloat(el.querySelector('.chem-max-concentration').value),
            diffusion_coef: parseFloat(el.querySelector('.chem-coef').value),
            initial_profile: el.querySelector('.chem-profile').value
        });
    });

    // Extraemos las células añadidas
    document.querySelectorAll('.cell-entry').forEach(el => {
        finalJSON.cells.push({
            name: el.querySelector('.cell-name').value,
            concentration: parseFloat(el.querySelector('.cell-conc').value),
            diffusion_coef: parseFloat(el.querySelector('.cell-coef').value),
            shape: el.querySelector('.cell-shape').value
        });
    });

    // Extraemos las reacciones añadidas
    document.querySelectorAll('.reaction-entry').forEach((el) => {
        const type = normalizeText(el.querySelector('.reaction-type')?.value);

        const substrates = getChips(el, 'substrates').map(v => String(v));
        const products = getChips(el, 'products').map(v => String(v));
        const biologicals = getChips(el, 'biologicals').map(v => String(v));

        const coefRaw = getChips(el, 'coefficients');
        const coefficients = coefRaw.map(v => Number(v)).filter(n => Number.isFinite(n));

        const reactionObj = { type, substrates, products, biologicals };

        // solo incluir coefficients si hay alguno (como tu JSON de referencia)
        if (coefficients.length > 0) reactionObj.coefficients = coefficients;

        finalJSON.reactions.push(reactionObj);
    });

    //document.querySelectorAll('.reaction-entry').forEach(el => {
    //    finalJSON.reactions.push({
    //        type: el.querySelector('.reaction-type').value,
    //        substrates: el.querySelector('.reaction-substrates').value,
    //        products: el.querySelector('.reaction-products').value,
    //        biologicals: el.querySelector('.reaction-biologicals').value,
    //        coefficients: parseFloat(el.querySelector('.reaction-coef').value)
    //    });
    //});

    // Mostramos el resultado en el PRE del HTML
    document.getElementById('json-preview').innerText = JSON.stringify(finalJSON, null, 2);
    
    // Aquí iría el fetch('http://localhost:8000/run', ...) para enviar a Python
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