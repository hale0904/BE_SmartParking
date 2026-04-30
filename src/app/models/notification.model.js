// models/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['TOPUP', 'PARKING'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object, // lưu thêm info: amount, transactionId...
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
