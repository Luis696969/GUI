import { API_URL } from '../config/constants.js';

export async function postSimulation(config) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || response.statusText || 'Unknown backend error.');
  }

  return payload;
}
