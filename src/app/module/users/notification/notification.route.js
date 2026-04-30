const express = require('express');
const notificationController = require('./notification.controller');
const {
  authUserMiddleware,
} = require('../../../middlewares/authUser.middleware');

const router = express.Router();

router.post(
  '/getNotification',
  authUserMiddleware,
  notificationController.getNotification
);

router.post(
  '/notifications/read-all',
  authUserMiddleware,
  notificationController.readAllNotification
);

module.exports = router;
