const mongoose = require('mongoose');

const qrPaymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },

    qrUrl: String,
    amount: Number,

    content: String, // DH_123
    bankCode: String,
    accountNumber: String,

    expireAt: Date,

    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'PAID'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRPayment', qrPaymentSchema);
