const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: function() {
      // Not required for users created via Google Sign-In
      return !this.isGoogleSignIn;
    },
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values (for Google Sign-In users)
  },
  isGoogleSignIn: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  address: {
    type: String,
    required: function() {
      // Not required for users created via Google Sign-In
      return !this.isGoogleSignIn;
    },
    trim: true,
    minlength: [10, 'Address must be at least 10 characters']
  },
  role: {
    type: String,
    enum: ['DONOR', 'INDIVIDUAL', 'NGO', 'ADMIN'],
    required: true
  },
  registrationNumber: {
    type: String,
    trim: true,
    // Only required for NGOs
    required: function() {
      return this.role === 'NGO';
    },
    validate: {
      validator: function(value) {
        // Only validate if role is NGO
        if (this.role !== 'NGO') return true;
        
        // NGO registration number must start with "NGO" and have at least 6 characters
        return value && value.startsWith('NGO') && value.length >= 6;
      },
      message: 'NGO registration number must start with "NGO" and have at least 6 characters'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  avatarUrl: {
    type: String,
    default: '/placeholder-avatar.png'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      trim: true
    }
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'bn', 'ta'],
    default: 'en'
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  reputationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50.0
  },
  handoverCount: {
    type: Number,
    default: 0
  },
  totalMatches: {
    type: Number,
    default: 0
  },
  noShowCount: {
    type: Number,
    default: 0
  },
  karmaScore: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerifiedNGO: {
    type: Boolean,
    default: false
  },
  ngoVerificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ location: '2dsphere' });

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login (will be used in future)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;