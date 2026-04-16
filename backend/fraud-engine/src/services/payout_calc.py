"""
Payout calculation helpers.

This is intentionally kept small and pure so it can be reused by multiple
Phase-3 endpoints (and remain demo-friendly).
"""

from __future__ import annotations


def severity_factor(severity: str | None) -> float:
    """Map event severity to payout severity multiplier."""
    if not severity:
        return 1.0
    return 1.0 if str(severity).upper() == "HIGH" else 0.6


def calculate_payout_amount(
    *,
    avg_weekly_earnings: float,
    disrupted_hours: float,
    severity: str | None,
    coverage_limit: float,
) -> float:
    """
    Income-based payout calculation:

    Daily earnings = avg_weekly_earnings / 6
    Hourly rate = DailyEarnings / 10
    Raw payout = HourlyRate * min(disrupted_hours, 4) * severity_factor
    Final payout = min(raw_payout, coverage_limit)
    """
    daily_earnings = float(avg_weekly_earnings) / 6.0
    disrupted_hours = float(disrupted_hours or 0.0)
    factor = severity_factor(severity)

    hourly_rate = daily_earnings / 10.0
    raw_payout = hourly_rate * min(disrupted_hours, 4.0) * factor
    payout = min(round(raw_payout, 2), float(coverage_limit))
    # Keep amount positive for sanity in UI (no endpoint shape changes).
    return max(payout, 0.0)

