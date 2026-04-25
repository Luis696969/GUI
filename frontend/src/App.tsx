import { DevicesPanel } from './components/devices/DevicesPanel';
import { InterfacesPanel } from './components/interfaces/InterfacesPanel';
import { JsonActions } from './components/json/JsonActions';
import { JsonPreview } from './components/json/JsonPreview';
import { ReactionsPanel } from './components/reactions/ReactionsPanel';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { useConfigReducer } from './hooks/useConfigReducer';

function App() {
  const { state, dispatch } = useConfigReducer();

  return (
    <main className="editor-shell">
      <SimulationPanel simulation={state.simulation} dispatch={dispatch} />
      <DevicesPanel devices={state.devices} dispatch={dispatch} />
      <ReactionsPanel devices={state.devices} dispatch={dispatch} />
      <InterfacesPanel interfaces={state.interfaces} dispatch={dispatch} />
      <JsonActions state={state} dispatch={dispatch} />
      <JsonPreview state={state} />
    </main>
  );
}

export default App;
