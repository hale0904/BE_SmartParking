const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: '0',
  },

  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    default: null,
    // required: true,
  },

  isActive: {
    type: Number, // 0 = empty , 1 = occupied
    default: 0,
  },

  isOnline: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Sensor', sensorSchema);
