const mongoose = require('mongoose');

const driveRSVPSchema = new mongoose.Schema({
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
    required: [true, 'RSVP must belong to a drive']
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'RSVP must belong to a donor']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a donor can only RSVP once per drive
driveRSVPSchema.index({ drive: 1, donor: 1 }, { unique: true });

const DriveRSVP = mongoose.model('DriveRSVP', driveRSVPSchema);

module.exports = DriveRSVP;
