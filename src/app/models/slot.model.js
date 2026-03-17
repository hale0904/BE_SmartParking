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
    groupSlotCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupSlot',
      required: true,
    },
    status: {
      type: Number,
      required: true,
      default: 0, // 0: trống, 1: đã đặt, 2: đang sử dụng
    },
    statusName: {
      type: String,
      // required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slot', SlotParkingSchema);
