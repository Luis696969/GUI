export function toggleCollapse(buttonEl) {
  const card = buttonEl.closest('[data-collapsible-card]');
  if (!card) return;
  const content = card.querySelector('.collapsible-content');
  if (!content) return;
  const collapsed = content.classList.toggle('is-collapsed');
  buttonEl.classList.toggle('collapsed', collapsed);
  buttonEl.innerHTML = collapsed ? '▸' : '▾';
}
