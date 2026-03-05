const mongoose = require('mongoose');

const SlotStandaloneParkingSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: '0',
  },
  floorCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: true,
  },
  positionX: {
    type: Number,
    required: true,
    default: 0,
  },
  positionY: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: Number,
    required: true,
    default: 0,
  },
  statusName: {
    type: String,
    required: true,
    default: 'Đang chỉnh sửa',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sensorId: {
    type: String,
    default: null,
  },
  isSensorReal: {
    type: Boolean,
    required: true,
    default: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  sensorStatus: {
    type: Boolean,
  },
});

module.exports = mongoose.model('SlotStandalone', SlotStandaloneParkingSchema);
