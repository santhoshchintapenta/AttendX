const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { token, user } = await authService.login(email, password);

    res.status(200).json({ success: true, message: 'Login successful', data: { token, user } });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message || 'Authentication failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'User details fetched successfully', data: { user: req.user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    
    await authService.forgotPassword(email);
    res.status(200).json({ success: true, message: 'If an account exists, a verification code was sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const resetToken = await authService.verifyResetOTP(email, otp);
    res.status(200).json({ success: true, message: 'OTP verified', data: { resetToken } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Invalid OTP' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    await authService.resetPassword(resetToken, newPassword);
    res.status(200).json({ success: true, message: 'Password has been successfully reset' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};
