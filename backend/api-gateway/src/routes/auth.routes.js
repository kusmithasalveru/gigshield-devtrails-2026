const router = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db/pool');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

async function sendOtpViaTwilio(phone, otp) {
  const accountSid = config.twilio.accountSid;
  const authToken = config.twilio.authToken;
  const from = config.twilio.phoneNumber;
  const message = `GigShield OTP: ${otp}. Valid for 5 minutes.`;

  if (!accountSid || !authToken || !from) {
    console.log(`[OTP SIMULATED] ${phone}: ${otp}`);
    return { simulated: true };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const body = new URLSearchParams({
    From: from,
    To: `+91${phone}`,
    Body: message,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio OTP send failed: ${response.status} ${text}`);
  }

  return { simulated: false };
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: 'Valid 10-digit phone number required' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const result = await sendOtpViaTwilio(phone, otp);

    res.json({
      success: true,
      message: result.simulated ? 'OTP simulated (Twilio not configured)' : 'OTP sent successfully',
      ...(result.simulated && process.env.NODE_ENV !== 'production' ? { dev_otp: otp } : {}),
    });
  } catch (err) { next(err); }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const stored = otpStore.get(phone);
    const isValid = stored && stored.otp === otp && stored.expiresAt > Date.now();

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    otpStore.delete(phone);

    // Find or note worker (DB optional for demo/local runs)
    let worker = null;
    try {
      const result = await pool.query('SELECT id, name, phone FROM workers WHERE phone = $1', [phone]);
      worker = result.rows[0] || null;
    } catch (e) {
      worker = null;
    }

    const token = jwt.sign(
      { workerId: worker?.id || null, phone },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      isNewUser: !worker,
      worker: worker || null
    });
  } catch (err) { next(err); }
});

module.exports = router;
