import { makeCardHeader } from './sharedTemplates.js';

export function interfaceCardTemplate(interfaceId, index, { buildOptions, allowedInterfaceSides }) {
  return `
    <div class="dynamic-card interface-entry" data-interface-id="${interfaceId}" data-collapsible-card>
      ${makeCardHeader(`Interface ${index}`, 'Connects two devices through boundary segments.')}
      <div class="collapsible-content">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Device 1</label>
            <select class="form-select iface-device1"></select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Device 2</label>
            <select class="form-select iface-device2"></select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Device 1 side</label>
            <select class="form-select iface-side1">
              ${buildOptions(allowedInterfaceSides, 'right')}
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Segment 1 start</label>
            <input type="number" class="form-control iface-start1" step="any" value="0">
          </div>

          <div class="col-md-3">
            <label class="form-label">Segment 1 end</label>
            <input type="number" class="form-control iface-stop1" step="any" value="1">
          </div>

          <div class="col-md-3">
            <label class="form-label">Boundary length 1</label>
            <input type="text" class="form-control iface-limit1" disabled value="-">
          </div>

          <div class="col-md-3">
            <label class="form-label">Device 2 side</label>
            <select class="form-select iface-side2">
              ${buildOptions(allowedInterfaceSides, 'left')}
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Segment 2 start</label>
            <input type="number" class="form-control iface-start2" step="any" value="0">
          </div>

          <div class="col-md-3">
            <label class="form-label">Segment 2 end</label>
            <input type="number" class="form-control iface-stop2" step="any" value="1">
          </div>

          <div class="col-md-3">
            <label class="form-label">Boundary length 2</label>
            <input type="text" class="form-control iface-limit2" disabled value="-">
          </div>
        </div>

        <section class="nested-section">
          <div class="nested-section-header">
            <h4 class="nested-section-title">Interfacial diffusion by chemical</h4>
          </div>

          <div class="iface-chemicals-note text-muted small mb-2">
            Select two devices to display shared chemicals.
          </div>

          <div class="iface-diffusion-container row g-3"></div>
        </section>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-outline-danger btn-sm remove-card-btn">Remove interface</button>
        </div>
      </div>
    </div>
  `;
}
