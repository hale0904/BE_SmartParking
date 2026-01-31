const express = require('express');
const parkingController = require('./user-parking.controller');

const router = express.Router();

// router.post('/getListFloorMap', floorController.getListFloorMap);
router.post('/getParkingMap', parkingController.getParkingMap);
// router.post('/getFloorDetailMap', floorController.getFloorDetailMap);
// router.delete('/deleteFloorMap', floorController.deleteFloorMap);

module.exports = router;
