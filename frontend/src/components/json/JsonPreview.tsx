type JsonPreviewProps = {
  serializedConfig: string;
};

export function JsonPreview({ serializedConfig }: JsonPreviewProps) {
  return (
    <section className="editor-panel">
      <h2>JSON Preview</h2>
      <p className="section-lead">Live serialized output mirrors the schema-backed config currently assembled in the editor.</p>
      <pre className="json-preview">{serializedConfig}</pre>
    </section>
  );
}
