const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [3, 'Item name must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  images: [{
    type: String // URLs to images
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Worn', 'Needs Repair'],
    default: 'Fair'
  },
  quantity: {
    type: Number,
    default: 1
  },
  handoverPreference: {
    type: String,
    enum: ['Direct pickup from home', 'Drop-off at NGO', 'Community drive'],
    default: 'Direct pickup from home'
  },
  availability: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'paused', 'matched', 'in-progress', 'completed', 'cancelled'],
    default: 'available'
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    }
  },
  donationType: {
    type: String,
    enum: ['free', 'sell'],
    required: true
  },
  price: {
    type: Number,
    required: function() {
      return this.donationType === 'sell';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

itemSchema.index({ location: '2dsphere' });

itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
