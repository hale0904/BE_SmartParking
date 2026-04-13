const express = require('express');
const categoryController = require('./categoryIot.controller');
const {
  authAdminMiddleware,
} = require('../../../../middlewares/authAdmin.middleware');

const router = express.Router();

router.post(
  '/getListCategoryIot',
  authAdminMiddleware,
  categoryController.getListCategoryIot
);
router.post(
  '/updateCategoryIot',
  authAdminMiddleware,
  categoryController.updateCategoryIot
);

router.post(
  '/deleteCategoryIot',
  authAdminMiddleware,
  categoryController.deleteCategoryIot
);

module.exports = router;
