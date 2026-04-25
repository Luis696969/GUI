import { useMemo } from 'react';
import { DevicesPanel } from './components/devices/DevicesPanel';
import { InterfacesPanel } from './components/interfaces/InterfacesPanel';
import { JsonActions } from './components/json/JsonActions';
import { JsonPreview } from './components/json/JsonPreview';
import { ReactionsPanel } from './components/reactions/ReactionsPanel';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { buildConfig } from './domain/config/buildConfig';
import { validateConfig } from './domain/config/schema';
import { useConfigReducer } from './hooks/useConfigReducer';

function App() {
  const { state, dispatch } = useConfigReducer();

  const serializedConfig = useMemo(() => {
    const rootConfig = buildConfig(state);
    const validationResult = validateConfig(rootConfig);

    if (!validationResult.success) {
      return JSON.stringify(rootConfig, null, 2);
    }

    return JSON.stringify(validationResult.data, null, 2);
  }, [state]);

  return (
    <main className="editor-shell">
      <SimulationPanel simulation={state.simulation} dispatch={dispatch} />
      <DevicesPanel devices={state.devices} dispatch={dispatch} />
      <ReactionsPanel devices={state.devices} dispatch={dispatch} />
      <InterfacesPanel interfaces={state.interfaces} dispatch={dispatch} />
      <JsonActions state={state} dispatch={dispatch} serializedConfig={serializedConfig} />
      <JsonPreview serializedConfig={serializedConfig} />
    </main>
  );
}

export default App;
