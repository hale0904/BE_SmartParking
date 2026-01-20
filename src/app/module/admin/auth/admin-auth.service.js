const Admin = require('./admin-auth.model');
const { hashPassword, comparePassword } = require('../../../utils/hash.util');

const {
  generateAccessToken,
  generateRefreshToken,
} = require('../../../utils/token.util');

exports.registerAdmin = async ({ code, userName, email, password }) => {
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new Error('Admin already exists');
  }

  const hashedPassword = await hashPassword(password);

  const admin = await Admin.create({
    code,
    userName,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });

  return admin;
};

exports.loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await comparePassword(password, admin.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const payload = {
    id: admin._id,
    role: admin.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  admin.refreshToken = refreshToken;
  await admin.save();

  return {
    admin,
    accessToken,
    refreshToken,
  };
};
