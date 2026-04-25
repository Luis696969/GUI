import { makeCardHeader } from './sharedTemplates.js';

export function chemicalCardTemplate({ buildOptions, allowedInitialProfiles }) {
  return `
    <div class="dynamic-card chemical-entry" data-collapsible-card>
      ${makeCardHeader('Chemical', 'Chemical species, maximum concentration, diffusion and initial profile.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input type="text" class="form-control chem-name" placeholder="Example: Glucose">
          </div>

          <div class="col-md-3">
            <label class="form-label">Max concentration</label>
            <input type="number" class="form-control chem-max-concentration" min="0" step="any" value="1">
          </div>

          <div class="col-md-3">
            <label class="form-label">Diffusion coefficient</label>
            <input type="number" class="form-control chem-coef" min="0" step="any" value="0.01">
          </div>

          <div class="col-md-6">
            <label class="form-label">Initial profile</label>
            <select class="form-select chem-profile">
              ${buildOptions(allowedInitialProfiles, 'uniform')}
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
