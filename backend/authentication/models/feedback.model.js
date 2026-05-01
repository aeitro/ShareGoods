const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  note: {
    type: String,
    maxLength: 500,
    trim: true
  }
}, { timestamps: true });

// Ensure one feedback per reviewer per match
feedbackSchema.index({ match: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
