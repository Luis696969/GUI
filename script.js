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
        <div class="item-card shadow-sm reaction-entry">
            <div class="row g-3">
                <div class="col-md-5">
                    <label>Tipo</label>
                    <input type="text" class="form-control reaction-type" value="cell consumption waste">
                </div>
                <div class="col-md-5">
                    <label>Substrato</label>
                    <input type="text" class="form-control reaction-substrates" value="Glucose">
                </div>
                <div class="col-md-5">
                    <label>Producto</label>
                    <input type="text" class="form-control reaction-products" value="Waste">
                </div>
                <div class="col-md-5">
                    <label>Biológicos</label>
                    <input type="text" class="form-control reaction-biologicals" value="Cancer cells">
                </div>
                <div class="col-md-5">
                    <label>Coeficientes</label>
                    <input type="number" class="form-control reaction-coef" value="0.01" step="0.001">
                </div>
                <div class="col-md-5 d-flex align-items-end">
                    <button class="btn btn-outline-danger w-100" onclick="this.closest('.item-card').remove()">Eliminar</button>
                </div>
            </div>
        </div>
    `,
};

function addItem(type) {
    const container = document.getElementById(`container-${type}`);
    container.insertAdjacentHTML('beforeend', templates[type]);
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
    document.querySelectorAll('.reaction-entry').forEach(el => {
        finalJSON.reactions.push({
            type: el.querySelector('.reaction-type').value,
            substrates: el.querySelector('.reaction-substrates').value,
            products: el.querySelector('.reaction-products').value,
            biologicals: el.querySelector('.reaction-biologicals').value,
            coefficients: parseFloat(el.querySelector('.reaction-coef').value)
        });
    });

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