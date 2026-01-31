const express = require('express');
const slotController = require('./admin-slot.controller');

const router = express.Router();

// router.post('/getListFloorMap', floorController.getListFloorMap);
router.post('/updateSlotMap', slotController.updateSlotMap);
// router.post('/getFloorDetailMap', floorController.getFloorDetailMap);
// router.delete('/deleteFloorMap', floorController.deleteFloorMap);

module.exports = router;
