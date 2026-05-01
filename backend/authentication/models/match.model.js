const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  initialMessage: {
    type: String,
    trim: true
  },
  matchDate: {
    type: Date,
    default: Date.now
  },
  handoverAt: {
    type: Date,
    default: null
  },
  handoverLocation: {
    type: String,
    trim: true,
    default: null
  },
  handoverMethod: {
    type: String,
    enum: ['pickup', 'dropoff', 'meetup'],
    default: 'pickup'
  },
  donorConfirmedHandover: {
    type: Boolean,
    default: false
  },
  recipientConfirmedHandover: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
