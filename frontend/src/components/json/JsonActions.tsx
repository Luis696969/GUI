import { useState } from 'react';
import type { Dispatch } from 'react';
import type { AppState, ConfigAction } from '../../hooks/useConfigReducer';
import { CONFIG_EXAMPLES } from '../../domain/config/examples';
import type { BuildConfigInput } from '../../domain/config/types';

type JsonActionsProps = {
  state: AppState;
  dispatch: Dispatch<ConfigAction>;
  serializedConfig: string;
  validationStatus: 'valid' | 'warnings' | 'errors';
  onGeneratePreview: () => void;
};

const EMPTY_STATE: AppState = {
  simulation: { T: 1, dt: 0.1, run_solver: true, times_to_plot: [] },
  devices: [],
  interfaces: []
};


function loadInputIntoReducerState(state: AppState, dispatch: Dispatch<ConfigAction>, input: BuildConfigInput) {
  dispatch({
    type: 'simulation/replace',
    payload: {
      T: input.simulation?.T ?? EMPTY_STATE.simulation.T,
      dt: input.simulation?.dt ?? EMPTY_STATE.simulation.dt,
      run_solver: input.simulation?.run_solver ?? EMPTY_STATE.simulation.run_solver,
      times_to_plot: input.simulation?.times_to_plot ?? EMPTY_STATE.simulation.times_to_plot
    }
  });

  state.devices.forEach((device) => dispatch({ type: 'device/remove', payload: { deviceId: device.id } }));
  for (let index = state.interfaces.length - 1; index >= 0; index -= 1) {
    dispatch({ type: 'interface/remove', payload: { index } });
  }

  (input.devices ?? []).forEach((device) => dispatch({ type: 'device/add', payload: device }));
  (input.interfaces ?? []).forEach((iface) => dispatch({ type: 'interface/add', payload: iface }));
}

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  document.body.appendChild(textarea);
  textarea.select();

  let didCopy = false;

  try {
    didCopy = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }

  return didCopy;
}

export function JsonActions({
  state,
  dispatch,
  serializedConfig,
  validationStatus,
  onGeneratePreview
}: JsonActionsProps) {
  const [status, setStatus] = useState<string>('');

  const validationStatusText =
    validationStatus === 'errors'
      ? 'JSON has errors'
      : validationStatus === 'warnings'
        ? 'JSON has warnings'
        : 'JSON is valid';

  const refreshPreview = () => {
    onGeneratePreview();
    setStatus('Preview refreshed');
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(serializedConfig);
      setStatus('Copied to clipboard');
      return;
    } catch {
      const didCopy = fallbackCopyText(serializedConfig);
      setStatus(didCopy ? 'Copied to clipboard' : 'Clipboard unavailable in this environment');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([serializedConfig], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'biosim-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    setStatus('Downloaded successfully');
  };

  const resetState = () => {
    loadInputIntoReducerState(state, dispatch, EMPTY_STATE);
    setStatus('State reset');
  };

  const loadExample = (exampleKey: string) => {
    const example = CONFIG_EXAMPLES.find((candidate) => candidate.key === exampleKey);
    if (!example) return;

    loadInputIntoReducerState(state, dispatch, example.input);
    setStatus(`Loaded example: ${example.label}`);
  };

  return (
    <section className="editor-panel">
      <h2>JSON Actions</h2>
      <p className="section-lead">Copy, download, or reset the workspace state while iterating on a valid configuration payload.</p>
      <div className="button-row">
        <button onClick={refreshPreview}>Generate/Refresh preview</button>
        <button onClick={copyJson}>Copy JSON</button>
        <button onClick={downloadJson}>Download JSON</button>
        <button onClick={resetState}>Reset state</button>
      </div>
      <div className="button-row">
        {CONFIG_EXAMPLES.map((example) => (
          <button key={example.key} onClick={() => loadExample(example.key)} title={example.description}>
            {example.label}
          </button>
        ))}
      </div>
      <p className="muted">{validationStatusText}</p>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
