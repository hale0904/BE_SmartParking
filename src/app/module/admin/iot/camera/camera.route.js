const express = require('express');
const cameraController = require('./camera.controller');
const {
  authAdminMiddleware,
} = require('../../../../middlewares/authAdmin.middleware');

const router = express.Router();

router.post(
  '/getListCamera',
  authAdminMiddleware,
  cameraController.getListCamera
);
router.post(
  '/updateCamera',
  authAdminMiddleware,
  cameraController.updateCamera
);

router.post(
  '/deleteCamera',
  authAdminMiddleware,
  cameraController.deleteCamera
);

module.exports = router;
