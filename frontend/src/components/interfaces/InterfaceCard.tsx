import type { Dispatch } from 'react';
import type { InterfaceModel } from '../../domain/interfaces/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { parseRequiredNumber } from '../formUtils';

type InterfaceCardProps = {
  iface: InterfaceModel;
  index: number;
  dispatch: Dispatch<ConfigAction>;
};

export function InterfaceCard({ iface, index, dispatch }: InterfaceCardProps) {
  const updateLoc = (
    side: 'device1' | 'device2',
    segment: 'start' | 'stop',
    axis: 0 | 1,
    raw: string,
    fallback: number
  ) => {
    const next = parseRequiredNumber(raw, fallback);
    const oldPair = iface.locs[side][segment];
    const newPair: [number, number] = axis === 0 ? [next, oldPair[1]] : [oldPair[0], next];
    dispatch(
      configActions.updateInterface({
        index,
        patch: {
          locs: {
            ...iface.locs,
            [side]: {
              ...iface.locs[side],
              [segment]: newPair
            }
          }
        }
      })
    );
  };

  return (
    <article className="editor-card">
      <div className="section-title-row">
        <h4>Interface #{index + 1}</h4>
        <button onClick={() => dispatch(configActions.removeInterface({ index }))}>Remove</button>
      </div>
      <div className="field-grid compact">
        <label>
          Device 1
          <input
            value={iface.device1}
            onChange={(event) => dispatch(configActions.updateInterface({ index, patch: { device1: event.target.value } }))}
          />
        </label>
        <label>
          Device 2
          <input
            value={iface.device2}
            onChange={(event) => dispatch(configActions.updateInterface({ index, patch: { device2: event.target.value } }))}
          />
        </label>
        <label>
          D_interface (JSON map)
          <input
            value={iface.D_interface ? JSON.stringify(iface.D_interface) : ''}
            onChange={(event) => {
              try {
                const value = event.target.value.trim();
                const parsed = value ? (JSON.parse(value) as Record<string, number>) : undefined;
                dispatch(configActions.updateInterface({ index, patch: { D_interface: parsed } }));
              } catch {
                // Keep controlled input editable, invalid JSON is ignored until valid.
              }
            }}
          />
        </label>

        <label>
          Device1 start x
          <input
            type="number"
            value={iface.locs.device1.start[0]}
            onChange={(event) => updateLoc('device1', 'start', 0, event.target.value, iface.locs.device1.start[0])}
          />
        </label>
        <label>
          Device1 start y
          <input
            type="number"
            value={iface.locs.device1.start[1]}
            onChange={(event) => updateLoc('device1', 'start', 1, event.target.value, iface.locs.device1.start[1])}
          />
        </label>
        <label>
          Device1 stop x
          <input
            type="number"
            value={iface.locs.device1.stop[0]}
            onChange={(event) => updateLoc('device1', 'stop', 0, event.target.value, iface.locs.device1.stop[0])}
          />
        </label>
        <label>
          Device1 stop y
          <input
            type="number"
            value={iface.locs.device1.stop[1]}
            onChange={(event) => updateLoc('device1', 'stop', 1, event.target.value, iface.locs.device1.stop[1])}
          />
        </label>

        <label>
          Device2 start x
          <input
            type="number"
            value={iface.locs.device2.start[0]}
            onChange={(event) => updateLoc('device2', 'start', 0, event.target.value, iface.locs.device2.start[0])}
          />
        </label>
        <label>
          Device2 start y
          <input
            type="number"
            value={iface.locs.device2.start[1]}
            onChange={(event) => updateLoc('device2', 'start', 1, event.target.value, iface.locs.device2.start[1])}
          />
        </label>
        <label>
          Device2 stop x
          <input
            type="number"
            value={iface.locs.device2.stop[0]}
            onChange={(event) => updateLoc('device2', 'stop', 0, event.target.value, iface.locs.device2.stop[0])}
          />
        </label>
        <label>
          Device2 stop y
          <input
            type="number"
            value={iface.locs.device2.stop[1]}
            onChange={(event) => updateLoc('device2', 'stop', 1, event.target.value, iface.locs.device2.stop[1])}
          />
        </label>
      </div>
    </article>
  );
}
