export function renderJsonPreview(previewEl, config) {
  const text = JSON.stringify(config, null, 2);
  previewEl.textContent = text;
  return text;
}

export function renderJsonPreviewError(previewEl, message = 'JSON generation failed.') {
  previewEl.textContent = message;
}

export async function copyJsonPreview(previewEl) {
  const content = previewEl.textContent || '';
  await navigator.clipboard.writeText(content);
}

export function downloadJsonPreview(previewEl, filename = 'simulation-config.json') {
  const blob = new Blob([previewEl.textContent || ''], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
