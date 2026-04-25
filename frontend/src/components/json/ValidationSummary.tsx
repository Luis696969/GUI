import type { ValidateConfigResult } from '../../domain/config/schema';

type ValidationSummaryProps = {
  validationResult: ValidateConfigResult;
};

function formatIssuePath(path: Array<string | number>): string {
  if (path.length === 0) {
    return 'root';
  }

  return path.map((segment) => String(segment)).join('.');
}

export function ValidationSummary({ validationResult }: ValidationSummaryProps) {
  const blockingErrors = validationResult.success ? [] : validationResult.errors.issues;
  const warnings = validationResult.warnings;

  if (blockingErrors.length === 0 && warnings.length === 0) {
    return (
      <section className="editor-panel">
        <h2>Validation Summary</h2>
        <p className="validation-ok">No blocking errors or warnings.</p>
      </section>
    );
  }

  return (
    <section className="editor-panel">
      <h2>Validation Summary</h2>
      {blockingErrors.length > 0 ? (
        <div className="validation-section validation-section--error">
          <h3>Blocking errors ({blockingErrors.length})</h3>
          <ul>
            {blockingErrors.map((issue, index) => (
              <li key={`error-${index}`}>
                <strong>{formatIssuePath(issue.path)}:</strong> {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="validation-section validation-section--warning">
          <h3>Warnings ({warnings.length})</h3>
          <ul>
            {warnings.map((issue, index) => (
              <li key={`warning-${index}`}>
                <strong>{formatIssuePath(issue.path)}:</strong> {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
