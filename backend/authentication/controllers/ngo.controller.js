const User = require('../models/user.model');
const AppError = require('../utils/AppError');

/**
 * Register a new NGO recipient
 * @route POST /api/register/ngo
 */
const registerNGO = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, address, registrationNumber } = req.body;
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(new AppError('Email already exists. Please use a different email address.', 400, 'email'));
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return next(new AppError('Phone number already exists. Please use a different phone number.', 400, 'phone'));
    }
    
    // Verify NGO registration number format
    if (!registrationNumber || !registrationNumber.startsWith('NGO') || registrationNumber.length < 6) {
      return next(new AppError(
        'Invalid NGO registration number. Must start with "NGO" and have at least 6 characters.',
        400,
        'registrationNumber',
        'NGO_VERIFICATION_FAILED'
      ));
    }
    
    // Check if registration number already exists
    const existingRegNumber = await User.findOne({ registrationNumber });
    if (existingRegNumber) {
      return next(new AppError('Registration number already exists. Please check and try again.', 400, 'registrationNumber'));
    }
    
    // Create new NGO user
    const newUser = await User.create({
      fullName,
      email,
      phone,
      password,
      address,
      registrationNumber,
      role: 'NGO'
    });
    
    // Remove password from response
    newUser.password = undefined;
    
    // Send success response
    res.status(201).json({
      success: true,
      message: 'Registration successful. Redirect to login.',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        registrationNumber: newUser.registrationNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

const Wishlist = require('../models/wishlist.model');

/**
 * Submit bulk requests (NGO only)
 * @route POST /api/ngo/requests/bulk
 */
const createBulkRequest = async (req, res, next) => {
  try {
    const requests = req.body; // Array of {category, subcategory, conditionMin, quantity, isUrgent}

    if (!Array.isArray(requests)) {
      return next(new AppError('Requests must be an array', 400));
    }

    const createdRequests = await Promise.all(requests.map(async (reqData) => {
      // Create or update wishlist entry for this category
      return await Wishlist.findOneAndUpdate(
        { user: req.user.id, category: reqData.category, subcategory: reqData.subcategory || null },
        { 
          ...reqData, 
          isBulk: true, 
          user: req.user.id 
        },
        { upsert: true, new: true }
      );
    }));

    res.status(201).json({
      success: true,
      message: `${createdRequests.length} bulk requests created/updated.`,
      data: createdRequests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerNGO,
  createBulkRequest
};