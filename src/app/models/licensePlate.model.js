const mongoose = require('mongoose');

const licensePlateSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    cameraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camera',
      default: null,
    },
    plateNumber: {
      type: String,
      default: null,
    },
    capturedAt: {
      type: Date,
      default: null,
    },
    parkingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSession',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LicensePlate', licensePlateSchema);
