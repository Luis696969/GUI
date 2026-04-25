export function setStatus(statusBox, type, message) {
  statusBox.className = `status-box status-${type}`;
  statusBox.textContent = message;
}
