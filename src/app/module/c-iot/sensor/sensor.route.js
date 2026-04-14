const express = require('express');
const router = express.Router();
const sensorController = require('./sensor.controller');

router.post('/updatesensoresp32', sensorController.updateSensor);

module.exports = router;
