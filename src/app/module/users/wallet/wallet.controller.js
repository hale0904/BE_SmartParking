const walletService = require('./wallet.service');

// Lấy số dư
exports.getWallet = async (req, res) => {
  try {
    const { userId } = req.body;

    const wallet = await walletService.getWallet(userId);

    res.json({
      success: true,
      data: wallet,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thanh toán bằng ví
exports.payWithWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    const wallet = await walletService.debitWallet({
      userId: req.user._id,
      amount,
    });

    res.json({
      success: true,
      data: wallet,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lịch sử ví
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.body;

    const history = await walletService.getWalletHistory(userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
