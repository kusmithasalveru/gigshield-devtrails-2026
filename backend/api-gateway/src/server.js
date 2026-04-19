require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const workerRoutes = require('./routes/worker.routes');
const policyRoutes = require('./routes/policy.routes');
const payoutRoutes = require('./routes/payout.routes');
const triggerRoutes = require('./routes/trigger.routes');
const zoneRoutes = require('./routes/zone.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(apiLimiter);

// Routes
app.use('/', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/events', triggerRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/notifications', notificationRoutes);

// Fraud Detection API (Demo endpoint)
app.post('/m1/fraud/score', (req, res) => {
  res.json({
    anomaly_score: 0.66,
    decision: 'human_review',
    message: 'Simulated fraud detection response'
  });
});

// Error handling
app.use(errorHandler);

// Root route
app.get('/', (req, res) => {
  res.send('GigShield Backend Running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
