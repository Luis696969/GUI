import { DEFAULTS } from '../config/constants.js';

export function expandCollapsibleCard(card) {
  if (!card) return;
  const content = card.querySelector('.collapsible-content');
  const button = card.querySelector('.collapsible-toggle');
  if (!content || !button) return;
  content.classList.remove('is-collapsed');
  button.classList.remove('collapsed');
  button.innerHTML = '▾';
}

export function revealNewElement(element) {
  if (!element) return;
  const parentDevice = element.closest('.device-entry');
  if (parentDevice) expandCollapsibleCard(parentDevice);
  expandCollapsibleCard(element);
  element.classList.add('just-added');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => element.classList.remove('just-added'), DEFAULTS.cardFlashMs);
}
