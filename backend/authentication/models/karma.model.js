const mongoose = require('mongoose');

const karmaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'listing_created',      // +5
      'handover_confirmed',   // +20
      'fast_response',        // +10  (accepted within 2h)
      'festival_drive',       // +15
      'first_donation',       // +25 (one-time)
      'five_donations',       // +50 (one-time)
      'ten_donations',        // +100 (one-time)
    ],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('KarmaEvent', karmaSchema);
