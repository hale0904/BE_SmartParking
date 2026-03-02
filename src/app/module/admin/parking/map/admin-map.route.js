const express = require('express');
const mapController = require('./admin-map.controller');

const router = express.Router();

// routes
router.post('/getListMap', mapController.getListMap);
// router.post('/getParkingDetail/', parkingController.getParkingDetail);
router.post('/updateMap', mapController.updateMap);
// router.post('/updateParkingStatus', parkingController.updateParkingStatus);
router.delete('/deleteMap', mapController.deleteMap);

module.exports = router;
