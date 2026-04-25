export function normalizeText(value) {
  return (value || '').trim();
}

export function parseCsv(value) {
  return normalizeText(value).split(',').map((item) => item.trim()).filter(Boolean);
}

export function parseNumberCsv(value, label) {
  const raw = parseCsv(value);
  const values = raw.map((item) => Number(item));
  values.forEach((num, index) => {
    if (!Number.isFinite(num)) {
      throw new Error(`${label}: value "${raw[index]}" is not a valid number.`);
    }
  });
  return values;
}

export function readNumber(value, label, { integer = false, min = null, max = null, strictlyPositive = false } = {}) {
  const num = integer ? parseInt(value, 10) : parseFloat(value);
  if (!Number.isFinite(num)) throw new Error(`${label} is not valid.`);
  if (integer && !Number.isInteger(num)) throw new Error(`${label} must be an integer.`);
  if (min !== null && num < min) throw new Error(`${label} must be >= ${min}.`);
  if (max !== null && num > max) throw new Error(`${label} must be <= ${max}.`);
  if (strictlyPositive && num <= 0) throw new Error(`${label} must be > 0.`);
  return num;
}
