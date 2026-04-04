import { mockUser, mockPolicy, mockTriggers, mockPayouts, mockPeerChoice, mockDisputes, mockTrustHistory } from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MOCK_DELAY = 300;

function delay(ms = MOCK_DELAY) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getToken() {
  return localStorage.getItem('gigshield_token');
}

async function apiCall(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      ...options.headers
    }
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Auth
export async function sendOtp(phone) {
  await delay();
  return { success: true, message: 'OTP sent' };
}

export async function verifyOtp(phone, otp) {
  await delay(500);
  localStorage.setItem('gigshield_token', 'mock-jwt-token-' + Date.now());
  return { success: true, token: 'mock-jwt-token', user: mockUser };
}

// Workers
export async function getWorkerProfile(workerId) {
  await delay();
  return mockUser;
}

export async function updateWorkerProfile(workerId, updates) {
  await delay();
  return { ...mockUser, ...updates };
}

export async function getTrustScore(workerId) {
  await delay();
  return { score: mockUser.trustScore, history: mockTrustHistory };
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
  await delay();
  return mockPeerChoice;
}

// Events / Triggers
export async function getActiveEvents() {
  await delay();
  return mockTriggers;
}

export async function getEventById(eventId) {
  await delay();
  return mockTriggers.find(e => e.id === eventId) || null;
}

// Payouts
export async function getWorkerPayouts(workerId) {
  await delay();
  return mockPayouts;
}

export async function getPayoutById(payoutId) {
  await delay();
  return mockPayouts.find(p => p.id === payoutId) || null;
}

// Disputes
export async function getDisputes(workerId) {
  await delay();
  return mockDisputes;
}

export async function submitDispute(payoutId, reason) {
  await delay(1000);
  return { id: 'd-new', payoutId, status: 'under_review', submittedAt: new Date().toISOString(), reason };
}

export { apiCall };
