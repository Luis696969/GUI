import { useState } from 'react';
import type { Dispatch } from 'react';
import type { AppState, ConfigAction } from '../../hooks/useConfigReducer';

type JsonActionsProps = {
  state: AppState;
  dispatch: Dispatch<ConfigAction>;
};

const EMPTY_STATE: AppState = {
  simulation: { T: 1, dt: 0.1, run_solver: true, times_to_plot: [] },
  devices: [],
  interfaces: []
};

export function JsonActions({ state, dispatch }: JsonActionsProps) {
  const [status, setStatus] = useState<string>('');

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
      setStatus('JSON copied to clipboard');
    } catch {
      setStatus('Clipboard unavailable in this environment');
    }
  };

  const resetState = () => {
    dispatch({ type: 'simulation/replace', payload: EMPTY_STATE.simulation });
    state.devices.forEach((device) => dispatch({ type: 'device/remove', payload: { deviceId: device.id } }));
    for (let index = state.interfaces.length - 1; index >= 0; index -= 1) {
      dispatch({ type: 'interface/remove', payload: { index } });
    }
    setStatus('State reset');
  };

  return (
    <section className="editor-panel">
      <h2>JSON Actions</h2>
      <div className="button-row">
        <button onClick={copyJson}>Copy JSON</button>
        <button onClick={resetState}>Reset state</button>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
