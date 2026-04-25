import { parseNumberCsv, readNumber } from '../utils/parse.js';
import { validateTimeStep, validateTimesToPlot } from '../validators/validateField.js';
import { compactObject } from './buildUtils.js';

function buildTimesToPlot(T, dt) {
  return [...new Set([0, 15, 30, 59, T].map((v) => Math.max(0, Math.min(v, T))).map((v) => Math.round(v / dt) * dt).map((v) => Number(v.toFixed(12))).filter((v) => v >= 0 && v <= T))].sort((a, b) => a - b);
}

export function buildSimulation(dom, warnings) {
  const T = readNumber(dom.simT.value, 'Total simulation time T', { strictlyPositive: true });
  const dt = readNumber(dom.simDt.value, 'Time step dt', { strictlyPositive: true });
  validateTimeStep(T, dt);

  const manualTimes = parseNumberCsv(dom.simTimesToPlot.value, 'Times to plot');
  const timesToPlot = manualTimes.length > 0 ? manualTimes : buildTimesToPlot(T, dt);

  validateTimesToPlot(timesToPlot, T);
  timesToPlot.forEach((time) => {
    const step = time / dt;
    if (Math.abs(step - Math.round(step)) > 1e-8) warnings.push(`Time to plot ${time} is not aligned with dt=${dt}; the backend may round it.`);
  });

  return compactObject({ T, dt, times_to_plot: timesToPlot, run_solver: dom.simRunSolver.value === 'true' });
}
