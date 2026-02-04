const express = require('express');
const zoneController = require('./admin-zone.controller');

const router = express.Router();

// router.post('/getListFloorMap', floorController.getListFloorMap);
router.post('/updateZoneMap', zoneController.updateZoneMap);
// router.post('/getFloorDetailMap', floorController.getFloorDetailMap);
// router.delete('/deleteFloorMap', floorController.deleteFloorMap);

module.exports = router;
