export function updateDeviceCounter(dom) {
  const count = dom.devicesContainer.querySelectorAll('.device-entry').length;
  dom.countDevices.textContent = String(count);
  dom.devicesEmpty.classList.toggle('d-none', count > 0);
}

export function updateInterfaceCounter(dom) {
  const count = dom.interfacesContainer.querySelectorAll('.interface-entry').length;
  dom.countInterfaces.textContent = String(count);
  dom.interfacesEmpty.classList.toggle('d-none', count > 0);
}
