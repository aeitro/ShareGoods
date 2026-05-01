const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Generate JWT token
 * @param {Object} payload - Data to be encoded in the token
 * @param {boolean} rememberMe - Whether to extend token expiration
 * @returns {string} - JWT token
 */
const generateToken = (payload, rememberMe = false) => {
  // Set expiration based on rememberMe flag
  const expiresIn = rememberMe ? '30d' : '1d';
  
  // Generate token
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};