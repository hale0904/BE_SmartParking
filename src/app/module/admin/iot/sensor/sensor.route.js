const express = require('express');
const sensorController = require('./sensor.controller');
const {
  authAdminMiddleware,
} = require('../../../../middlewares/authAdmin.middleware');

const router = express.Router();

router.post(
  '/getListSensor',
  authAdminMiddleware,
  sensorController.getListSensor
);
router.post(
  '/updateSensor',
  authAdminMiddleware,
  sensorController.updateSensor
);

router.post(
  '/deleteSensor',
  authAdminMiddleware,
  sensorController.deleteSensor
);

module.exports = router;
