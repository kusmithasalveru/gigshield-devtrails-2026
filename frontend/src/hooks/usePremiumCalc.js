import { useState, useEffect } from 'react';

const BASE_PREMIUM = 25;

const TIER_MULTIPLIERS = { basic: 1.0, standard: 1.4, pro: 2.2 };
const COVERAGE_LIMITS = { basic: 200, standard: 350, pro: 600 };

function getSeasonFactor() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 1.30;   // Monsoon
  if (month >= 10 && month <= 11) return 1.10;  // Post-monsoon
  return 0.85;                                   // Winter & Spring
}

function getLoyaltyDiscount(weeksActive) {
  if (weeksActive >= 20) return 0.90;
  if (weeksActive >= 6) return 0.95;
  return 1.0;
}

export default function usePremiumCalc({ workerId, zone, tier = 'standard', weeksActive = 0 }) {
  const [result, setResult] = useState({ premium: 0, coverageLimit: 0, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    async function loadQuote() {
      setResult((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const zoneRiskScore = 0.68;
        const seasonFactor = getSeasonFactor();
        const loyaltyDiscount = getLoyaltyDiscount(weeksActive);
        const tierMultiplier = TIER_MULTIPLIERS[tier] || 1.0;
        const premium = Math.round(BASE_PREMIUM * zoneRiskScore * seasonFactor * loyaltyDiscount * tierMultiplier);
        const coverageLimit = COVERAGE_LIMITS[tier] || 200;
        if (!cancelled) setResult({ premium, coverageLimit, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setResult((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    }

    loadQuote();
    return () => {
      cancelled = true;
    };
  }, [workerId, zone, tier, weeksActive]);

  return result;
}
