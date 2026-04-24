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

exports.handleParkingWebhook = async (req, res) => {
  try {
    const result = await paymentService.handleParkingWebhook(req.body);
    res.json(result);
  } catch (err) {
    console.error('❌ WEBHOOK PARKING ERROR:', err);
    res.status(500).json({
      message: err.message,
      stack: err.stack, // debug
    });
  }
};
