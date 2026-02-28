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
    nameGroupSlot: {
      type: String,
      required: true,
      default: '',
    },
    zoneCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
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
    createdAt: {
      type: Date,
      default: Date.now,
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
    rotation: {
      type: Number,
      default: 0,
    },
    direction: {
      type: String,
      default: '',
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
module.exports = mongoose.model('GroupSlot', ZoneParkingSchema);
