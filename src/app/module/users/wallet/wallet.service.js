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
exports.debitWallet = async ({ userId, amount }) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet || wallet.balance < amount) {
    throw new Error('Không đủ tiền');
  }

  const before = wallet.balance;

  wallet.balance -= amount;
  await wallet.save();

  await WalletTransaction.create({
    walletId: wallet._id,
    amount,
    type: 'DEBIT',
    balanceBefore: before,
    balanceAfter: wallet.balance,
    description: 'Payment',
  });

  return wallet;
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
