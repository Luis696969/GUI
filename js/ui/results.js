import { escapeHtml } from '../utils/html.js';

export function clearResults(dom) {
  dom.resultSummary.innerHTML = '';
  dom.plots.innerHTML = '';
  dom.serverBox.classList.add('d-none');
  dom.serverBox.innerHTML = '';
}

export function renderBackendResults(dom, payload) {
  if (!payload) return;
  const devices = payload.devices || [];
  const images = payload.images || [];
  dom.resultSummary.innerHTML = `<div class="result-card"><ul class="result-list"><li><strong>Run id:</strong> ${escapeHtml(payload.run_id || '-')}</li><li><strong>Devices:</strong> ${escapeHtml(devices.join(', ') || '-')}</li><li><strong>Interfaces:</strong> ${escapeHtml(payload.n_interfaces ?? '-')}</li><li><strong>Reactions:</strong> ${escapeHtml(payload.n_reactions ?? '-')}</li></ul></div>`;
  dom.plots.innerHTML = '';
  images.forEach((imagePath) => {
    const absolutePath = imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000${imagePath}`;
    dom.plots.insertAdjacentHTML('beforeend', `<div class="result-card"><img class="plot-img" src="${escapeHtml(absolutePath)}" alt="Simulation plot"><a class="plot-link" href="${escapeHtml(absolutePath)}" target="_blank" rel="noopener">Open image</a></div>`);
  });
  dom.serverBox.classList.remove('d-none');
  dom.serverBox.innerHTML = `<div class="result-card"><strong>Backend response</strong><pre class="json-preview mt-3 mb-0">${escapeHtml(JSON.stringify(payload, null, 2))}</pre></div>`;
}
