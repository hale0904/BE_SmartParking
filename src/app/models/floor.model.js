const mongoose = require('mongoose');

const FloorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    nameFloor: {
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
    boundary: {
      points: {
        type: [Number], // mảng số
        required: true,
        default: [],
      },
      closed: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Floor', FloorSchema);
