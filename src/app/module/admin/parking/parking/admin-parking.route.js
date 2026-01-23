const express = require('express');
const parkingController = require('./admin-parking.controller');

const router = express.Router();

// routes
router.post('/getListParkingMap', parkingController.getListParkingMap);
router.post('/getParkingDetail/', parkingController.getParkingDetail);
router.post('/updateParkingMap', parkingController.updateParkingMap);
router.post('/updateParkingStatus', parkingController.updateParkingStatus);
router.delete('/deleteParkingMap', parkingController.deleteParkingMap);

module.exports = router;
