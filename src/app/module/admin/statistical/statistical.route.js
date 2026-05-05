const express = require('express');
const statisticalController = require('./statistical.controller');
const {
  authAdminMiddleware,
} = require('../../../middlewares/authAdmin.middleware');

const router = express.Router();

router.post(
  '/getStatistical',
  authAdminMiddleware,
  statisticalController.getStatistical
);

router.post('/revenue', authAdminMiddleware, statisticalController.getRevenue);

router.post(
  '/turnover',
  authAdminMiddleware,
  statisticalController.getTurnover
);

router.post('/export', authAdminMiddleware, statisticalController.exportReport);

router.post(
  '/validateConflict',
  authAdminMiddleware,
  statisticalController.checkParkingConflict
);

module.exports = router;
