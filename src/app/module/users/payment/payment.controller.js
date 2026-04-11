const paymentService = require('./payment.service');

exports.createQR = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const result = await paymentService.createTopupQR({
      amount,
      userId,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.webhook = async (req, res) => {
  try {
    const { amount, content } = req.body;

    await paymentService.handleWebhook({ amount, content });

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
};
