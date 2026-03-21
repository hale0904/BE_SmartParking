const express = require('express');
const bookingsController = require('./booking.controller');

const router = express.Router();

router.post('/bookingSlot', bookingsController.bookingSlot);
router.post('/getListBooking', bookingsController.getListBooking);

module.exports = router;
