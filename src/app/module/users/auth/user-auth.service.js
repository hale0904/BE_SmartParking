const User = require('./user-auth.model');
const { hashPassword, comparePassword } = require('../../../utils/hash.util');

const {
  generateAccessToken,
  generateRefreshToken,
} = require('../../../utils/token.util');

// Handler login
exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
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

exports.registerUser = async ({ code, userName, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    code,
    userName,
    email,
    password: hashedPassword,
  });

  return user;
};
