import { parseNumberCsv, readNumber } from '../utils/parse.js';
import { compactObject } from './buildUtils.js';

function buildTimesToPlot(T, dt) {
  return [...new Set([0, 15, 30, 59, T].map((v) => Math.max(0, Math.min(v, T))).map((v) => Math.round(v / dt) * dt).map((v) => Number(v.toFixed(12))).filter((v) => v >= 0 && v <= T))].sort((a, b) => a - b);
}

export function buildSimulation(dom, warnings) {
  const T = readNumber(dom.simT.value, 'Total simulation time T', { strictlyPositive: true });
  const dt = readNumber(dom.simDt.value, 'Time step dt', { strictlyPositive: true });
  if (dt > T) throw new Error('Time step dt must be lower than or equal to total simulation time T.');

  const manualTimes = parseNumberCsv(dom.simTimesToPlot.value, 'Times to plot');
  const timesToPlot = manualTimes.length > 0 ? manualTimes : buildTimesToPlot(T, dt);

  timesToPlot.forEach((time) => {
    if (time < 0 || time > T) throw new Error(`Time to plot ${time} must be between 0 and T (${T}).`);
    const step = time / dt;
    if (Math.abs(step - Math.round(step)) > 1e-8) warnings.push(`Time to plot ${time} is not aligned with dt=${dt}; the backend may round it.`);
  });

  return compactObject({ T, dt, times_to_plot: timesToPlot, run_solver: dom.simRunSolver.value === 'true' });
}
