import type { Dispatch } from 'react';
import type { CellModel } from '../../domain/devices/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { parseOptionalNumber } from '../formUtils';

type CellCardProps = {
  deviceId: string;
  cell: CellModel;
  dispatch: Dispatch<ConfigAction>;
};

export function CellCard({ deviceId, cell, dispatch }: CellCardProps) {
  return (
    <article className="sub-card">
      <h5>Cell: {cell.name || 'Unnamed cell'}</h5>
      <div className="field-grid compact">
        <label>
          Name
          <input
            value={cell.name}
            onChange={(event) =>
              dispatch(configActions.updateCell({ deviceId, cellName: cell.name, patch: { name: event.target.value } }))
            }
          />
        </label>
        <label>
          Concentration
          <input
            type="number"
            step="0.01"
            value={cell.concentration ?? ''}
            onChange={(event) =>
              dispatch(
                configActions.updateCell({
                  deviceId,
                  cellName: cell.name,
                  patch: { concentration: parseOptionalNumber(event.target.value) }
                })
              )
            }
          />
        </label>
        <label>
          Diffusion coef
          <input
            type="number"
            step="0.01"
            value={cell.diffusion_coef ?? ''}
            onChange={(event) =>
              dispatch(
                configActions.updateCell({
                  deviceId,
                  cellName: cell.name,
                  patch: { diffusion_coef: parseOptionalNumber(event.target.value) }
                })
              )
            }
          />
        </label>
        <label>
          Shape
          <input
            value={cell.shape ?? ''}
            onChange={(event) =>
              dispatch(configActions.updateCell({ deviceId, cellName: cell.name, patch: { shape: event.target.value || undefined } }))
            }
          />
        </label>
      </div>
      <button onClick={() => dispatch(configActions.removeCell({ deviceId, cellName: cell.name }))}>Remove cell</button>
    </article>
  );
}
