export function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} must be one of: ${allowed.join(', ')}.`);
}

export function assertUniqueByName(items, label, deviceName) {
  const seen = new Set();
  items.forEach((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) throw new Error(`${label} "${item.name}" is duplicated in ${deviceName}.`);
    seen.add(key);
  });
}
