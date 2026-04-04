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

export default function usePremiumCalc({ zone, tier = 'standard', weeksActive = 0 }) {
  const [result, setResult] = useState({ premium: 0, coverageLimit: 0, loading: true, error: null });

  useEffect(() => {
    // Simulate API call — in production, fetch from /api/policies/premium-quote
    const timer = setTimeout(() => {
      try {
        const zoneRiskScore = 0.68; // Mock — would come from API based on zone
        const seasonFactor = getSeasonFactor();
        const loyaltyDiscount = getLoyaltyDiscount(weeksActive);
        const tierMultiplier = TIER_MULTIPLIERS[tier] || 1.0;

        const premium = Math.round(BASE_PREMIUM * zoneRiskScore * seasonFactor * loyaltyDiscount * tierMultiplier);
        const coverageLimit = COVERAGE_LIMITS[tier] || 200;

        setResult({ premium, coverageLimit, loading: false, error: null });
      } catch (err) {
        setResult(prev => ({ ...prev, loading: false, error: err.message }));
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [zone, tier, weeksActive]);

  return result;
}
