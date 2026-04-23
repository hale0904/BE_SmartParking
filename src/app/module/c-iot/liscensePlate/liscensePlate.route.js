// routes/licensePlate.route.js
const express = require('express');
const router = express.Router();
const licensePlateController = require('./liscensePlate.controller');

router.post('/scan-license-plate', licensePlateController.scanLicensePlate);

module.exports = router;
