import type { Dispatch } from 'react';
import { DEFAULT_INTERFACE } from '../../domain/interfaces/defaults';
import type { InterfaceModel } from '../../domain/interfaces/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { InterfaceCard } from './InterfaceCard';

type InterfacesPanelProps = {
  interfaces: InterfaceModel[];
  dispatch: Dispatch<ConfigAction>;
};

export function InterfacesPanel({ interfaces, dispatch }: InterfacesPanelProps) {
  return (
    <section className="editor-panel">
      <div className="section-title-row">
        <h2>Interfaces ({interfaces.length})</h2>
        <button onClick={() => dispatch(configActions.addInterface({ ...DEFAULT_INTERFACE }))}>Add interface</button>
      </div>
      <p className="section-lead">Describe coupling between device boundaries and diffusion mappings across shared segments.</p>

      <div className="card-grid">
        {interfaces.map((iface, index) => (
          <InterfaceCard key={`interface-${index}`} iface={iface} index={index} dispatch={dispatch} />
        ))}
      </div>
    </section>
  );
}
