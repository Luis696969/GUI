function updateBadge(container, emptyState, badgeEl, selector) {
  const count = container.querySelectorAll(selector).length;
  badgeEl.textContent = String(count);
  emptyState.classList.toggle('d-none', count > 0);
}

export function updateDeviceCounters(dom) {
  updateBadge(dom.devicesContainer, dom.devicesEmpty, dom.countDevices, '.device-entry');
}

export function updateInterfaceCounters(dom) {
  updateBadge(dom.interfacesContainer, dom.interfacesEmpty, dom.countInterfaces, '.interface-entry');
}
