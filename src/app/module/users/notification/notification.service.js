// services/notification.service.js
const notificationModel = require('../../../models/notification.model');
const Notification = require('../../../models/notification.model');
const userModel = require('../../../models/user.model');

exports.createNotification = async ({
  userId,
  title,
  message,
  type,
  metadata = {},
}) => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    metadata,
  });
};

exports.getNotification = async (userId) => {
  if (userId == null || userId == '') {
    throw new Error('Thiếu mã của người dùng');
  }

  const user = await userModel.findOne({ code: userId });

  if (!user) {
    throw new Error('Người dùng không hợp lệ');
  }

  const filter = { userId: user._id };

  const notifications = await notificationModel
    .find(filter)
    .select('userId title message type isRead metadata')
    .sort({ createdAt: -1 });

  return notifications;
};

exports.readNotification = async (userId) => {
  if (!userId) {
    throw new Error('Thiếu mã người dùng');
  }

  const user = await userModel.findOne({ code: userId });

  if (!user) {
    throw new Error('Người dùng không hợp lệ');
  }

  const result = await notificationModel.updateMany(
    {
      userId: user._id,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  return {
    message: 'Đã đọc tất cả thông báo',
    modifiedCount: result.modifiedCount,
  };
};
