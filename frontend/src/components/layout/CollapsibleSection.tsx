import { type ReactNode, useId } from 'react';

type CollapsibleSectionProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const sectionId = useId();
  const summaryId = `${sectionId}-summary`;
  const contentId = `${sectionId}-content`;

  return (
    <details className="collapsible-section" open={defaultOpen}>
      <summary id={summaryId} className="collapsible-section__summary" aria-controls={contentId}>
        {typeof title === 'string' ? <span className="collapsible-section__title">{title}</span> : title}
      </summary>
      <div id={contentId} className="collapsible-section__content" role="region" aria-labelledby={summaryId}>
        {children}
      </div>
    </details>
  );
}
