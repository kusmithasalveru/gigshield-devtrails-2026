const router = require('express').Router();
// const { authenticate } = require('../middleware/auth'); // disabled for demo
const workerController = require('../controllers/worker.controller');

router.post('/', workerController.register);
router.get('/:id', workerController.getProfile);
router.patch('/:id', workerController.updateProfile);
router.get('/:id/trust-score', workerController.getTrustScore);

module.exports = router;
