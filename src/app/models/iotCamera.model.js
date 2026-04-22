const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: '0',
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryIot',
    default: null,
  },

  isOnline: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Camera', cameraSchema);
