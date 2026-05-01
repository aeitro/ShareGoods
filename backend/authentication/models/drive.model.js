const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Drive must belong to an NGO']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the drive'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the drive']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date for the drive']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address for the drop-off']
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number] // [longitude, latitude]
  },
  pincode: {
    type: String,
    required: [true, 'Please provide a pincode']
  },
  capacity: {
    type: Number,
    default: 100 // Maximum number of RSVPs
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
driveSchema.index({ location: '2dsphere' });

const Drive = mongoose.model('Drive', driveSchema);

module.exports = Drive;
