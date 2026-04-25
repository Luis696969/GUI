export function renderWarnings(warningsBox, warnings, escapeHtml) {
  if (!warnings.length) {
    warningsBox.classList.add('d-none');
    warningsBox.innerHTML = '';
    return;
  }

  warningsBox.classList.remove('d-none');
  warningsBox.innerHTML = `
    <strong>Warnings</strong>
    <ul class="mb-0">
      ${warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}
    </ul>
  `;
}
