const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwt');
const { verifyIdToken } = require('../utils/firebase');
const { sendPasswordResetEmail } = require('../utils/email');
const AppError = require('../utils/AppError');

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

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(new AppError('Email already exists.', 400, 'email'));
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return next(new AppError('Phone number already exists.', 400, 'phone'));
    }

    const userData = {
      fullName,
      email,
      phone,
      password,
      address,
      role: normalizedRole
    };

    // NGO Specific Validation
    if (normalizedRole === 'NGO') {
      if (!registrationNumber || !registrationNumber.startsWith('NGO') || registrationNumber.length < 6) {
        return next(new AppError('Invalid NGO registration number.', 400, 'registrationNumber'));
      }
      const existingRegNumber = await User.findOne({ registrationNumber });
      if (existingRegNumber) {
        return next(new AppError('Registration number already exists.', 400, 'registrationNumber'));
      }
      userData.registrationNumber = registrationNumber;
    }

    // Create new user
    const newUser = await User.create(userData);
    
    newUser.password = undefined;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        ...(newUser.registrationNumber && { registrationNumber: newUser.registrationNumber })
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
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(
      { id: user._id, email: user.email, role: user.role },
      rememberMe
    );

    // Return success response
    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      message: 'Login successful'
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

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid ID token'
      });
    }

    // Extract user information from decoded token
    const { email, name, picture } = decodedToken;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided in the token'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one
    if (!user) {
      user = new User({
        fullName: name || email.split('@')[0],
        email,
        profilePicture: picture,
        role: 'DONOR', // Default role for Google Sign-In users
        password: crypto.randomBytes(20).toString('hex'), // Random password
        isEmailVerified: true, // Google accounts have verified emails
        isGoogleSignIn: true // Mark as Google Sign-In user
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(
      { id: user._id, email: user.email, role: user.role },
      true // rememberMe set to true for Google Sign-In
    );

    // Return success response
    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      message: 'Google login successful'
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during Google Sign-In'
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

    // Find user by email
    const user = await User.findOne({ email });

    // Generate reset token (even if user doesn't exist to prevent email enumeration)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // If user exists, save reset token
    if (user) {
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success to prevent email enumeration
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
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    // Check if token is valid
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Return success response
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