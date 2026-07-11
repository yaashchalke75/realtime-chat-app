import { API_URL } from '../config';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Response had no JSON body; leave data as null.
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function loginUser(username) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function fetchMessages() {
  return request('/api/messages?limit=200');
}

export function postMessage(username, text) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ username, text }),
  });
}
