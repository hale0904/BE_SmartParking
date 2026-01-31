const mongoose = require('mongoose');

const FloorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    parkingCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: true,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSlots: {
      type: Number,
      required: true,
      default: 0,
    },
    entrances: {
      type: Number,
      required: true,
      default: 0,
    },
    exits: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Floor', FloorSchema);
