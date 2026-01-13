const authService = require('./admin-auth.service');

// Handler register
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const admin = await authService.registerAdmin({ email, password });

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      // adminId: admin._id,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Handler login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { admin, accessToken, refreshToken } = await authService.loginAdmin({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        // id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};
