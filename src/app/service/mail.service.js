// services/mail.service.js

const nodemailer = require('nodemailer');

// Link frontend (FE) lấy từ env, fallback localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';

// Khởi tạo transporter Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password nếu bật 2FA
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4, // ép IPv4 để tránh ENETUNREACH trên Render
});

// Hàm gửi mail bất đồng bộ
const sendMailAsync = (mailOptions) => {
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Lỗi gửi email:', err);
    } else {
      console.log('Email đã gửi:', info.response);
    }
  });
};

// Gửi email xác nhận tài khoản
const sendVerifyEmail = (email, token) => {
  const verifyLink = `${BASE_URL}/verify-email?token=${token}`; // FE route

  sendMailAsync({
    from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Xác nhận tài khoản',
    html: `
      <h2>Xác nhận tài khoản</h2>
      <p>Vui lòng nhấn vào link bên dưới để xác nhận email:</p>
      <a href="${verifyLink}">${verifyLink}</a>
    `,
  });
};

// Gửi email quên mật khẩu
const sendForgotPasswordEmail = (email, token) => {
  const resetLink = `${BASE_URL}/reset-password?token=${token}`; // FE route

  sendMailAsync({
    from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
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
