const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Report must have a reporter']
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Item', 'User', 'Match', 'Message']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the report'],
    enum: ['spam', 'inappropriate', 'fraud', 'offensive', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
