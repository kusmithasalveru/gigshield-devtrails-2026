const router = require('express').Router();
// const { authenticate } = require('../middleware/auth'); // disabled for demo
const policyController = require('../controllers/policy.controller');

router.post('/', policyController.purchasePolicy);
router.get('/premium-quote', policyController.getPremiumQuote);
router.get('/:id', policyController.getPolicy);

module.exports = router;
