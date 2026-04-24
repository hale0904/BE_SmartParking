const express = require('express');
const router = express.Router();
const controller = require('./payment.controller');

// tạo QR thanh toán
router.post('/create-qr', controller.createQR);

// webhook
router.post('/webhook', controller.webhook);
router.post('/webhook-parking', controller.handleParkingWebhook);

module.exports = router;
