export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildOptions(values, selected = '') {
  return values
    .map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`)
    .join('');
}

export function buildSelectOptions(values, { selected = '', emptyLabel = 'Select option' } = {}) {
  const optionRows = values.map(item => {
    if (typeof item === 'object' && item !== null) {
      const value = item.value ?? '';
      const label = item.label ?? item.value ?? '';
      return `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }

    return `<option value="${escapeHtml(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`;
  });

  return [`<option value="">${escapeHtml(emptyLabel)}</option>`, ...optionRows].join('');
}
