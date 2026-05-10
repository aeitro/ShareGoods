const { sendOTP, sendEmailVerification } = require('../utils/external-services');
const supabase = require('../utils/supabase');

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.status(200).json({ status: 'success', data: profile });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['full_name', 'address', 'language', 'avatar_url', 'reputation_score'];
    const updates = {};
    
    // Map frontend fields to DB fields if necessary
    const fieldMapping = {
      fullName: 'full_name',
      avatarUrl: 'avatar_url',
      location: 'address'
    };

    Object.keys(req.body).forEach(key => {
      const dbKey = fieldMapping[key] || key;
      if (allowedFields.includes(dbKey)) {
        updates[dbKey] = req.body[key];
      }
    });

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ status: 'success', data: profile });
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
