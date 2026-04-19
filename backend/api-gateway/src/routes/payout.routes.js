const router = require('express').Router();
// const { authenticate } = require('../middleware/auth'); // disabled for demo
const payoutController = require('../controllers/payout.controller');

router.get('/:id', payoutController.getPayoutById);
router.post('/:id/dispute', payoutController.initiateDispute);

module.exports = router;
