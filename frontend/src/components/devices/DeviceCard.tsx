import type { Dispatch } from 'react';
import type { DeviceModel } from '../../domain/devices/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { DEFAULT_REACTION } from '../../domain/reactions/defaults';
import { ChemicalCard } from './ChemicalCard';
import { CellCard } from './CellCard';
import { EntryCard } from './EntryCard';
import { parseRequiredNumber } from '../formUtils';

type DeviceCardProps = {
  device: DeviceModel;
  dispatch: Dispatch<ConfigAction>;
};

export function DeviceCard({ device, dispatch }: DeviceCardProps) {
  return (
    <article className="editor-card">
      <header className="card-header">
        <h3>{device.id || 'Unnamed device'}</h3>
        <button onClick={() => dispatch(configActions.removeDevice({ deviceId: device.id }))}>Remove device</button>
      </header>

      <div className="field-grid">
        <label>
          Device ID
          <input
            value={device.id}
            onChange={(event) =>
              dispatch(configActions.updateDevice({ deviceId: device.id, patch: { id: event.target.value } }))
            }
          />
        </label>
        <label>
          Lx
          <input
            type="number"
            step="0.1"
            value={device.domain.Lx}
            onChange={(event) =>
              dispatch(
                configActions.updateDevice({
                  deviceId: device.id,
                  patch: { domain: { ...device.domain, Lx: parseRequiredNumber(event.target.value, device.domain.Lx) } }
                })
              )
            }
          />
        </label>
        <label>
          Ly
          <input
            type="number"
            step="0.1"
            value={device.domain.Ly}
            onChange={(event) =>
              dispatch(
                configActions.updateDevice({
                  deviceId: device.id,
                  patch: { domain: { ...device.domain, Ly: parseRequiredNumber(event.target.value, device.domain.Ly) } }
                })
              )
            }
          />
        </label>
        <label>
          Nx
          <input
            type="number"
            value={device.domain.Nx}
            onChange={(event) =>
              dispatch(
                configActions.updateDevice({
                  deviceId: device.id,
                  patch: { domain: { ...device.domain, Nx: parseRequiredNumber(event.target.value, device.domain.Nx) } }
                })
              )
            }
          />
        </label>
        <label>
          Ny
          <input
            type="number"
            value={device.domain.Ny}
            onChange={(event) =>
              dispatch(
                configActions.updateDevice({
                  deviceId: device.id,
                  patch: { domain: { ...device.domain, Ny: parseRequiredNumber(event.target.value, device.domain.Ny) } }
                })
              )
            }
          />
        </label>
      </div>

      <div className="stack-section">
        <div className="section-title-row">
          <h4>Chemicals</h4>
          <button
            onClick={() =>
              dispatch(
                configActions.addChemical({
                  deviceId: device.id,
                  chemical: { name: `chemical_${device.chemicals.length + 1}` }
                })
              )
            }
          >
            Add chemical
          </button>
        </div>
        {device.chemicals.map((chemical) => (
          <ChemicalCard key={chemical.name} deviceId={device.id} chemical={chemical} dispatch={dispatch} />
        ))}
      </div>

      <div className="stack-section">
        <div className="section-title-row">
          <h4>Cells</h4>
          <button
            onClick={() =>
              dispatch(
                configActions.addCell({
                  deviceId: device.id,
                  cell: { name: `cell_${device.cells.length + 1}` }
                })
              )
            }
          >
            Add cell
          </button>
        </div>
        {device.cells.map((cell) => (
          <CellCard key={cell.name} deviceId={device.id} cell={cell} dispatch={dispatch} />
        ))}
      </div>

      <div className="stack-section">
        <div className="section-title-row">
          <h4>Entries</h4>
          <button
            onClick={() =>
              dispatch(
                configActions.addEntry({
                  deviceId: device.id,
                  entry: { position: [0, 0], chemical: '', concentration: 0 }
                })
              )
            }
          >
            Add entry
          </button>
        </div>
        {device.entries.map((entry, index) => (
          <EntryCard key={`entry-${index}`} deviceId={device.id} index={index} entry={entry} dispatch={dispatch} />
        ))}
      </div>

      <div className="section-title-row">
        <h4>Reactions: {device.reactions.length}</h4>
        <button
          onClick={() =>
            dispatch(
              configActions.addReaction({
                deviceId: device.id,
                reaction: { ...DEFAULT_REACTION, type: `reaction_${device.reactions.length + 1}` }
              })
            )
          }
        >
          Add reaction
        </button>
      </div>
    </article>
  );
}
