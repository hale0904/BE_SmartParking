const express = require('express');
const mapController = require('./admin-map.controller');
const {
  authAdminMiddleware,
} = require('../../../../middlewares/authAdmin.middleware');

const router = express.Router();

// routes
router.post('/getListMap', authAdminMiddleware, mapController.getListMap);
// router.post('/getParkingDetail/', parkingController.getParkingDetail);
router.post('/updateMap', authAdminMiddleware, mapController.updateMap);
// router.post('/updateParkingStatus', parkingController.updateParkingStatus);
// router.delete('/deleteMap', mapController.deleteMap);

module.exports = router;
