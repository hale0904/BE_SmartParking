const userModel = require('../../../models/user.model');
const Wallet = require('../../../models/wallet.model');
const WalletTransaction = require('../../../models/walletTransaction.model');

// Lấy ví
exports.getWallet = async (userId) => {
  // 1. check user tồn tại
  const user = await userModel.findOne({ code: userId });

  if (!user) {
    throw new Error('Thiếu mã người dùng');
  }

  // 2. tìm wallet theo ObjectId
  let wallet = await Wallet.findOne({ userId: user._id }).populate(
    'userId',
    'name email'
  ); // chỉ lấy field cần

  // 3. nếu chưa có wallet → tạo mới
  if (!wallet) {
    wallet = await Wallet.create({
      userId: user._id,
      balance: 0,
    });
  }

  return wallet;
};

// Nạp tiền (đã thanh toán xong → webhook gọi)
exports.creditWallet = async ({ userId, amount, transactionId }) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) throw new Error('Wallet not found');

  const before = wallet.balance;

  wallet.balance += amount;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    transactionId,
    amount,
    type: 'CREDIT',
    balanceBefore: before,
    balanceAfter: wallet.balance,
    description: 'Topup wallet',
  });

  return wallet;
};

// Thanh toán bằng ví
const parkingSessionModel = require('../../../models/parkingSession.model');
const mongoose = require('mongoose');

exports.payParkingSession = async ({ sessionId, userId }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // =========================
    // 1. LẤY SESSION
    // =========================
    const parkingSession = await parkingSessionModel
      .findById(sessionId)
      .session(session);

    if (!parkingSession) {
      throw new Error('Session không tồn tại');
    }

    // =========================
    // 2. CHECK OWNER
    // =========================
    if (parkingSession.userId.toString() !== userId.toString()) {
      throw new Error('Không có quyền thanh toán');
    }

    // =========================
    // 3. CHECK TRẠNG THÁI
    // =========================
    // if (parkingSession.status !== 1) {
    //   throw new Error('Chưa check-out thì chưa thanh toán');
    // }

    if (parkingSession.statusPayment === 1) {
      throw new Error('Session đã thanh toán');
    }

    const amount = parkingSession.price;

    // =========================
    // 4. LẤY WALLET
    // =========================
    const wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet || wallet.balance < amount) {
      throw new Error('Không đủ tiền');
    }

    const before = wallet.balance;

    // =========================
    // 5. TRỪ TIỀN
    // =========================
    wallet.balance -= amount;
    await wallet.save({ session });

    // =========================
    // 6. LƯU TRANSACTION
    // =========================
    await WalletTransaction.create(
      [
        {
          walletId: wallet._id,
          amount,
          type: 'DEBIT',
          balanceBefore: before,
          balanceAfter: wallet.balance,
          description: `Thanh toán parking session ${parkingSession.code}`,
        },
      ],
      { session }
    );

    // =========================
    // 7. UPDATE SESSION
    // =========================
    parkingSession.statusPayment = 1;
    parkingSession.statusPaymentName = 'PAID';
    parkingSession.walletId = wallet._id;

    await parkingSession.save({ session });

    // =========================
    // COMMIT
    // =========================
    await session.commitTransaction();

    return {
      message: 'Thanh toán thành công',
      data: parkingSession,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Lịch sử ví
exports.getWalletHistory = async (userId) => {
  const user = await userModel.findOne({ code: userId });

  if (!user) {
    throw new Error('Thiếu mã người dùng');
  }

  // 2. tìm wallet theo ObjectId
  let wallet = await Wallet.findOne({ userId: user._id }).populate(
    'userId',
    'name email'
  );

  if (!wallet) return [];

  return WalletTransaction.find({ walletId: wallet._id }).sort({
    createdAt: -1,
  });
};
