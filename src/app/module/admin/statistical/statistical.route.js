const express = require('express');
const statisticalController = require('./statistical.controller');

const router = express.Router();

// router.post('/getListFloorMap', floorController.getListFloorMap);
router.post('/getStatistical', statisticalController.getStatistical);
// router.post('/getFloorDetailMap', floorController.getFloorDetailMap);
// router.delete('/deleteFloorMap', floorController.deleteFloorMap);

module.exports = router;
