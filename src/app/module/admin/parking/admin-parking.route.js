const express = require('express');
const parkingController = require('./admin-parking.controller');

const router = express.Router();

// routes
router.get('/getListParkingMap', parkingController.getListParkingMap);
router.get('/getParkingDetail/', parkingController.getParkingDetail);
router.post('/updateParkingMap', parkingController.updateParkingMap);
router.delete('/deleteParkingMap', parkingController.deleteParkingMap);

module.exports = router;
