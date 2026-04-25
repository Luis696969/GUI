export function renderJsonPreview(dom, config) {
  dom.jsonPreview.textContent = JSON.stringify(config, null, 2);
}
