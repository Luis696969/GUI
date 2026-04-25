import type { Dispatch } from 'react';
import { DEFAULT_DEVICE } from '../../domain/devices/defaults';
import type { DeviceModel } from '../../domain/devices/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { DeviceCard } from './DeviceCard';

type DevicesPanelProps = {
  devices: DeviceModel[];
  dispatch: Dispatch<ConfigAction>;
};

export function DevicesPanel({ devices, dispatch }: DevicesPanelProps) {
  return (
    <section className="editor-panel">
      <div className="section-title-row">
        <h2>Devices ({devices.length})</h2>
        <button
          onClick={() =>
            dispatch(
              configActions.addDevice({
                ...DEFAULT_DEVICE,
                id: `device_${devices.length + 1}`
              })
            )
          }
        >
          Add device
        </button>
      </div>
      <p className="section-lead">Configure each spatial domain, species set, cells, and boundary entries that appear in the final JSON.</p>

      <div className="card-grid">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} dispatch={dispatch} />
        ))}
      </div>
    </section>
  );
}
