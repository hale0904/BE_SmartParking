const express = require('express');
const parkingController = require('./user-parking.controller');
const {
  authUserMiddleware,
} = require('../../../middlewares/authUser.middleware');

const router = express.Router();

router.post(
  '/getParkingMap',
  // authUserMiddleware,
  parkingController.getParkingMap
);

module.exports = router;
