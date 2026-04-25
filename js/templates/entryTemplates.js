import { makeCardHeader } from './sharedTemplates.js';

export function entryCardTemplate() {
  return `
    <div class="dynamic-card entry-entry" data-collapsible-card>
      ${makeCardHeader('Entry / inflow', 'Position, chemical and concentration.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">x position</label>
            <input type="number" class="form-control entry-x" min="0" step="any" value="0">
          </div>

          <div class="col-md-3">
            <label class="form-label">y position</label>
            <input type="number" class="form-control entry-y" min="0" step="any" value="0">
          </div>

          <div class="col-md-3">
            <label class="form-label">Chemical</label>
            <select class="form-select entry-chemical"></select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Concentration</label>
            <input type="number" class="form-control entry-concentration" min="0" step="any" value="1">
          </div>

          <div class="col-12 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Remove entry</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
