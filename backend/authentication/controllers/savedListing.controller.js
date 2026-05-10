const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Save / bookmark an item
 * POST /api/saved-listings
 */
exports.saveItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    const { data: saved, error } = await supabase
      .from('saved_listings')
      .insert({
        user_id: req.user.id,
        item_id: itemId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return next(new AppError('Item already saved.', 409));
      }
      throw error;
    }

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved items for the current user
 * GET /api/saved-listings/my
 */
exports.getMySaved = async (req, res, next) => {
  try {
    const { data: saved, error } = await supabase
      .from('saved_listings')
      .select(`
        *,
        item:items (
          *,
          donor:profiles!donor_id (*)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

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
    const { error } = await supabase
      .from('saved_listings')
      .delete()
      .match({
        user_id: req.user.id,
        item_id: req.params.itemId
      });

    if (error) throw error;

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
    const { data: saved, error } = await supabase
      .from('saved_listings')
      .select('id')
      .match({
        user_id: req.user.id,
        item_id: req.params.itemId
      })
      .maybeSingle();

    if (error) throw error;

    res.status(200).json({ success: true, isSaved: !!saved });
  } catch (error) {
    next(error);
  }
};
