"""
Razorpay Service — UPI payout initiation via Razorpay Fund Accounts API (sandbox mode).
"""
import requests
from ..config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

RAZORPAY_BASE = "https://api.razorpay.com/v1"


def initiate_payout(upi_id, amount, worker_name):
    """
    Initiate a UPI payout via Razorpay.
    In sandbox mode, uses test credentials.

    Steps:
    1. Create contact (if not exists)
    2. Create fund account (UPI)
    3. Create payout

    Returns: payout reference ID or None on failure.
    """
    if not RAZORPAY_KEY_ID or RAZORPAY_KEY_ID.startswith("rzp_test_xxx"):
        # Simulate payout in development
        # Keep output ASCII-safe on Windows consoles (avoid ₹ encoding errors).
        print(f"[RAZORPAY] Simulated payout: Rs {amount} to {upi_id} ({worker_name})")
        return f"sim_pay_{int(amount)}_{upi_id.split('@')[0]}"

    auth = (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)

    try:
        # Step 1: Create contact
        contact_resp = requests.post(f"{RAZORPAY_BASE}/contacts", auth=auth, json={
            "name": worker_name,
            "type": "worker",
            "reference_id": f"gigshield_{upi_id}"
        })
        contact_resp.raise_for_status()
        contact_id = contact_resp.json()["id"]

        # Step 2: Create fund account (UPI)
        fund_resp = requests.post(f"{RAZORPAY_BASE}/fund_accounts", auth=auth, json={
            "contact_id": contact_id,
            "account_type": "vpa",
            "vpa": {"address": upi_id}
        })
        fund_resp.raise_for_status()
        fund_account_id = fund_resp.json()["id"]

        # Step 3: Create payout
        payout_resp = requests.post(f"{RAZORPAY_BASE}/payouts", auth=auth, json={
            "account_number": "2323230000000001",  # Razorpay test account
            "fund_account_id": fund_account_id,
            "amount": int(amount * 100),  # Amount in paise
            "currency": "INR",
            "mode": "UPI",
            "purpose": "payout",
            "queue_if_low_balance": True,
            "reference_id": f"gigshield_payout_{worker_name}",
            "narration": "GigShield Income Protection Payout"
        })
        payout_resp.raise_for_status()
        payout_id = payout_resp.json()["id"]

        print(f"[RAZORPAY] Payout initiated: {payout_id} — Rs {amount} to {upi_id}")
        return payout_id

    except requests.RequestException as e:
        print(f"[RAZORPAY] Payout failed: {e}")
        return None
