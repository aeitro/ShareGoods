/**
 * Custom error class for application errors
 * This allows us to create structured errors with status codes and additional metadata
 */
class AppError extends Error {
  constructor(message, statusCode, field = null, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;