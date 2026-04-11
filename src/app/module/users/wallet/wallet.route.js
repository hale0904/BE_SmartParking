const express = require('express');
const router = express.Router();
const controller = require('./wallet.controller');

// lấy ví
router.post('/getWallet', controller.getWallet);

// thanh toán bằng ví
router.post('/pay', controller.payWithWallet);

// lịch sử
router.post('/getHistory', controller.getHistory);

module.exports = router;
