import type { Dispatch } from 'react';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import type { ChemicalModel } from '../../domain/devices/types';
import { parseOptionalNumber } from '../formUtils';

type ChemicalCardProps = {
  deviceId: string;
  chemical: ChemicalModel;
  dispatch: Dispatch<ConfigAction>;
};

export function ChemicalCard({ deviceId, chemical, dispatch }: ChemicalCardProps) {
  return (
    <article className="sub-card">
      <h5>Chemical: {chemical.name || 'Unnamed chemical'}</h5>
      <div className="field-grid compact">
        <label>
          Name
          <input
            value={chemical.name}
            onChange={(event) =>
              dispatch(
                configActions.updateChemical({
                  deviceId,
                  chemicalName: chemical.name,
                  patch: { name: event.target.value }
                })
              )
            }
          />
        </label>
        <label>
          Max concentration
          <input
            type="number"
            step="0.01"
            value={chemical.max_concentration ?? ''}
            onChange={(event) =>
              dispatch(
                configActions.updateChemical({
                  deviceId,
                  chemicalName: chemical.name,
                  patch: { max_concentration: parseOptionalNumber(event.target.value) }
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
            value={chemical.diffusion_coef ?? ''}
            onChange={(event) =>
              dispatch(
                configActions.updateChemical({
                  deviceId,
                  chemicalName: chemical.name,
                  patch: { diffusion_coef: parseOptionalNumber(event.target.value) }
                })
              )
            }
          />
        </label>
        <label>
          Initial profile
          <input
            value={chemical.initial_profile ?? ''}
            onChange={(event) =>
              dispatch(
                configActions.updateChemical({
                  deviceId,
                  chemicalName: chemical.name,
                  patch: { initial_profile: event.target.value || undefined }
                })
              )
            }
          />
        </label>
      </div>
      <button onClick={() => dispatch(configActions.removeChemical({ deviceId, chemicalName: chemical.name }))}>Remove chemical</button>
    </article>
  );
}
