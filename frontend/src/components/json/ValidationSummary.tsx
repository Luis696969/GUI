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
      <div className="validation-section validation-section--error">
        <div className="validation-section__header">
          <h3>Errors</h3>
          <span className="validation-count-chip validation-count-chip--error">{blockingErrors.length}</span>
        </div>
        {blockingErrors.length > 0 ? (
          <ul className="validation-list validation-list--error">
            {blockingErrors.map((issue, index) => (
              <li key={`error-${index}`} className="validation-item">
                <p className="validation-item__message">{issue.message}</p>
                <p className="validation-item__path">Path: {formatIssuePath(issue.path)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="validation-section__empty">No errors.</p>
        )}
      </div>

      <div className="validation-section validation-section--warning">
        <div className="validation-section__header">
          <h3>Warnings</h3>
          <span className="validation-count-chip validation-count-chip--warning">{warnings.length}</span>
        </div>
        {warnings.length > 0 ? (
          <ul className="validation-list validation-list--warning">
            {warnings.map((issue, index) => (
              <li key={`warning-${index}`} className="validation-item">
                <p className="validation-item__message">{issue.message}</p>
                <p className="validation-item__path">Path: {formatIssuePath(issue.path)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="validation-section__empty">No warnings.</p>
        )}
      </div>
    </section>
  );
}
