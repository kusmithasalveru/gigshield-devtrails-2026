export function getTrustPenalty({ decision, anomalyScore }) {
  const score = Number(anomalyScore ?? 0);
  const normalizedDecision = String(decision || '').toLowerCase();

  if (normalizedDecision === 'hold') return 20;
  if (normalizedDecision === 'human_review') return 12;
  if (score >= 0.75) return 15;
  if (score >= 0.6) return 10;
  if (score >= 0.45) return 6;
  return 0;
}

export function applyTrustPenalty(currentTrustScore, penalty) {
  const current = Number.isFinite(Number(currentTrustScore)) ? Number(currentTrustScore) : 100;
  const delta = Number.isFinite(Number(penalty)) ? Number(penalty) : 0;
  return Math.max(0, current - delta);
}
