export function toggleCollapse(buttonEl) {
  const card = buttonEl?.closest('[data-collapsible-card]');
  if (!card) return;

  const content = card.querySelector('.collapsible-content');
  if (!content) return;

  const collapsed = content.classList.toggle('is-collapsed');
  buttonEl.classList.toggle('collapsed', collapsed);
  buttonEl.innerHTML = collapsed ? '▸' : '▾';
}

export function expandCard(card) {
  if (!card) return;

  const content = card.querySelector('.collapsible-content');
  const button = card.querySelector('.collapsible-toggle');

  if (!content || !button) return;

  content.classList.remove('is-collapsed');
  button.classList.remove('collapsed');
  button.innerHTML = '▾';
}
