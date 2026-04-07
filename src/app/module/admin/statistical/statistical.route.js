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

module.exports = router;
