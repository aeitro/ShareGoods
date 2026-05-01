const express = require('express');
const { submitFeedback, getUserFeedback } = require('../controllers/feedback.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/feedback', protect, submitFeedback);
router.get('/users/:id/feedback', protect, getUserFeedback);

module.exports = router;
