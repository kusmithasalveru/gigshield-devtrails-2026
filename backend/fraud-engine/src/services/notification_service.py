"""
Notification Service — Send WhatsApp/SMS alerts via Twilio in worker's language.
"""
from ..config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

# Notification templates per language
PAYOUT_TEMPLATES = {
    "te": "GigShield నుండి ₹{amount} మీ ఖాతాలో జమ అయింది. {event_type} కారణంగా. మీరు సురక్షితంగా ఉండండి!",
    "hi": "GigShield से ₹{amount} आपके खाते में जमा किया गया। {event_type} के कारण। सुरक्षित रहें!",
    "ta": "GigShield இலிருந்து ₹{amount} உங்கள் கணக்கில் வரவு வைக்கப்பட்டது. {event_type} காரணமாக. பாதுகாப்பாக இருங்கள்!",
    "kn": "GigShield ನಿಂದ ₹{amount} ನಿಮ್ಮ ಖಾತೆಗೆ ಜಮಾ ಆಗಿದೆ. {event_type} ಕಾರಣ. ಸುರಕ್ಷಿತವಾಗಿರಿ!",
    "en": "GigShield has credited ₹{amount} to your account due to {event_type}. Stay safe!",
}

REVIEW_TEMPLATES = {
    "te": "GigShield: మీ ₹{amount} క్లెయిమ్ సమీక్షలో ఉంది. 24 గంటల్లో నిర్ణయం తెలియజేస్తాము.",
    "hi": "GigShield: आपका ₹{amount} का दावा समीक्षा में है। 24 घंटे में अपडेट मिलेगा.",
    "en": "GigShield: Your ₹{amount} claim is under review. We'll update you within 24 hours.",
}

EVENT_TYPE_NAMES = {
    "te": {"heavy_rain": "భారీ వర్షం", "moderate_rain": "మోస్తరు వర్షం", "severe_pollution": "తీవ్ర కాలుష్యం",
           "extreme_heat": "తీవ్ర వేడి", "flash_flood": "వరదలు", "strike": "సమ్మె"},
    "hi": {"heavy_rain": "भारी बारिश", "moderate_rain": "मध्यम बारिश", "severe_pollution": "गंभीर प्रदूषण",
           "extreme_heat": "अत्यधिक गर्मी", "flash_flood": "बाढ़", "strike": "हड़ताल"},
    "en": {"heavy_rain": "Heavy Rain", "moderate_rain": "Moderate Rain", "severe_pollution": "Severe Pollution",
           "extreme_heat": "Extreme Heat", "flash_flood": "Flash Flood", "strike": "Strike/Curfew"},
}


def send_payout_notification(phone, language, amount, event_type):
    """Send payout credited notification via WhatsApp."""
    lang = language if language in PAYOUT_TEMPLATES else "en"
    event_name = EVENT_TYPE_NAMES.get(lang, EVENT_TYPE_NAMES["en"]).get(event_type, event_type)
    message = PAYOUT_TEMPLATES[lang].format(amount=amount, event_type=event_name)

    _send_whatsapp(phone, message)


def send_review_notification(phone, language, amount):
    """Send claim under review notification."""
    lang = language if language in REVIEW_TEMPLATES else "en"
    message = REVIEW_TEMPLATES[lang].format(amount=amount)

    _send_whatsapp(phone, message)


def _send_whatsapp(phone, message):
    """Send WhatsApp message via Twilio."""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print(f"[TWILIO] Simulated WhatsApp to +91{phone}: {message}")
        return True

    try:
        import requests
        resp = requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json",
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
            data={
                "From": f"whatsapp:{TWILIO_PHONE_NUMBER}",
                "To": f"whatsapp:+91{phone}",
                "Body": message,
            },
        )
        resp.raise_for_status()
        print(f"[TWILIO] WhatsApp sent to +91{phone}")
        return True
    except Exception as e:
        print(f"[TWILIO] Failed to send to +91{phone}: {e}")
        return False
