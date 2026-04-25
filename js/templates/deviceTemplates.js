import { makeCardHeader } from './sharedTemplates.js';

export function deviceCardTemplate(deviceId, index) {
  return `
    <div class="dynamic-card device-entry" data-device-id="${deviceId}" data-collapsible-card>
      ${makeCardHeader(`Device ${index}`, 'Domain, chemicals, cells, entries and reactions.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Device name</label>
            <input type="text" class="form-control device-name" value="Device ${index}" placeholder="Device ${index}">
          </div>

          <div class="col-md-3">
            <label class="form-label">Lx (mm)</label>
            <input type="number" class="form-control dev_Lx" min="0.000001" step="any" value="0.3">
          </div>

          <div class="col-md-3">
            <label class="form-label">Ly (mm)</label>
            <input type="number" class="form-control dev_Ly" min="0.000001" step="any" value="9.75">
          </div>

          <div class="col-md-3">
            <label class="form-label">Nx</label>
            <input type="number" class="form-control dev_Nx" min="3" step="1" value="20">
          </div>

          <div class="col-md-3">
            <label class="form-label">Ny</label>
            <input type="number" class="form-control dev_Ny" min="3" step="1" value="500">
          </div>

          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Remove device</button>
          </div>
        </div>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Chemicals</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-chemical-btn">+ Add chemical</button>
          </div>
          <div class="items-container device-chemicals"></div>
        </section>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Cells</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-cell-btn">+ Add cell</button>
          </div>
          <div class="items-container device-cells"></div>
        </section>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Entries / inflows</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-entry-btn">+ Add entry</button>
          </div>
          <div class="items-container device-entries"></div>
        </section>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Reactions</h4>
            <button type="button" class="btn btn-outline-primary btn-sm add-reaction-btn">+ Add reaction</button>
          </div>
          <div class="items-container device-reactions"></div>
        </section>
      </div>
    </div>
  `;
}
