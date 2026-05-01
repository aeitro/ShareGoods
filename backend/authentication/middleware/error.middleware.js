/**
 * Centralized error handling middleware
 * This middleware will catch and format all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error status and message
  let statusCode = 500;
  let message = 'Server error';
  let errors = null;
  let field = null;
  let code = null;
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    
    // Format mongoose validation errors
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  }
  
  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
    
    // Extract the duplicate field name from the error message
    const fieldName = Object.keys(err.keyPattern)[0];
    field = fieldName;
    
    // Customize message based on the duplicate field
    if (fieldName === 'email') {
      message = 'Email already exists. Please use a different email address.';
    } else if (fieldName === 'phone') {
      message = 'Phone number already exists. Please use a different phone number.';
    } else if (fieldName === 'registrationNumber') {
      message = 'Registration number already exists. Please check and try again.';
    }
  }
  
  // Handle custom application errors
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    field = err.field;
    code = err.code;
  }
  
  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(field && { field }),
    ...(code && { code })
  });
};

module.exports = errorHandler;