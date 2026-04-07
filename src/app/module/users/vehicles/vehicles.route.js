const express = require('express');
const vehiclesController = require('./vehicles.controller');
const {
  authUserMiddleware,
} = require('../../../middlewares/authUser.middleware');

const router = express.Router();

router.post(
  '/getListVehicles',
  authUserMiddleware,
  vehiclesController.getListVehicles
);
router.post(
  '/getDetailVehilces',
  authUserMiddleware,
  vehiclesController.getDetailVehilces
);
router.post(
  '/updateVehicles',
  authUserMiddleware,
  vehiclesController.updateVehicles
);
router.delete(
  '/deleteVehilces',
  authUserMiddleware,
  vehiclesController.deleteVehilces
);

module.exports = router;
