import type { Dispatch } from 'react';
import type { EntryModel } from '../../domain/devices/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { parseOptionalNumber, parseRequiredNumber } from '../formUtils';

type EntryCardProps = {
  deviceId: string;
  index: number;
  entry: EntryModel;
  dispatch: Dispatch<ConfigAction>;
};

export function EntryCard({ deviceId, index, entry, dispatch }: EntryCardProps) {
  return (
    <article className="sub-card">
      <h5>Entry #{index + 1}</h5>
      <div className="field-grid compact">
        <label>
          X position
          <input
            type="number"
            value={entry.position[0]}
            onChange={(event) =>
              dispatch(
                configActions.updateEntry({
                  deviceId,
                  index,
                  patch: { position: [parseRequiredNumber(event.target.value, entry.position[0]), entry.position[1]] }
                })
              )
            }
          />
        </label>
        <label>
          Y position
          <input
            type="number"
            value={entry.position[1]}
            onChange={(event) =>
              dispatch(
                configActions.updateEntry({
                  deviceId,
                  index,
                  patch: { position: [entry.position[0], parseRequiredNumber(event.target.value, entry.position[1])] }
                })
              )
            }
          />
        </label>
        <label>
          Chemical
          <input
            value={entry.chemical}
            onChange={(event) => dispatch(configActions.updateEntry({ deviceId, index, patch: { chemical: event.target.value } }))}
          />
        </label>
        <label>
          Concentration
          <input
            type="number"
            step="0.01"
            value={entry.concentration ?? ''}
            onChange={(event) =>
              dispatch(configActions.updateEntry({ deviceId, index, patch: { concentration: parseOptionalNumber(event.target.value) } }))
            }
          />
        </label>
      </div>
      <button onClick={() => dispatch(configActions.removeEntry({ deviceId, index }))}>Remove entry</button>
    </article>
  );
}
