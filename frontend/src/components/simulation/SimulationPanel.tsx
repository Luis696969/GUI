import type { Dispatch } from 'react';
import type { AppState, ConfigAction } from '../../hooks/useConfigReducer';
import { configActions } from '../../hooks/useConfigReducer';
import { parseNumberList, parseRequiredNumber } from '../formUtils';

type SimulationPanelProps = {
  simulation: AppState['simulation'];
  dispatch: Dispatch<ConfigAction>;
};

export function SimulationPanel({ simulation, dispatch }: SimulationPanelProps) {
  return (
    <section className="editor-panel">
      <h2>Simulation</h2>
      <div className="field-grid">
        <label>
          Total time (T)
          <input
            type="number"
            step="0.01"
            value={simulation.T}
            onChange={(event) =>
              dispatch(configActions.updateSimulation({ T: parseRequiredNumber(event.target.value, simulation.T) }))
            }
          />
        </label>
        <label>
          dt
          <input
            type="number"
            step="0.01"
            value={simulation.dt}
            onChange={(event) =>
              dispatch(configActions.updateSimulation({ dt: parseRequiredNumber(event.target.value, simulation.dt) }))
            }
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={simulation.run_solver}
            onChange={(event) => dispatch(configActions.updateSimulation({ run_solver: event.target.checked }))}
          />
          Run solver
        </label>
        <label>
          Times to plot (comma separated)
          <input
            type="text"
            value={simulation.times_to_plot.join(', ')}
            onChange={(event) =>
              dispatch(configActions.updateSimulation({ times_to_plot: parseNumberList(event.target.value) }))
            }
          />
        </label>
      </div>
    </section>
  );
}
