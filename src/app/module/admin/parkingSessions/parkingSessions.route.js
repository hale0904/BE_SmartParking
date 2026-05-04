const express = require('express');
const router = express.Router();
const parkingSessionController = require('./parkingSessions.controller');

router.post(
  '/getGuestParkingSessionsWithQR',
  parkingSessionController.getGuestParkingSessionsWithQR
);

module.exports = router;
