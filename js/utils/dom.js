export const selectors = {
  devicesContainer: '#container-devices',
  devicesEmpty: '#devices-empty',
  countDevices: '#count-devices',
  interfacesContainer: '#container-interfaces',
  interfacesEmpty: '#interfaces-empty',
  countInterfaces: '#count-interfaces',
  runBtn: '#run-btn',
  previewBtn: '#preview-btn',
  addDeviceBtn: '#add-device-btn',
  addInterfaceBtn: '#add-interface-btn',
  simT: '#sim_T',
  simDt: '#sim_dt',
  simRunSolver: '#sim_run_solver',
  simTimesToPlot: '#sim_times_to_plot',
  jsonPreview: '#json-preview',
  statusBox: '#status-box',
  warningsBox: '#warnings-box',
  serverBox: '#server-box',
  resultSummary: '#result-summary',
  plots: '#plots'
};

export function query(selector, root = document) {
  return root.querySelector(selector);
}

export function queryAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function getDom() {
  return Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, query(selector)]));
}
