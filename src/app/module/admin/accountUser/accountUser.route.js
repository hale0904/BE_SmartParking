const express = require('express');
const accountUserController = require('./accountUser.controller');
const {
  authAdminMiddleware,
} = require('../../../middlewares/authAdmin.middleware');

const router = express.Router();

router.post(
  '/getListAccountUser',
  authAdminMiddleware,
  accountUserController.getListAccountUser
);
module.exports = router;
