const ML_ENGINE_BASE_URL = import.meta.env.VITE_FRAUD_ENGINE_URL || 'https://gigshield-rl7l.onrender.com';

function getToken() {
  return localStorage.getItem('gigshield_token') || '';
}

async function jsonFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };
  
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const text = await res.text();
  const maybeJson = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;
  if (!res.ok) {
    const message = maybeJson?.detail || maybeJson?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return maybeJson ?? {};
}

export async function getHealth() {
  return jsonFetch(`${ML_ENGINE_BASE_URL}/health`, { method: 'GET' });
}

// Phase-3 integration: exact endpoints expected by the UI spec
export async function scoreFraud(payload) {
  return jsonFetch(`${ML_ENGINE_BASE_URL}/m1/fraud/score`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function processPayout(payload) {
  return jsonFetch(`${ML_ENGINE_BASE_URL}/m1/process-payout`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function simulateEvent(payload) {
  return jsonFetch(`${ML_ENGINE_BASE_URL}/simulate-event`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDashboardWorker(workerId) {
  const q = workerId ? `?worker_id=${encodeURIComponent(workerId)}` : '';
  return jsonFetch(`${ML_ENGINE_BASE_URL}/dashboard/worker${q}`, { method: 'GET' });
}

export async function getDashboardAdmin() {
  return jsonFetch(`${ML_ENGINE_BASE_URL}/dashboard/admin`, { method: 'GET' });
}

