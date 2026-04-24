const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      //   required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    // parkingSessionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'ParkingSession',
    //   default: null,
    // },

    type: { type: String, enum: ['TOPUP', 'PARKING'], required: true },
    amount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ['QR', 'CASH', 'WALLET'],
      default: 'QR',
    },
    paymentCode: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },

    parkingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSession',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
