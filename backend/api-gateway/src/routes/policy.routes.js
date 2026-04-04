const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const policyController = require('../controllers/policy.controller');

router.post('/', authenticate, policyController.purchasePolicy);
router.get('/premium-quote', authenticate, policyController.getPremiumQuote);
router.get('/:id', authenticate, policyController.getPolicy);

module.exports = router;
