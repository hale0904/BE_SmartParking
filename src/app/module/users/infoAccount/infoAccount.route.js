const express = require('express');
const infoAccountController = require('./infoAccount.controller');
const {
  authUserMiddleware,
} = require('../../../middlewares/authUser.middleware');

const router = express.Router();

router.post(
  '/getInfoAccount',
  authUserMiddleware,
  infoAccountController.getInfoAccount
);

router.post(
  '/updateInfoAccount',
  authUserMiddleware,
  infoAccountController.updateInfoAccount
);

module.exports = router;
