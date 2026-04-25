import { useMemo } from 'react';
import { DevicesPanel } from './components/devices/DevicesPanel';
import { InterfacesPanel } from './components/interfaces/InterfacesPanel';
import { JsonActions } from './components/json/JsonActions';
import { JsonPreview } from './components/json/JsonPreview';
import { ValidationSummary } from './components/json/ValidationSummary';
import { ReactionsPanel } from './components/reactions/ReactionsPanel';
import { CollapsibleSection } from './components/layout/CollapsibleSection';
import { SectionNav } from './components/layout/SectionNav';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { buildConfig } from './domain/config/buildConfig';
import { validateConfig } from './domain/config/schema';
import { useConfigReducer } from './hooks/useConfigReducer';

function App() {
  const { state, dispatch } = useConfigReducer();

  const { serializedConfig, validationResult } = useMemo(() => {
    const rootConfig = buildConfig(state);
    const validationResult = validateConfig(rootConfig);

    const serializedConfig = validationResult.success
      ? JSON.stringify(validationResult.data, null, 2)
      : JSON.stringify(rootConfig, null, 2);

    return { serializedConfig, validationResult };
  }, [state]);

  const blockingErrors = validationResult.success ? 0 : validationResult.errors.issues.length;
  const warningCount = validationResult.warnings.length;
  const reactionCount = state.devices.reduce((count, device) => count + device.reactions.length, 0);

  const validationTone = blockingErrors > 0 ? 'validation-badge validation-badge--error' : 'validation-badge validation-badge--ok';
  const validationLabel = blockingErrors > 0 ? `${blockingErrors} blocking error${blockingErrors === 1 ? '' : 's'}` : 'Valid JSON';

  return (
    <main className="editor-shell">
      <header className="page-header editor-panel">
        <p className="eyebrow">Configuration Workspace</p>
        <h1>BioSim Config Editor</h1>
        <p className="page-subtitle">
          Author simulation JSON with guided panels, instant validation feedback, and backend-ready export actions.
        </p>
        <div className="summary-row" role="status" aria-live="polite">
          <span className="summary-pill">Devices: {state.devices.length}</span>
          <span className="summary-pill">Interfaces: {state.interfaces.length}</span>
          <span className="summary-pill">Reactions: {reactionCount}</span>
          <span className="summary-pill">Warnings: {warningCount}</span>
          <span className={validationTone}>{validationLabel}</span>
        </div>
      </header>

      <SectionNav />

      <div id="simulation" className="editor-anchor">
        <CollapsibleSection title="Simulation" defaultOpen>
          <SimulationPanel simulation={state.simulation} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <div id="devices" className="editor-anchor">
        <CollapsibleSection title="Devices" defaultOpen>
          <DevicesPanel devices={state.devices} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <div id="reactions" className="editor-anchor">
        <CollapsibleSection title="Reactions" defaultOpen>
          <ReactionsPanel devices={state.devices} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <div id="interfaces" className="editor-anchor">
        <CollapsibleSection title="Interfaces" defaultOpen>
          <InterfacesPanel interfaces={state.interfaces} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <JsonActions state={state} dispatch={dispatch} serializedConfig={serializedConfig} />
      <div id="validation" className="editor-anchor">
        <CollapsibleSection title="Validation" defaultOpen>
          <ValidationSummary validationResult={validationResult} />
        </CollapsibleSection>
      </div>
      <div id="json-preview" className="editor-anchor">
        <CollapsibleSection title="JSON Preview" defaultOpen>
          <JsonPreview serializedConfig={serializedConfig} />
        </CollapsibleSection>
      </div>
    </main>
  );
}

export default App;
