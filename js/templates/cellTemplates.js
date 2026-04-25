import { makeCardHeader } from './sharedTemplates.js';

export function cellCardTemplate({ buildOptions, allowedCellShapes }) {
  return `
    <div class="dynamic-card cell-entry" data-collapsible-card>
      ${makeCardHeader('Cell population', 'Concentration, diffusion and initial geometry.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input type="text" class="form-control cell-name" placeholder="Example: Cancer cells">
          </div>

          <div class="col-md-3">
            <label class="form-label">Concentration</label>
            <input type="number" class="form-control cell-conc" min="0" step="any" value="1">
          </div>

          <div class="col-md-3">
            <label class="form-label">Diffusion coefficient</label>
            <input type="number" class="form-control cell-coef" min="0" step="any" value="0.0">
          </div>

          <div class="col-md-6">
            <label class="form-label">Shape</label>
            <select class="form-select cell-shape">
              ${buildOptions(allowedCellShapes, 'ellipse')}
            </select>
          </div>

          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
