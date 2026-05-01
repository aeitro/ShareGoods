const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const Notification = require('../models/notification.model');

const router = express.Router();

router.use(protect);

/**
 * Get my notifications
 */
router.get('/my', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { readAt: Date.now() },
      { new: true }
    );
    res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * Mark all as read
 */
router.post('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, readAt: null },
      { readAt: Date.now() }
    );
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
