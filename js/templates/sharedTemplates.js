export function makeCardHeader(title, subtitle = '', extraClass = '') {
  return `
    <div class="card-header-row">
      <div class="card-title-wrap">
        <button
          type="button"
          class="collapsible-toggle"
          data-action="toggle-collapse"
          aria-label="Collapse or expand"
        >▾</button>
        <div class="min-w-0">
          <h3 class="card-title ${extraClass}">${title}</h3>
          <div class="card-summary">${subtitle}</div>
        </div>
      </div>
    </div>
  `;
}
