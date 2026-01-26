const express = require('express');
const floorController = require('./admin-floor.controller');

const router = express.Router();

router.post('/getListFloorMap', floorController.getListFloorMap);
router.post('/updateFloorMap', floorController.updateFloorMap);
router.post('/getFloorDetailMap', floorController.getFloorDetailMap);
router.delete('/deleteFloorMap', floorController.deleteFloorMap);

module.exports = router;
