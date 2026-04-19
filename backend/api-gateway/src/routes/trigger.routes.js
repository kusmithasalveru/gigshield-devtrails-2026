const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const triggerController = require('../controllers/trigger.controller');

// Made public for demo purposes
router.get('/', triggerController.listEvents);
router.get('/:id', triggerController.getEventById);

module.exports = router;
