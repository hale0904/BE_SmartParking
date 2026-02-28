const express = require('express');
const zoneController = require('./admin-zone.controller');

const router = express.Router();

router.post('/getListZoneMap', zoneController.getListZoneMap);
router.post('/updateZoneMap', zoneController.updateZoneMap);
router.post('/getZoneDetailMap', zoneController.getZoneDetailMap);
router.delete('/deleteZoneMap', zoneController.deleteZoneMap);

module.exports = router;
