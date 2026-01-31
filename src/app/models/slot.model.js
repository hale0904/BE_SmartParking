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
    floorCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      required: false,
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
    zone: {
      type: String,
      required: true,
      default: '',
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', SlotParkingSchema);
