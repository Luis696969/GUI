import { makeCardHeader } from './sharedTemplates.js';

export function reactionCardTemplate({ buildOptions, allowedReactionTypes }) {
  return `
    <div class="dynamic-card reaction-entry" data-collapsible-card>
      ${makeCardHeader('Reaction', 'Global reaction definition checked against each device.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Type</label>
            <select class="form-select reaction-type">
              ${buildOptions(allowedReactionTypes, 'cell_consumption_waste')}
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Substrates, comma-separated</label>
            <input type="text" class="form-control reaction-substrates" placeholder="Example: Glucose">
          </div>

          <div class="col-md-6">
            <label class="form-label">Products, comma-separated</label>
            <input type="text" class="form-control reaction-products" placeholder="Example: Lactate">
          </div>

          <div class="col-md-6">
            <label class="form-label">Biologicals, comma-separated</label>
            <input type="text" class="form-control reaction-biologicals" placeholder="Example: Cancer cells">
          </div>

          <div class="col-12">
            <label class="form-label">Coefficients, comma-separated, optional</label>
            <input type="text" class="form-control reaction-coefficients" placeholder="Example: 0.1, 2">
          </div>

          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Remove reaction</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
