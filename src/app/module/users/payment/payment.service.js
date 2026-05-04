const { v4: uuidv4 } = require('uuid');
const Transaction = require('../../../models/transaction.model');
const QRPayment = require('../../../models/qrPayment');
const walletService = require('../../users/wallet/wallet.service'); // thêm
const userModel = require('../../../models/user.model');
const parkingSessionModel = require('../../../models/parkingSession.model');
const notificationService = require('../notification/notification.service');

const BANK_CODE = '970422';
const ACCOUNT_NUMBER = '2702868679';
const ACCOUNT_NAME = 'NGUYEN VAN A';

const buildQR = (paymentCode, amount) => {
  return `https://img.vietqr.io/image/${BANK_CODE}-${ACCOUNT_NUMBER}-compact2.png?amount=${amount}&addInfo=${paymentCode}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
};

// TẠO QR NẠP TIỀN
exports.createTopupQR = async ({ userId, amount }) => {
  const user = await userModel.findOne({ code: userId });
  if (!user) throw new Error('Không tìm thấy user');

  const paymentCode = 'NAP_' + uuidv4().slice(0, 8);

  const transaction = await Transaction.create({
    code: paymentCode,
    userId: user._id,
    type: 'TOPUP',
    amount,
    paymentMethod: 'QR',
    paymentCode,
    status: 'PENDING',
  });

  const qrUrl = buildQR(paymentCode, amount);

  const qrPayment = await QRPayment.create({
    transactionId: transaction._id,
    qrUrl,
    amount,
    content: paymentCode,
    expireAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return { transaction, qrPayment };
};

// TẠO QR THANH TOÁN PARKING
exports.createParkingQR = async ({ userId, amount, sessionId }) => {
  let user = null;

  if (userId) {
    user = await userModel.findById(userId);
  }

  const paymentCode = 'PARK_' + uuidv4().slice(0, 8);

  const transaction = await Transaction.create({
    code: paymentCode,
    userId: user?._id || null,
    type: 'PARKING',
    amount,
    paymentMethod: 'QR',
    paymentCode,
    status: 'PENDING',
    parkingSessionId: sessionId,
  });

  const qrUrl = buildQR(paymentCode, amount);

  const qrPayment = await QRPayment.create({
    transactionId: transaction._id,
    qrUrl,
    amount,
    content: paymentCode,
    expireAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  return { transaction, qrPayment };
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

    await notificationService.createNotification({
      userId: transaction.userId,
      title: 'Nạp tiền thành công',
      message: `+${amount} VNĐ vào ví`,
      type: 'TOPUP',
      metadata: {
        amount,
        transactionId: transaction._id,
        paymentCode: transaction.paymentCode,
      },
    });
  }

  return transaction;
};

exports.handleParkingWebhook = async ({ amount, content }) => {
  const transaction = await Transaction.findOne({ paymentCode: content });

  if (!transaction || transaction.type !== 'PARKING') return null;

  if (Number(transaction.amount) !== Number(amount)) return null;

  const isPaid = transaction.status === 'PAID';

  // update transaction
  if (!isPaid) {
    transaction.status = 'PAID';
    await transaction.save();

    await QRPayment.updateMany(
      { transactionId: transaction._id },
      { status: 'PAID' }
    );
  }

  // update parking session
  const session = await parkingSessionModel.findById(
    transaction.parkingSessionId
  );

  if (!session) {
    throw new Error('Không tìm thấy parking session');
  }

  if (session.status !== 1) {
    session.status = 1;
    session.statusName = 'COMPLETED';
  }

  if (session.statusPayment !== 1) {
    session.statusPayment = 1;
    session.statusPaymentName = 'PAID';
  }

  if (!session.checkOutTime) {
    session.checkOutTime = new Date();
  }

  await session.save();

  await notificationService.createNotification({
    userId: transaction.userId,
    title: 'Thanh toán bãi xe thành công',
    message: `- ${amount} VNĐ phí đỗ xe`,
    type: 'PARKING',
    metadata: {
      amount,
      transactionId: transaction._id,
      paymentCode: transaction.paymentCode,
      parkingSessionId: session._id,
    },
  });

  return {
    message: 'Thanh toán parking thành công',
    session,
  };
};
