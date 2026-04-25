export function compactValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => compactValue(item))
      .filter((item) => item !== undefined && item !== null);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, entry]) => [key, compactValue(entry)])
        .filter(([, entry]) => entry !== undefined && entry !== null)
    );
  }

  return value;
}

export function compactObject(objectValue) {
  return compactValue(objectValue);
}
