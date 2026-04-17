const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

router.post('/dispatch', authenticate, notificationController.dispatch);

module.exports = router;
