import { useState } from 'react';
import type { Dispatch } from 'react';
import type { AppState, ConfigAction } from '../../hooks/useConfigReducer';

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
      <p className="section-lead">Copy, download, or reset the workspace state while iterating on a valid configuration payload.</p>
      <div className="button-row">
        <button onClick={refreshPreview}>Generate/Refresh preview</button>
        <button onClick={copyJson}>Copy JSON</button>
        <button onClick={downloadJson}>Download JSON</button>
        <button onClick={resetState}>Reset state</button>
      </div>
      <p className="muted">{validationStatusText}</p>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
