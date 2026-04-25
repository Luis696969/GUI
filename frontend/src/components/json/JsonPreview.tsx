type JsonPreviewProps = {
  serializedConfig: string;
};

export function JsonPreview({ serializedConfig }: JsonPreviewProps) {
  return (
    <section className="editor-panel">
      <h2>JSON Preview</h2>
      <pre className="json-preview">{serializedConfig}</pre>
    </section>
  );
}
