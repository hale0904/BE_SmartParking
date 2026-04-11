const { v4: uuidv4 } = require('uuid');
const Transaction = require('../../../models/transaction.model');
const QRPayment = require('../../../models/qrPayment');
const walletService = require('../../users/wallet/wallet.service'); // thêm
const userModel = require('../../../models/user.model');

const BANK_CODE = '970422';
const ACCOUNT_NUMBER = '2702868679';
const ACCOUNT_NAME = 'NGUYEN VAN A';

// TẠO QR NẠP TIỀN
exports.createTopupQR = async ({ userId, amount }) => {
  const user = await userModel.findOne({ code: userId });
  if (!user) {
    throw new Error('Thiếu mã người dùng');
  }

  const paymentCode = 'NAP_' + uuidv4().slice(0, 8); // đổi prefix

  // 1. tạo transaction TOPUP
  const transaction = await Transaction.create({
    code: paymentCode,
    userId: user,
    type: 'TOPUP', // quan trọng
    amount,
    paymentMethod: 'QR',
    paymentCode,
    status: 'PENDING',
  });

  // 2. tạo QR
  const qrUrl = `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NUMBER}-compact2.png?amount=${amount}&addInfo=${paymentCode}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // 3. lưu QRPayment
  const qrPayment = await QRPayment.create({
    transactionId: transaction._id,
    qrUrl,
    amount,
    content: paymentCode,
    bankCode: BANK_CODE,
    accountNumber: ACCOUNT_NUMBER,
    expireAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return {
    transaction,
    qrPayment,
  };
};

exports.handleWebhook = async ({ amount, content }) => {
  const transaction = await Transaction.findOne({ paymentCode: content });

  if (!transaction) return null;

  // tránh xử lý 2 lần
  if (transaction.status === 'PAID') return transaction;

  // check đúng tiền
  if (Number(transaction.amount) !== Number(amount)) return null;

  // 1. update transaction
  transaction.status = 'PAID';
  await transaction.save();

  // 2. update QRPayment
  await QRPayment.updateMany(
    { transactionId: transaction._id },
    { status: 'PAID' }
  );

  // 3. CỘNG TIỀN VÀO WALLET
  if (transaction.type === 'TOPUP') {
    await walletService.creditWallet({
      userId: transaction.userId,
      amount,
      transactionId: transaction._id,
    });
  }

  return transaction;
};
