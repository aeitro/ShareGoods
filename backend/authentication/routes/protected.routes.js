const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');

/**
 * Protected route for all authenticated users
 * @route GET /api/protected/profile
 */
router.get('/protected/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this protected route',
    user: req.user
  });
});

/**
 * Admin-only protected route
 * @route GET /api/protected/admin
 */
router.get('/protected/admin', protect, restrictTo('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this admin-only route',
    user: req.user
  });
});

/**
 * Donor-only protected route
 * @route GET /api/protected/donor
 */
router.get('/protected/donor', protect, restrictTo('DONOR'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this donor-only route',
    user: req.user
  });
});

/**
 * NGO-only protected route
 * @route GET /api/protected/ngo
 */
router.get('/protected/ngo', protect, restrictTo('NGO'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this NGO-only route',
    user: req.user
  });
});

/**
 * Individual-only protected route
 * @route GET /api/protected/individual
 */
router.get('/protected/individual', protect, restrictTo('INDIVIDUAL'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have access to this individual-only route',
    user: req.user
  });
});

module.exports = router;