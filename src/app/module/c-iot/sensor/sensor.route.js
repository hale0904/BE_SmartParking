const express = require('express');
const sensorController = require('./sensor.service');

const router = express.Router();

// routes
router.post('/updateSensor', sensorController.updateSensor);

module.exports = router;
