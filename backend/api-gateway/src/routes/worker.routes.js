const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const workerController = require('../controllers/worker.controller');

router.post('/', workerController.register);
router.get('/:id', authenticate, workerController.getProfile);
router.patch('/:id', authenticate, workerController.updateProfile);
router.get('/:id/trust-score', authenticate, workerController.getTrustScore);

module.exports = router;
