const express = require('express');
const floorController = require('./admin-floor.controller');
const {
  authAdminMiddleware,
} = require('../../../../middlewares/authAdmin.middleware');

const router = express.Router();

router.post(
  '/getListFloorMap',
  authAdminMiddleware,
  floorController.getListFloorMap
);
router.post(
  '/updateFloorMap',
  authAdminMiddleware,
  floorController.updateFloorMap
);
router.post(
  '/getFloorDetailMap',
  authAdminMiddleware,
  floorController.getFloorDetailMap
);
router.delete(
  '/deleteFloorMap',
  authAdminMiddleware,
  floorController.deleteFloorMap
);

module.exports = router;
