export function setStatus(dom, type, message) {
  dom.statusBox.className = `status-box status-${type}`;
  dom.statusBox.textContent = message;
}
