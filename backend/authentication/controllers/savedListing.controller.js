const SavedListing = require('../models/savedListing.model');
const AppError = require('../utils/AppError');

/**
 * Save / bookmark an item
 * POST /api/saved-listings
 */
exports.saveItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    const saved = await SavedListing.create({
      user: req.user.id,
      item: itemId
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Item already saved.', 409));
    }
    next(error);
  }
};

/**
 * Get all saved items for the current user
 * GET /api/saved-listings/my
 */
exports.getMySaved = async (req, res, next) => {
  try {
    const saved = await SavedListing.find({ user: req.user.id })
      .populate({
        path: 'item',
        populate: { path: 'donor', select: 'fullName reputationScore avatarUrl' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a saved item by item ID
 * DELETE /api/saved-listings/:itemId
 */
exports.unsaveItem = async (req, res, next) => {
  try {
    const removed = await SavedListing.findOneAndDelete({
      user: req.user.id,
      item: req.params.itemId
    });

    if (!removed) return next(new AppError('Saved item not found', 404));

    res.status(200).json({ success: true, message: 'Item removed from saved listings' });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a specific item is saved by the current user
 * GET /api/saved-listings/check/:itemId
 */
exports.checkSaved = async (req, res, next) => {
  try {
    const saved = await SavedListing.findOne({
      user: req.user.id,
      item: req.params.itemId
    });

    res.status(200).json({ success: true, isSaved: !!saved });
  } catch (error) {
    next(error);
  }
};
