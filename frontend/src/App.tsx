import { StatePlayground } from './components/StatePlayground';
import { useConfigReducer } from './hooks/useConfigReducer';

function App() {
  const { state, dispatch, selectors } = useConfigReducer();

  return (
    <main className="app-shell">
      <StatePlayground
        state={state}
        dispatch={dispatch}
        sharedChemicals={selectors.sharedChemicalsByInterface}
        deviceSummaries={selectors.deviceSummaries}
        rootReactions={selectors.rootReactionProjection}
      />
    </main>
  );
}

export default App;
