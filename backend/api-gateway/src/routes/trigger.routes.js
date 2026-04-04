const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const triggerController = require('../controllers/trigger.controller');

router.get('/', authenticate, triggerController.listEvents);
router.get('/:id', authenticate, triggerController.getEventById);

module.exports = router;
