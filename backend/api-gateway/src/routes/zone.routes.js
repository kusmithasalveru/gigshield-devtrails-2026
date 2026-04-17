const router = require('express').Router();
const zoneController = require('../controllers/zone.controller');

router.get('/', zoneController.listZones);
router.get('/:id', zoneController.getZoneById);

module.exports = router;
