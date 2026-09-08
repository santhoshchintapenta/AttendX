const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const PasswordResetOTP = require('../models/PasswordResetOTP');

class AuthService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact your HOD.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    return { token, user };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return true;
    }

    // Rate limiting: Only 1 active OTP per email at a time
    await PasswordResetOTP.deleteMany({ email });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordResetOTP.create({
      email,
      otpHash,
      expiresAt,
    });

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || '"AttendX Support" <noreply@attendx.edu>',
          to: email,
          subject: 'AttendX - Password Reset Verification Code',
          text: `Your password reset verification code is: ${otp}. This code is valid for 10 minutes.`,
          html: `<p>Your password reset verification code is: <strong>${otp}</strong></p><p>This code is valid for 10 minutes.</p>`,
        });
      } catch (error) {
        console.error('Failed to send OTP email:', error);
      }
    } else {
      console.log(`\n\n[DEV] SMTP NOT CONFIGURED. OTP for ${email} is: ${otp}\n\n`);
    }

    return true;
  }

  async verifyResetOTP(email, otp) {
    const record = await PasswordResetOTP.findOne({ email });
    if (!record) {
      throw new Error('Invalid or expired OTP');
    }

    if (record.expiresAt < new Date()) {
      await PasswordResetOTP.deleteOne({ _id: record._id });
      throw new Error('OTP has expired');
    }

    if (record.attempts >= 5) {
      await PasswordResetOTP.deleteOne({ _id: record._id });
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(otp.toString(), record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      throw new Error('Invalid OTP');
    }

    // OTP matched. Generate a short-lived reset token (15 mins)
    await PasswordResetOTP.deleteOne({ _id: record._id });
    
    const resetToken = jwt.sign(
      { email, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return resetToken;
  }

  async resetPassword(resetToken, newPassword) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (err) {
      throw new Error('Invalid or expired reset token');
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    await user.save(); // pre-save hook handles hashing

    return true;
  }
}

module.exports = new AuthService();
