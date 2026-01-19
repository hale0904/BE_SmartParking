const authService = require('./user-auth.service');

// Handler login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        // id: user._id,
        email: user.email,
        role: user.role,
      },
      // accessToken,
      // refreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

// Handler register
exports.registerUser = async (req, res) => {
  try {
    const { code, userName, email, password, confirmPassword } = req.body;

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

    const user = await authService.registerUser({
      code,
      userName,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      // userId: user._id,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
