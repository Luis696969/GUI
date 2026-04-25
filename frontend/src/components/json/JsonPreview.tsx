import type { AppState } from '../../hooks/useConfigReducer';

type JsonPreviewProps = {
  state: AppState;
};

export function JsonPreview({ state }: JsonPreviewProps) {
  return (
    <section className="editor-panel">
      <h2>JSON Preview</h2>
      <pre className="json-preview">{JSON.stringify(state, null, 2)}</pre>
    </section>
  );
}
