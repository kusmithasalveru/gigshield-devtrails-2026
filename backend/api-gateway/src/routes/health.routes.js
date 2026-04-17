const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gigshield-api-gateway', timestamp: new Date().toISOString() });
});

module.exports = router;
