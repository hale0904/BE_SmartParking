const mongoose = require('mongoose');

const LaneParkingSchema = new mongoose.Schema(
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
    // positionX: {
    //   type: Number,
    //   required: true,
    //   default: 0,
    // },
    // positionY: {
    //   type: Number,
    //   required: true,
    //   default: 0,
    // },
    // height: {
    //   type: Number,
    //   required: true,
    //   default: 0,
    // },
    laneWidth: {
      type: Number,
      required: true,
      default: 0,
    },
    points: {
      type: [Number],
      require: true,
      default: [],
    },
    rotation: {
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
    fromNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LaneNode',
      required: true,
    },
    toNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LaneNode',
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Lane', LaneParkingSchema);
