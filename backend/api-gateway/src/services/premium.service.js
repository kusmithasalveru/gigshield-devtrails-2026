/**
 * GigShield Dynamic Pricing Engine
 *
 * Formula: Weekly Premium = Base × ZoneRiskScore × SeasonFactor × LoyaltyDiscount × TierMultiplier
 */

const BASE_PREMIUM = 25;

const TIER_CONFIG = {
  basic:    { multiplier: 1.0, coverageLimit: 200 },
  standard: { multiplier: 1.4, coverageLimit: 350 },
  pro:      { multiplier: 2.2, coverageLimit: 600 }
};

function getSeasonFactor(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 6 && month <= 9) return 1.30;   // Monsoon (June-September)
  if (month >= 10 && month <= 11) return 1.10;  // Post-monsoon (October-November)
  return 0.85;                                    // Winter & Spring
}

function getLoyaltyDiscount(weeksActive) {
  if (weeksActive >= 20) return 0.90;  // 10% discount
  if (weeksActive >= 6) return 0.95;   // 5% discount
  return 1.0;                           // No discount
}

function calculatePremium({ zoneRiskScore, tier, weeksActive, date }) {
  const tierConfig = TIER_CONFIG[tier];
  if (!tierConfig) throw new Error(`Invalid tier: ${tier}`);

  const seasonFactor = getSeasonFactor(date);
  const loyaltyDiscount = getLoyaltyDiscount(weeksActive || 0);

  const premium = Math.round(
    BASE_PREMIUM * (zoneRiskScore || 1.0) * seasonFactor * loyaltyDiscount * tierConfig.multiplier
  );

  return {
    premium,
    coverageLimit: tierConfig.coverageLimit,
    breakdown: {
      basePremium: BASE_PREMIUM,
      zoneRiskScore: zoneRiskScore || 1.0,
      seasonFactor,
      loyaltyDiscount,
      tierMultiplier: tierConfig.multiplier
    }
  };
}

/**
 * Calculate payout amount for a disruption event
 * Payout = (DailyEarnings / 10 hours) × DisruptedHours × SeverityFactor
 * Capped by tier coverage limit
 */
function calculatePayout({ dailyEarnings, disruptedHours, severityFactor, coverageLimit }) {
  const hourlyRate = dailyEarnings / 10;
  const rawPayout = hourlyRate * Math.min(disruptedHours, 4) * severityFactor;
  return Math.min(Math.round(rawPayout), coverageLimit);
}

module.exports = { calculatePremium, calculatePayout, TIER_CONFIG, getSeasonFactor, getLoyaltyDiscount };
