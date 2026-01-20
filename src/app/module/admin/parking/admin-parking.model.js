const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: '0',
  },
  name: {
    type: String,
    required: true,
    default: '',
  },
  location: {
    type: String,
    required: true,
    default: '',
  },
  status: {
    type: Number,
    default: 0, // 0: đang chỉnh sửa, 1: hoạt động, 2: ngưng hoạt động
  },
  statusName: {
    type: String,
    default: 'Đang chỉnh sửa',
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  totalFloors: {
    type: Number,
    required: true,
    default: 0,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admins',
    required: false,
  },
});

module.exports = mongoose.model('DTOParking', ParkingSchema);
