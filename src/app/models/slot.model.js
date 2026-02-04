const mongoose = require('mongoose');

const SlotParkingSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: '0',
    },
    nameSlot: {
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', SlotParkingSchema);
