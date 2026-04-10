const express = require('express');
const sensorController = require('./sensor.controller');
const {
  authUserMiddleware,
} = require('../../../middlewares/authUser.middleware');

const router = express.Router();

router.post(
  '/getListSensor',
  //   authUserMiddleware,
  sensorController.getListSensor
);
router.post(
  '/updateSensor',
  //   authUserMiddleware,
  sensorController.updateSensor
);

module.exports = router;
