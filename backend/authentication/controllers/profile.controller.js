const User = require('../models/user.model');
const { sendOTP, sendEmailVerification } = require('../utils/external-services');

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['fullName', 'location', 'language', 'avatarUrl'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Trigger phone verification (OTP)
 */
exports.requestPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new Error('Phone number is required');
    
    await sendOTP(phone);
    res.status(200).json({ status: 'success', message: 'OTP sent to your phone' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Trigger email verification
 */
exports.requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email is required');
    
    await sendEmailVerification(email, 'https://sharegoods.com/verify-email?token=placeholder');
    res.status(200).json({ status: 'success', message: 'Verification link sent to your email' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
