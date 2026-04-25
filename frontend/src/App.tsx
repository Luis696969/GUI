import { useMemo } from 'react';
import { DevicesPanel } from './components/devices/DevicesPanel';
import { InterfacesPanel } from './components/interfaces/InterfacesPanel';
import { JsonActions } from './components/json/JsonActions';
import { JsonPreview } from './components/json/JsonPreview';
import { ValidationSummary } from './components/json/ValidationSummary';
import { CollapsibleSection } from './components/layout/CollapsibleSection';
import { SectionNav } from './components/layout/SectionNav';
import { ReactionsPanel } from './components/reactions/ReactionsPanel';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { buildConfig } from './domain/config/buildConfig';
import { validateConfig } from './domain/config/schema';
import { selectDeviceSummaries, selectRootReactionProjection, useConfigReducer } from './hooks/useConfigReducer';

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

  const aggregate = useMemo(() => {
    const deviceSummaries = selectDeviceSummaries(state);
    const projectedRootReactions = selectRootReactionProjection(state);

    return {
      devices: state.devices.length,
      interfaces: state.interfaces.length,
      chemicals: deviceSummaries.reduce((sum, summary) => sum + summary.chemicals, 0),
      cells: deviceSummaries.reduce((sum, summary) => sum + summary.cells, 0),
      entries: deviceSummaries.reduce((sum, summary) => sum + summary.entries, 0),
      reactions: deviceSummaries.reduce((sum, summary) => sum + summary.reactions, 0),
      projectedReactions: projectedRootReactions.length
    };
  }, [state]);

  const blockingErrors = validationResult.success ? 0 : validationResult.errors.issues.length;
  const warningCount = validationResult.warnings.length;

  const validationTone = blockingErrors > 0 ? 'validation-badge validation-badge--error' : 'validation-badge validation-badge--ok';
  const validationLabel = blockingErrors > 0 ? `${blockingErrors} error${blockingErrors === 1 ? '' : 's'}` : 'Valid JSON';

  return (
    <main className="editor-shell">
      <header className="page-header editor-panel">
        <p className="eyebrow">Configuration Workspace</p>
        <h1>BioSim Config Editor</h1>
        <p className="page-subtitle">
          Author simulation JSON with guided panels, instant validation feedback, and backend-ready export actions.
        </p>
        <div className="summary-row" role="status" aria-live="polite">
          <span className="summary-pill">Devices: {aggregate.devices}</span>
          <span className="summary-pill">Chemicals: {aggregate.chemicals}</span>
          <span className="summary-pill">Cells: {aggregate.cells}</span>
          <span className="summary-pill">Entries: {aggregate.entries}</span>
          <span className="summary-pill">Reactions: {aggregate.reactions}</span>
          <span className="summary-pill">Projected root reactions: {aggregate.projectedReactions}</span>
          <span className="summary-pill">Interfaces: {aggregate.interfaces}</span>
          <span className="summary-pill">Warnings: {warningCount}</span>
          <span className="summary-pill">Errors: {blockingErrors}</span>
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
        <CollapsibleSection
          title={
            <div className="section-title-strip">
              <span className="collapsible-section__title">Devices</span>
              <div className="section-summary-row">
                <span className="summary-pill summary-pill--compact">{aggregate.devices} devices</span>
                <span className="summary-pill summary-pill--compact">{aggregate.chemicals} chemicals</span>
                <span className="summary-pill summary-pill--compact">{aggregate.cells} cells</span>
                <span className="summary-pill summary-pill--compact">{aggregate.entries} entries</span>
              </div>
            </div>
          }
          defaultOpen
        >
          <DevicesPanel devices={state.devices} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <div id="reactions" className="editor-anchor">
        <CollapsibleSection
          title={
            <div className="section-title-strip">
              <span className="collapsible-section__title">Reactions</span>
              <div className="section-summary-row">
                <span className="summary-pill summary-pill--compact">{aggregate.reactions} device reactions</span>
                <span className="summary-pill summary-pill--compact">{aggregate.projectedReactions} projected root</span>
              </div>
            </div>
          }
          defaultOpen
        >
          <ReactionsPanel devices={state.devices} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <div id="interfaces" className="editor-anchor">
        <CollapsibleSection
          title={
            <div className="section-title-strip">
              <span className="collapsible-section__title">Interfaces</span>
              <div className="section-summary-row">
                <span className="summary-pill summary-pill--compact">{aggregate.interfaces} interfaces</span>
              </div>
            </div>
          }
          defaultOpen
        >
          <InterfacesPanel interfaces={state.interfaces} dispatch={dispatch} />
        </CollapsibleSection>
      </div>
      <JsonActions state={state} dispatch={dispatch} serializedConfig={serializedConfig} />
      <div id="validation" className="editor-anchor">
        <CollapsibleSection
          title={
            <div className="section-title-strip">
              <span className="collapsible-section__title">Validation</span>
              <div className="section-summary-row">
                <span className="summary-pill summary-pill--compact">{blockingErrors} errors</span>
                <span className="summary-pill summary-pill--compact">{warningCount} warnings</span>
              </div>
            </div>
          }
          defaultOpen
        >
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
