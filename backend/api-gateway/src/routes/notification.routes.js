const router = require('express').Router();
// const { authenticate } = require('../middleware/auth'); // disabled for demo
const notificationController = require('../controllers/notification.controller');

router.post('/dispatch', notificationController.dispatch);

module.exports = router;
