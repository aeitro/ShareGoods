const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true,
    default: null
  },
  conditionMin: {
    type: String,
    enum: ['Good', 'Fair', 'Worn', 'any'],
    default: 'any'
  },
  maxDistanceKm: {
    type: Number,
    default: 25
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  isBulk: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    default: 1
  },
  isUrgent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent duplicate category+subcategory per user
wishlistSchema.index({ user: 1, category: 1, subcategory: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
