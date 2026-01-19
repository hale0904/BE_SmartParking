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
      type: String,
      // required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Users', UserSchema);
