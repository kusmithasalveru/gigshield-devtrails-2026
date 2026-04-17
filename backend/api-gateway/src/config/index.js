require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/gigshield',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET
  },
  fraudEngineUrl: process.env.FRAUD_ENGINE_URL || 'http://localhost:8000'
};
