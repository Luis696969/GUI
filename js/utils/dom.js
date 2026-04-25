export function byId(id) {
  return document.getElementById(id);
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function getDelegatedTarget(event, selector, boundary = document) {
  if (!(event.target instanceof Element)) return null;

  const matched = event.target.closest(selector);
  if (!matched) return null;

  return boundary.contains(matched) ? matched : null;
}
