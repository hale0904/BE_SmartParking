const authService = require('./user-auth.service');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        id: user._id,
        code: user.code,
        userName: user.userName,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { code, userName, email, password, confirmPassword, phone } =
      req.body;

    if (
      !code ||
      !userName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp',
      });
    }

    const user = await authService.registerUser({
      code,
      userName,
      email,
      password,
      phone,
    });

    return res.status(201).json({
      success: true,
      message:
        'Đăng ký thành công. Vui lòng kiểm tra Gmail để xác nhận tài khoản',
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    await authService.verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: 'Xác nhận email thành công',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    return res.json({
      success: true,
      message: 'Đã gửi email khôi phục mật khẩu',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    await authService.resetPassword(token, password);

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
