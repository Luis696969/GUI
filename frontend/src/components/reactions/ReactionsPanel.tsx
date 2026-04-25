import type { Dispatch } from 'react';
import type { DeviceModel } from '../../domain/devices/types';
import { configActions, type ConfigAction } from '../../hooks/useConfigReducer';
import { parseNumberList, parseStringList } from '../formUtils';

type ReactionsPanelProps = {
  devices: DeviceModel[];
  dispatch: Dispatch<ConfigAction>;
};

export function ReactionsPanel({ devices, dispatch }: ReactionsPanelProps) {
  return (
    <section className="editor-panel">
      <h2>Reactions</h2>
      <p className="section-lead">Edit per-device reaction rules with substrates, products, biological actors, and coefficients.</p>
      <div className="card-grid">
        {devices.map((device) => (
          <article key={device.id} className="editor-card">
            <h3>{device.id}</h3>
            {device.reactions.length === 0 ? <p className="muted">No reactions yet.</p> : null}
            {device.reactions.map((reaction, index) => (
              <div key={`${device.id}-reaction-${index}`} className="sub-card">
                <div className="section-title-row">
                  <h5>Reaction #{index + 1}</h5>
                  <button onClick={() => dispatch(configActions.removeReaction({ deviceId: device.id, index }))}>Remove</button>
                </div>
                <div className="field-grid compact">
                  <label>
                    Type
                    <input
                      value={reaction.type}
                      onChange={(event) =>
                        dispatch(
                          configActions.updateReaction({
                            deviceId: device.id,
                            index,
                            patch: { type: event.target.value }
                          })
                        )
                      }
                    />
                  </label>
                  <label>
                    Substrates (csv)
                    <input
                      value={reaction.substrates.join(', ')}
                      onChange={(event) =>
                        dispatch(
                          configActions.updateReaction({
                            deviceId: device.id,
                            index,
                            patch: { substrates: parseStringList(event.target.value) }
                          })
                        )
                      }
                    />
                  </label>
                  <label>
                    Products (csv)
                    <input
                      value={reaction.products.join(', ')}
                      onChange={(event) =>
                        dispatch(
                          configActions.updateReaction({
                            deviceId: device.id,
                            index,
                            patch: { products: parseStringList(event.target.value) }
                          })
                        )
                      }
                    />
                  </label>
                  <label>
                    Biologicals (csv)
                    <input
                      value={reaction.biologicals.join(', ')}
                      onChange={(event) =>
                        dispatch(
                          configActions.updateReaction({
                            deviceId: device.id,
                            index,
                            patch: { biologicals: parseStringList(event.target.value) }
                          })
                        )
                      }
                    />
                  </label>
                  <label>
                    Coefficients (csv numbers)
                    <input
                      value={reaction.coefficients.join(', ')}
                      onChange={(event) =>
                        dispatch(
                          configActions.updateReaction({
                            deviceId: device.id,
                            index,
                            patch: { coefficients: parseNumberList(event.target.value) }
                          })
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
