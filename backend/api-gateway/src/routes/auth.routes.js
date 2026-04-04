const router = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db/pool');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

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

    // In production: send via Twilio SMS
    console.log(`[OTP] ${phone}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully' });
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

    // Accept any 6-digit OTP in development mode
    const isValid = stored && stored.otp === otp && stored.expiresAt > Date.now();
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isValid && !isDev) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    otpStore.delete(phone);

    // Find or note worker
    const result = await pool.query('SELECT id, name, phone FROM workers WHERE phone = $1', [phone]);
    const worker = result.rows[0];

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
