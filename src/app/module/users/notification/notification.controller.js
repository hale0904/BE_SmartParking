const notificationService = require('./notification.service');

exports.getNotification = async (req, res) => {
  try {
    const { userId } = req.body;

    const data = await notificationService.getNotification(userId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đọc thông báo
exports.readAllNotification = async (req, res) => {
  try {
    const { userId } = req.body;

    const result = await notificationService.readNotification(userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
