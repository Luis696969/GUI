import { qs } from './dom.js';

export function expandCollapsibleCard(card) {
  if (!card) return;

  const content = qs('.collapsible-content', card);
  const button = qs('.collapsible-toggle', card);

  if (!content || !button) return;

  content.classList.remove('is-collapsed');
  button.classList.remove('collapsed');
  button.innerHTML = '▾';
}

export function toggleCollapse(buttonEl) {
  const card = buttonEl.closest('[data-collapsible-card]');
  if (!card) return;

  const content = qs('.collapsible-content', card);
  if (!content) return;

  const collapsed = content.classList.toggle('is-collapsed');
  buttonEl.classList.toggle('collapsed', collapsed);
  buttonEl.innerHTML = collapsed ? '▸' : '▾';
}

export function revealNewElement(element, { emphasizeMs = 1600 } = {}) {
  if (!element) return;

  const parentDevice = element.closest('.device-entry');
  if (parentDevice) expandCollapsibleCard(parentDevice);

  expandCollapsibleCard(element);

  element.classList.add('just-added');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => element.classList.remove('just-added'), emphasizeMs);
}
