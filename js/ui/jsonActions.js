export async function copyJson(previewConfig, setStatus, dom) {
  let config;
  try { ({ config } = previewConfig()); } catch { return; }
  const json = JSON.stringify(config, null, 2);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json);
      setStatus(dom, 'success', 'JSON copied to clipboard.');
      return;
    }
  } catch {
    // Fallback below.
  }

  const fallbackInput = document.createElement('textarea');
  fallbackInput.value = json;
  fallbackInput.setAttribute('readonly', '');
  fallbackInput.style.position = 'absolute';
  fallbackInput.style.left = '-9999px';
  document.body.appendChild(fallbackInput);
  fallbackInput.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(fallbackInput);
  setStatus(dom, copied ? 'success' : 'error', copied ? 'JSON copied to clipboard.' : 'Unable to copy JSON.');
}

export function downloadJson(previewConfig, setStatus, dom) {
  let config;
  try { ({ config } = previewConfig()); } catch { return; }
  const json = `${JSON.stringify(config, null, 2)}\n`;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'biosim-config.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus(dom, 'success', 'JSON downloaded as biosim-config.json.');
}
