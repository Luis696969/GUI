import type { Dispatch } from 'react';
import type { AppState, ConfigAction } from '../hooks/useConfigReducer';
import { configActions } from '../hooks/useConfigReducer';
import { DEFAULT_DEVICE } from '../domain/devices/defaults';
import { DEFAULT_REACTION } from '../domain/reactions/defaults';

export type StatePlaygroundProps = {
  state: AppState;
  dispatch: Dispatch<ConfigAction>;
  sharedChemicals: Array<{ index: number; device1: string; device2: string; sharedChemicals: string[] }>;
  deviceSummaries: Array<{ id: string; chemicals: number; cells: number; entries: number; reactions: number }>;
  rootReactions: Array<{ type: string }>;
};

export function StatePlayground({
  state,
  dispatch,
  sharedChemicals,
  deviceSummaries,
  rootReactions
}: StatePlaygroundProps) {
  const firstDeviceId = state.devices[0]?.id;

  const addDevice = () => {
    const index = state.devices.length + 1;
    dispatch(
      configActions.addDevice({
        ...DEFAULT_DEVICE,
        id: `device_${index}`
      })
    );
  };

  const addChemical = () => {
    if (!firstDeviceId) return;
    dispatch(
      configActions.addChemical({
        deviceId: firstDeviceId,
        chemical: {
          name: `chem_${state.devices[0].chemicals.length + 1}`
        }
      })
    );
  };

  const addReaction = () => {
    if (!firstDeviceId) return;
    dispatch(
      configActions.addReaction({
        deviceId: firstDeviceId,
        reaction: {
          ...DEFAULT_REACTION,
          type: 'sink'
        }
      })
    );
  };

  return (
    <section className="app-card">
      <h1>Config reducer state</h1>
      <p>Devices: {state.devices.length}</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={addDevice}>Add device</button>
        <button onClick={addChemical} disabled={!firstDeviceId}>
          Add chemical to first device
        </button>
        <button onClick={addReaction} disabled={!firstDeviceId}>
          Add reaction to first device
        </button>
      </div>

      <h2>Device summaries</h2>
      <pre>{JSON.stringify(deviceSummaries, null, 2)}</pre>

      <h2>Shared chemicals between interfaces</h2>
      <pre>{JSON.stringify(sharedChemicals, null, 2)}</pre>

      <h2>Root reaction projection</h2>
      <pre>{JSON.stringify(rootReactions, null, 2)}</pre>
    </section>
  );
}
