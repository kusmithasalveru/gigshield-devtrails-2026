import { mockUser, mockPolicy, mockTriggers, mockPayouts, mockPeerChoice, mockDisputes, mockTrustHistory } from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'https://gigshield-rl7l.onrender.com/api';
const MOCK_DELAY = 300;

function delay(ms = MOCK_DELAY) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getToken() {
  return localStorage.getItem('gigshield_token');
}

async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Auth
export async function sendOtp(phone) {
  try {
    return await apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  } catch {
    await delay();
    return { success: true, message: 'OTP simulated in fallback mode' };
  }
}

export async function verifyOtp(phone, otp) {
  try {
    const result = await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    if (result?.token) {
      localStorage.setItem('gigshield_token', result.token);
    }
    return result;
  } catch {
    await delay(500);
    localStorage.setItem('gigshield_token', 'mock-jwt-token-' + Date.now());
    return { success: true, token: 'mock-jwt-token', user: mockUser, simulated: true };
  }
}

export async function getZones() {
  try {
    return await apiCall('/zones', { method: 'GET' });
  } catch {
    return [];
  }
}

export async function registerWorker(payload) {
  return apiCall('/workers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Workers
export async function getWorkerProfile(workerId) {
  try {
    return await apiCall(`/workers/${workerId}`, { method: 'GET' });
  } catch {
    await delay();
    return mockUser;
  }
}

export async function updateWorkerProfile(workerId, updates) {
  try {
    return await apiCall(`/workers/${workerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  } catch {
    await delay();
    return { ...mockUser, ...updates };
  }
}

export async function getTrustScore(workerId) {
  try {
    const result = await apiCall(`/workers/${workerId}/trust-score`, { method: 'GET' });
    return { score: result.currentScore, history: result.history };
  } catch {
    await delay();
    return { score: mockUser.trustScore, history: mockTrustHistory };
  }
}

// Policies
export async function getActivePolicy(workerId) {
  await delay();
  return mockPolicy;
}

export async function getWorkerPolicies(workerId) {
  await delay();
  return [mockPolicy];
}

export async function purchasePolicy(workerId, tier) {
  await delay(1500);
  return { ...mockPolicy, tier, status: 'active' };
}

export async function getPremiumQuote(workerId, tier) {
  await delay();
  const tierMultipliers = { basic: 1.0, standard: 1.4, pro: 2.2 };
  const base = 25;
  const premium = Math.round(base * 0.68 * 1.10 * 0.95 * (tierMultipliers[tier] || 1.0));
  const limits = { basic: 200, standard: 350, pro: 600 };
  return { premium, coverageLimit: limits[tier], tier };
}

export async function getPeerChoice() {
  try {
    return await apiCall('/peer-choice', { method: 'GET' });
  } catch {
    await delay();
    return mockPeerChoice;
  }
}

// Events / Triggers
export async function getActiveEvents() {
  try {
    return await apiCall('/events?limit=20', { method: 'GET' });
  } catch {
    await delay();
    return mockTriggers;
  }
}

export async function getEventById(eventId) {
  try {
    return await apiCall(`/events/${eventId}`, { method: 'GET' });
  } catch {
    await delay();
    return mockTriggers.find(e => e.id === eventId) || null;
  }
}

// Payouts
export async function getWorkerPayouts(workerId) {
  try {
    return await apiCall('/payouts', { method: 'GET' });
  } catch {
    await delay();
    return mockPayouts;
  }
}

export async function getPayoutById(payoutId) {
  try {
    return await apiCall(`/payouts/${payoutId}`, { method: 'GET' });
  } catch {
    await delay();
    return mockPayouts.find(p => p.id === payoutId) || null;
  }
}

// Disputes
export async function getDisputes(workerId) {
  try {
    return await apiCall('/disputes', { method: 'GET' });
  } catch {
    await delay();
    return mockDisputes;
  }
}

export async function submitDispute(payoutId, reason) {
  try {
    return await apiCall(`/payouts/${payoutId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  } catch {
    await delay(1000);
    return { id: 'd-new', payoutId, status: 'under_review', submittedAt: new Date().toISOString(), reason };
  }
}

export { apiCall };
