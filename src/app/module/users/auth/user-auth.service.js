const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../../../models/user.model');
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
} = require('../../../service/mail.service');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../../../utils/token.util');

exports.registerUser = async ({ code, userName, email, password, phone }) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }, { code }],
  });

  if (existingUser) {
    throw new Error('Email, số điện thoại hoặc mã người dùng đã tồn tại');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    code,
    userName,
    email,
    phone,
    password: hashedPassword,
    verifyToken,
    isVerified: false,
  });

  await sendVerifyEmail(email, verifyToken);

  return user;
};

exports.verifyEmail = async (token) => {
  if (!token) {
    throw new Error('Thiếu token xác nhận');
  }

  const user = await User.findOne({ verifyToken: token });

  if (!user) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }

  user.isVerified = true;
  user.verifyToken = null;

  await user.save();

  return user;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }

  if (!user.isVerified) {
    throw new Error('Vui lòng xác nhận Gmail trước khi đăng nhập');
  }

  const payload = {
    id: user._id,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Email không tồn tại');
  }

  const token = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  await sendForgotPasswordEmail(email, token);

  return true;
};

exports.resetPassword = async (token, newPassword) => {
  if (!token) {
    throw new Error('Thiếu token');
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

  return true;
};
