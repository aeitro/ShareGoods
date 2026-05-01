const Wishlist = require('../models/wishlist.model');
const AppError = require('../utils/AppError');

/**
 * Create a wishlist entry
 * POST /api/wishlist
 */
exports.createEntry = async (req, res, next) => {
  try {
    const { category, subcategory, conditionMin, maxDistanceKm, alertEnabled, note } = req.body;

    const entry = await Wishlist.create({
      user: req.user.id,
      category,
      subcategory: subcategory || null,
      conditionMin: conditionMin || 'any',
      maxDistanceKm: maxDistanceKm || 25,
      alertEnabled: alertEnabled !== false,
      note: note || ''
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You already have a wishlist entry for this category.', 409));
    }
    next(error);
  }
};

/**
 * Get my wishlist
 * GET /api/wishlist/my
 */
exports.getMyWishlist = async (req, res, next) => {
  try {
    const entries = await Wishlist.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a wishlist entry
 * DELETE /api/wishlist/:id
 */
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) return next(new AppError('Wishlist entry not found', 404));

    res.status(200).json({ success: true, message: 'Entry removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle alert for a wishlist entry
 * PATCH /api/wishlist/:id/alert
 */
exports.toggleAlert = async (req, res, next) => {
  try {
    const entry = await Wishlist.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return next(new AppError('Wishlist entry not found', 404));

    entry.alertEnabled = !entry.alertEnabled;
    await entry.save();

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};
