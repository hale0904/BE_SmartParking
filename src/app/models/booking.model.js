const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    vehiclesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    expectedArrivalTime: {
      type: Date,
      require: true,
    },
    // expectedLeaveTime: {
    //   type: Date,
    //   require: true,
    // },
    status: {
      type: Number,
      require: true,
    },
    statusName: {
      type: String,
      default: '',
    },
    licensePlate: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
