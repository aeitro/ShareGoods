const Item = require('../models/item.model');
const AppError = require('../utils/AppError');
const { awardKarma } = require('./karma.controller');

/**
 * Create a new donation item
 * @route POST /api/items
 */
const createItem = async (req, res, next) => {
  try {
    const { name, description, category, subcategory, condition, quantity, handoverPreference, availability, location, donationType, price, images, coordinates } = req.body;
    
    const newItem = await Item.create({
      name,
      description,
      category,
      subcategory,
      condition,
      quantity,
      handoverPreference,
      availability,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0], // Expecting [lng, lat]
        address: location
      },
      donationType,
      price,
      images,
      donor: req.user.id
    });

    // Award karma for creating a listing
    await awardKarma(req.user.id, 'listing_created', 5, newItem._id, 'Listed a new item');
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all items with optional filters
 * @route GET /api/items
 */
const getAllItems = async (req, res, next) => {
  try {
    const { category, condition, status, donationType, search, donor, lat, lng, radius } = req.query;
    
    // Default filter
    let filter = {
      status: status || 'available'
    };
    
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (donationType) filter.donationType = donationType;
    if (donor) filter.donor = donor;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { "location.address": { $regex: search, $options: 'i' } }
      ];
    }

    let items;

    if (lat && lng) {
      // Use aggregation for geospatial sorting and distance calculation
      items = await Item.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: "distance",
            maxDistance: (radius ? parseInt(radius) : 10) * 1000,
            query: filter,
            spherical: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "donor",
            foreignField: "_id",
            as: "donor"
          }
        },
        { $unwind: "$donor" },
        {
          $project: {
            "donor.password": 0,
            "donor.resetPasswordToken": 0,
            "donor.resetPasswordExpires": 0
          }
        }
      ]);
    } else {
      items = await Item.find(filter).populate('donor', 'fullName email avatarUrl reputationScore');
    }
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single item by ID
 * @route GET /api/items/:id
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('donor', 'fullName email');
    
    if (!item) {
      return next(new AppError('Item not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an item
 * @route PATCH /api/items/:id
 */
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return next(new AppError('Item not found', 404));
    }
    
    // Check if user is the donor
    if (item.donor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this item', 403));
    }
    
    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an item
 * @route DELETE /api/items/:id
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return next(new AppError('Item not found', 404));
    }
    
    // Check if user is the donor
    if (item.donor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to delete this item', 403));
    }
    
    await item.deleteOne();
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause an item
 * @route PATCH /api/items/:id/pause
 */
const pauseItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return next(new AppError('Item not found', 404));
    }
    
    if (item.donor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to pause this item', 403));
    }
    
    if (item.status !== 'available') {
      return next(new AppError('Only available items can be paused', 400));
    }
    
    item.status = 'paused';
    await item.save();
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resume a paused item
 * @route PATCH /api/items/:id/resume
 */
const resumeItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return next(new AppError('Item not found', 404));
    }
    
    if (item.donor.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to resume this item', 403));
    }
    
    if (item.status !== 'paused') {
      return next(new AppError('Only paused items can be resumed', 400));
    }
    
    item.status = 'available';
    await item.save();
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  pauseItem,
  resumeItem
};
