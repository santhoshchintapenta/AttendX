const mongoose = require('mongoose');

const passwordResetOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' }, // Auto-delete document after 10m
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PasswordResetOTP', passwordResetOTPSchema);
