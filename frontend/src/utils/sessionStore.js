const FRAUD_KEY = 'gigshield_fraud_checks';
const PAYOUT_KEY = 'gigshield_payout_checks';

function readJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value.slice(-20)));
}

export function getFraudChecks() {
  return readJsonArray(FRAUD_KEY);
}

export function pushFraudCheck(entry) {
  const next = [...getFraudChecks(), { ...entry, ts: Date.now() }];
  writeJsonArray(FRAUD_KEY, next);
}

export function getPayoutChecks() {
  return readJsonArray(PAYOUT_KEY);
}

export function pushPayoutCheck(entry) {
  const next = [...getPayoutChecks(), { ...entry, ts: Date.now() }];
  writeJsonArray(PAYOUT_KEY, next);
}
