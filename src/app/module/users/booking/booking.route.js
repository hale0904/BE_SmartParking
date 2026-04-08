const express = require('express');
const bookingsController = require('./booking.controller');
const {
  authUserMiddleware,
} = require('../../../middlewares/authUser.middleware');

const router = express.Router();

router.post('/bookingSlot', authUserMiddleware, bookingsController.bookingSlot);
router.post(
  '/getListBooking',
  authUserMiddleware,
  bookingsController.getListBooking
);

router.post(
  '/cancelBooking',
  authUserMiddleware,
  bookingsController.cancelBooking
);

module.exports = router;
