const mongoose = require('mongoose');

const VehiclesSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      require: true,
      unique: true,
      trim: true,
    },
    nameVehicles: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    licensePlate: {
      type: String,
      default: '',
    },
    lastOnlineAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Number,
      default: 0,
    },
    statusName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', VehiclesSchema);
