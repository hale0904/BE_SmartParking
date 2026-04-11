const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },

    balanceBefore: Number,
    balanceAfter: Number,

    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
