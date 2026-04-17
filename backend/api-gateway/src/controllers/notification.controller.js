const config = require('../config');

async function sendTwilioMessage({ to, body, channel = 'sms' }) {
  const accountSid = config.twilio.accountSid;
  const authToken = config.twilio.authToken;
  const from = config.twilio.phoneNumber;
  const whatsappFrom = config.twilio.whatsappFrom;
  const phone = String(to || '').replace(/\D/g, '');

  if (!phone) {
    throw new Error('Valid phone number required');
  }

  if (!accountSid || !authToken || !from) {
    console.log(`[NOTIFICATION SIMULATED] ${channel.toUpperCase()} +91${phone}: ${body}`);
    return { simulated: true };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const resolvedFrom =
    channel === 'whatsapp'
      ? (whatsappFrom || `whatsapp:${from}`)
      : from;
  const payload = new URLSearchParams({
    From: resolvedFrom,
    To: channel === 'whatsapp' ? `whatsapp:+91${phone}` : `+91${phone}`,
    Body: body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio message failed: ${response.status} ${text}`);
  }

  return { simulated: false };
}

exports.dispatch = async (req, res, next) => {
  try {
    const { phone, message, channel = 'sms' } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message are required' });
    }
    if (!['sms', 'whatsapp'].includes(channel)) {
      return res.status(400).json({ error: 'channel must be sms or whatsapp' });
    }

    const result = await sendTwilioMessage({ to: phone, body: message, channel });
    res.json({
      success: true,
      channel,
      simulated: result.simulated,
    });
  } catch (err) {
    next(err);
  }
};
