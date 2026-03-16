const express = require('express');
const vehiclesController = require('./vehicles.controller');

const router = express.Router();

router.post('/getListVehicles', vehiclesController.getListVehicles);
router.post('/getDetailVehilces', vehiclesController.getDetailVehilces);
router.post('/updateVehicles', vehiclesController.updateVehicles);
router.delete('/deleteVehilces', vehiclesController.deleteVehilces);

module.exports = router;
