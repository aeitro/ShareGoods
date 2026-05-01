const Feedback = require('../models/feedback.model');
const Match = require('../models/match.model');

// @desc    Submit feedback for a completed match
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { matchId, rating, note } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ status: 'error', message: 'Match not found' });
    }

    if (match.status !== 'completed') {
      return res.status(400).json({ status: 'error', message: 'Feedback can only be given for completed matches' });
    }

    // Determine the reviewee based on the reviewer
    let revieweeId;
    if (match.donor.toString() === req.user.id) {
      revieweeId = match.recipient;
    } else if (match.recipient.toString() === req.user.id) {
      revieweeId = match.donor;
    } else {
      return res.status(403).json({ status: 'error', message: 'You are not part of this match' });
    }

    const feedback = await Feedback.create({
      match: matchId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating,
      note
    });

    res.status(201).json({
      status: 'success',
      data: feedback
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'You have already reviewed this match' });
    }
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// @desc    Get feedback for a user
// @route   GET /api/users/:id/feedback
// @access  Private
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ reviewee: req.params.id })
      .populate('reviewer', 'fullName avatarUrl')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
