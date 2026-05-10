const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Create a wishlist entry
 * POST /api/wishlist
 */
exports.createEntry = async (req, res, next) => {
  try {
    const { category, subcategory, conditionMin, maxDistanceKm, alertEnabled, note } = req.body;

    const { data: entry, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: req.user.id,
        category,
        subcategory: subcategory || null,
        condition_min: conditionMin || 'any',
        max_distance_km: maxDistanceKm || 25,
        alert_enabled: alertEnabled !== false,
        note: note || ''
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation in Postgres
        return next(new AppError('You already have a wishlist entry for this category.', 409));
      }
      throw error;
    }

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my wishlist
 * GET /api/wishlist/my
 */
exports.getMyWishlist = async (req, res, next) => {
  try {
    const { data: entries, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
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
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

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
    const { data: entry, error: findError } = await supabase
      .from('wishlist')
      .select('alert_enabled')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !entry) return next(new AppError('Wishlist entry not found', 404));

    const { data: updated, error: updateError } = await supabase
      .from('wishlist')
      .update({ alert_enabled: !entry.alert_enabled })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
