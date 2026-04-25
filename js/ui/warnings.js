import { escapeHtml } from '../utils/html.js';

export function renderWarnings(dom, warnings) {
  if (!warnings.length) {
    dom.warningsBox.classList.add('d-none');
    dom.warningsBox.innerHTML = '';
    return;
  }
  dom.warningsBox.classList.remove('d-none');
  dom.warningsBox.innerHTML = `<strong>Warnings</strong><ul class="mb-0">${warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}</ul>`;
}
