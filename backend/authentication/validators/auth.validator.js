const Joi = require('joi');

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  rememberMe: Joi.boolean().default(false)
});

// Google Sign-In validation schema
const googleSignInSchema = Joi.object({
  idToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'ID token is required',
      'any.required': 'ID token is required'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  name: Joi.string().optional(),
  picture: Joi.string().uri().optional()
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    })
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Token is required',
      'any.required': 'Token is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.empty': 'New password is required',
      'any.required': 'New password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
      'any.required': 'Confirm password is required'
    })
});

// Middleware for validating login
const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = {};
    
    error.details.forEach((detail) => {
      const key = detail.path[0];
      errors[key] = detail.message;
    });
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  req.body = value;
  next();
};

// Middleware for validating Google Sign-In
const validateGoogleSignIn = (req, res, next) => {
  const { error, value } = googleSignInSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = {};
    
    error.details.forEach((detail) => {
      const key = detail.path[0];
      errors[key] = detail.message;
    });
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  req.body = value;
  next();
};

// Middleware for validating forgot password
const validateForgotPassword = (req, res, next) => {
  const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = {};
    
    error.details.forEach((detail) => {
      const key = detail.path[0];
      errors[key] = detail.message;
    });
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  req.body = value;
  next();
};

// Middleware for validating reset password
const validateResetPassword = (req, res, next) => {
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = {};
    
    error.details.forEach((detail) => {
      const key = detail.path[0];
      errors[key] = detail.message;
    });
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  req.body = value;
  next();
};

module.exports = {
  validateLogin,
  validateGoogleSignIn,
  validateForgotPassword,
  validateResetPassword
};