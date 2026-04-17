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
app.use(cors());
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

// Error handling
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GigShield API Gateway running on port ${config.port}`);
});

module.exports = app;
