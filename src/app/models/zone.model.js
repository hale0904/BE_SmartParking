const mongoose = require('mongoose');

const ZoneParkingSchema = new mongoose.Schema(
  {
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
    status: {
      type: Number,
      required: true,
      default: 0, // 0: trống, 1: đã đặt, 2: đang sử dụng
    },
    statusName: {
      type: String,
      required: true,
      default: 'Đang chỉnh sửa',
    },
    nameZone: {
      type: String,
      required: true,
      default: '',
    },
    totalSlots: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startPositionX: {
      type: Number,
      required: true,
      default: 0,
    },
    startPositionY: {
      type: Number,
      required: true,
      default: 0,
    },
    endPositionX: {
      type: Number,
      required: true,
      default: 0,
    },
    endPositionY: {
      type: Number,
      required: true,
      default: 0,
    },
    availableSlots: {
      type: Number,
      required: true,
      default: 0,
    },
    occupiedSlots: {
      type: Number,
      required: true,
      default: 0,
    },
    reservedSlots: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Zone', ZoneParkingSchema);
