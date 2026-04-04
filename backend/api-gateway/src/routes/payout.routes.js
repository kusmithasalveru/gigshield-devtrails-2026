const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const payoutController = require('../controllers/payout.controller');

router.get('/:id', authenticate, payoutController.getPayoutById);
router.post('/:id/dispute', authenticate, payoutController.initiateDispute);

module.exports = router;
