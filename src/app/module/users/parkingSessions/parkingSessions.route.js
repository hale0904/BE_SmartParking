const express = require('express');
const router = express.Router();
const parkingSessionController = require('./parkingSessions.controller');

router.post('/getParkingSessions', parkingSessionController.getParkingSessions);

module.exports = router;
