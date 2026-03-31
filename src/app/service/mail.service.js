// services/mail.service.js

const nodemailer = require('nodemailer');
const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerifyEmail = async (email, token) => {
  const verifyLink = `${BASE_URL}/api/us/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Xác nhận tài khoản',
    html: `
      <h2>Xác nhận tài khoản</h2>
      <p>Vui lòng nhấn vào link bên dưới để xác nhận email:</p>
      <a href="${verifyLink}">${verifyLink}</a>
    `,
  });
};

const sendForgotPasswordEmail = async (email, token) => {
  const resetLink = `${BASE_URL}/api/us/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Quên mật khẩu',
    html: `
      <h2>Khôi phục mật khẩu</h2>
      <p>Nhấn vào link bên dưới để đặt lại mật khẩu:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link sẽ hết hạn sau 15 phút.</p>
    `,
  });
};

module.exports = {
  sendVerifyEmail,
  sendForgotPasswordEmail,
};
