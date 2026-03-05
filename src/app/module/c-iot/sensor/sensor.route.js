const express = require('express');
const sensorController = require('./sensor.controller');

const router = express.Router();

// routes
router.post('/sensor', sensorController.updateSensor);

module.exports = router;
