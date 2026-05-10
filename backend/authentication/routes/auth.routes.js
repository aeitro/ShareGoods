const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  validateLogin,
  validateGoogleSignIn,
  validateForgotPassword,
  validateResetPassword
} = require('../validators/auth.validator');

// Registration route (Consolidated)
router.post('/register/:role', authController.register);

// Login route
router.post('/login', validateLogin, authController.login);

// Google Sign-In route
router.post('/google', validateGoogleSignIn, authController.googleSignIn);

// Forgot password route
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// Reset password route
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;