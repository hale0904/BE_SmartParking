const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    socialProvider: {
      type: String,
      enum: ['google', 'facebook', 'twitter', 'linkedin', 'github', 'apple'],
    },
    role: {
      type: String,
      default: 'user',
    },
    status: {
      type: Number,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
