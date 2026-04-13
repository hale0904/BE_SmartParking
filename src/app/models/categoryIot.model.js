const mongoose = require('mongoose');

const categoryIot = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: '0',
  },
  name: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('CategoryIot', categoryIot);
