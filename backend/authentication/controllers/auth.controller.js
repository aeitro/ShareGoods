const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Register a new user (Generic)
 * @route POST /api/register/:role
 */
exports.register = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { fullName, email, phone, password, address, registrationNumber } = req.body;
    
    // Validate role
    const validRoles = ['DONOR', 'INDIVIDUAL', 'NGO'];
    const normalizedRole = role.toUpperCase();
    if (!validRoles.includes(normalizedRole)) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: normalizedRole,
          phone: phone,
          address: address,
          registration_number: registrationNumber
        }
      }
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Note: The SQL trigger 'on_auth_user_created' will handle inserting into the 'profiles' table.

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      user: {
        id: data.user.id,
        fullName: fullName,
        email: email,
        role: normalizedRole
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login controller
 * @route POST /api/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    // Get user profile/role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // Generate our own JWT for backward compatibility if needed, 
    // or just return the Supabase session
    const token = data.session.access_token;

    return res.status(200).json({
      success: true,
      token,
      role: profile?.role || 'INDIVIDUAL',
      message: 'Login successful',
      user: data.user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

/**
 * Google Sign-In controller
 * @route POST /api/auth/google
 */
exports.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // In Supabase, client handles the OAuth flow (typically on frontend)
    // and we receive the session. If this is a server-side verification:
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken
    });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: data.user,
      message: 'Google login successful'
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during Google Sign-In'
    });
  }
};

/**
 * Forgot password controller
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
};

/**
 * Reset password controller
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // In Supabase, the user should be logged in via the recovery link token
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password'
    });
  }
};