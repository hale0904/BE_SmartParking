const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
    required: true,
  },
  slotCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: false,
  },
  status: {
    type: Number,
    default: 0, // 0: không có xe, 1: có xe
  },
});

const ServerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    required: true,
  },
});

const IoTConfigSchema = new mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: true,
      default: 'ESP32-Parking',
    },

    wifiSSID: {
      type: String,
      required: true,
    },

    wifiPassword: {
      type: String,
      required: true,
    },

    sensors: {
      type: [SensorSchema],
      default: [],
    },

    servers: {
      type: [ServerSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IoT', IoTConfigSchema);