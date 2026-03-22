const mongoose = require('mongoose');

const LaneNodeParkingSchema = new mongoose.Schema({
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
    default: 0,
  },
  positionY: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    default: 0,
  },
  statusName: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('LaneNode', LaneNodeParkingSchema);
