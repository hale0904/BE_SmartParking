const userModel = require('../../../models/user.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendVerifyEmail } = require('../../../service/mail.service');

exports.getInfoAccount = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Mã người dùng không hợp lệ');
  }

  const user = await userModel
    .findOne({ code })
    .select('code userName email password phone createdAt');

  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  return user;
};

exports.updateInfoAccount = async (payload) => {
  const { code, userName, email, phone, password, oldPassword } = payload;

  const user = await userModel.findOne({ code });

  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  // =========================
  // UPDATE USERNAME / PHONE
  // =========================
  if (userName) user.userName = userName;
  if (phone) user.phone = phone;

  // =========================
  // UPDATE EMAIL (CẦN VERIFY)
  // =========================
  if (email) {
    // CASE 1: nhập lại email đang pending của chính nó
    if (email === user.email && !user.isVerified) {
      // gửi lại mail xác thực
      const verifyToken = crypto.randomBytes(32).toString('hex');
      user.verifyToken = verifyToken;

      await sendVerifyEmail(email, verifyToken);

      await user.save();

      throw new Error('Email đang chờ xác thực, đã gửi lại email xác thực');
    }

    // CASE 2: email mới hoàn toàn
    if (email !== user.email) {
      const existedEmail = await userModel.findOne({ email });

      if (existedEmail) {
        if (existedEmail.isVerified) {
          throw new Error('Email đã tồn tại');
        } else {
          throw new Error(
            'Email này đang chờ xác thực, vui lòng kiểm tra email'
          );
        }
      }

      const verifyToken = crypto.randomBytes(32).toString('hex');

      user.email = email;
      user.isVerified = false;
      user.verifyToken = verifyToken;

      await sendVerifyEmail(email, verifyToken);
    }
  }

  // =========================
  // UPDATE PASSWORD
  // =========================
  if (password) {
    if (!oldPassword) {
      throw new Error('Vui lòng nhập mật khẩu cũ');
    }

    // check password cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không đúng');
    }

    // hash password mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  return {
    message: 'Cập nhật thông tin thành công',
  };
};
