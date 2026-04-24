const mongoose = require('mongoose');

const parkingSessionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },

  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: null,
  },

  checkInTime: {
    type: Date,
    default: null,
  },
  checkOutTime: {
    type: Date,
    default: null,
  },

  price: {
    type: Number,
    default: 0,
  },

  status: {
    type: Number, // 0 = ongoing, 1 = completed
    default: 0,
  },

  statusName: {
    type: String,
    default: '',
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null,
  },

  licensePlateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LicensePlate',
    default: null,
  },

  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    default: null,
  },

  statusPayment: {
    type: Number, // 0 = unpaid, 1 = paid
    default: 0,
  },

  statusPaymentName: {
    type: String,
    default: '',
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);
