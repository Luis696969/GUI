const templates = {

devices: `
<div class="item-card device-entry">
    <input class="device-name form-control mb-2" placeholder="Nombre dispositivo">
    <button onclick="this.parentElement.remove(); updateDeviceOptions()">Eliminar</button>
</div>`,

chemicals: `
<div class="item-card chemical-entry">
    <input class="chem-name form-control mb-2" placeholder="Nombre químico">
    <select class="chem-device form-select mb-2"></select>
    <button onclick="this.parentElement.remove()">Eliminar</button>
</div>`,

cells: `
<div class="item-card cell-entry">
    <input class="cell-name form-control mb-2" placeholder="Nombre célula">
    <button onclick="this.parentElement.remove(); updateReactionSelectOptions()">Eliminar</button>
</div>`,

reactions: `
<div class="item-card reaction-entry">

<select class="reaction-substrate-select form-select mb-2"></select>
<button onclick="addChip(this,'substrates')">Añadir substrato</button>
<div data-field="substrates"></div>

<select class="reaction-product-select form-select mb-2"></select>
<button onclick="addChip(this,'products')">Añadir producto</button>
<div data-field="products"></div>

<select class="reaction-biological-select form-select mb-2"></select>
<button onclick="addChip(this,'biologicals')">Añadir célula</button>
<div data-field="biologicals"></div>

</div>`
};

function addItem(type){
    const container = document.getElementById("container-"+type);
    container.insertAdjacentHTML("beforeend", templates[type]);

    if(type==="devices") updateDeviceOptions();
    if(type==="chemicals"){
        updateDeviceOptions();
        updateReactionSelectOptions();
    }
    if(type==="cells") updateReactionSelectOptions();
    if(type==="reactions") updateReactionSelectOptions();
}

function getDeviceNames(){
    return [...document.querySelectorAll(".device-name")].map(e=>e.value);
}

function getChemicalNames(){
    return [...document.querySelectorAll(".chem-name")].map(e=>e.value);
}

function getCellNames(){
    return [...document.querySelectorAll(".cell-name")].map(e=>e.value);
}

function updateDeviceOptions(){
    const devices = getDeviceNames();
    document.querySelectorAll(".chem-device").forEach(sel=>{
        sel.innerHTML="";
        devices.forEach(d=>{
            sel.innerHTML+=`<option>${d}</option>`;
        });
    });
}

function updateReactionSelectOptions(){
    const chems = getChemicalNames();
    const cells = getCellNames();

    document.querySelectorAll(".reaction-entry").forEach(r=>{
        const sub = r.querySelector(".reaction-substrate-select");
        const prod = r.querySelector(".reaction-product-select");
        const bio = r.querySelector(".reaction-biological-select");

        sub.innerHTML = chems.map(c=>`<option>${c}</option>`).join("");
        prod.innerHTML = chems.map(c=>`<option>${c}</option>`).join("");
        bio.innerHTML = cells.map(c=>`<option>${c}</option>`).join("");
    });
}

function addChip(btn, field){
    const card = btn.closest(".reaction-entry");
    const select = card.querySelector("select");
    const value = select.value;

    const container = card.querySelector(`[data-field=${field}]`);
    container.innerHTML += `<span>${value}</span> `;
}

function ejecutarSimulacion(){
    const json = {
        devices: getDeviceNames(),
        chemicals: getChemicalNames(),
        cells: getCellNames()
    };

    document.getElementById("json-preview").innerText = JSON.stringify(json,null,2);
}
