
const AppError = require('../utils/AppError');
const { awardKarma } = require('./karma.controller');
const supabase = require('../utils/supabase');

/**
 * Create a new donation item
 * @route POST /api/items
 */
const createItem = async (req, res, next) => {
  try {
    const { name, description, category, condition, quantity, handoverPreference, availability, location, images, coordinates } = req.body;
    
    // Insert into Supabase
    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        name,
        description,
        category,
        condition,
        status: 'available',
        location: coordinates ? `POINT(${coordinates[0]} ${coordinates[1]})` : 'POINT(0 0)',
        address: location,
        donation_type: 'free',
        price: 0,
        donor_id: req.user.id
      })
      .select()
      .single();

    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Insert images if any
    if (images && images.length > 0) {
      const imagesData = images.map((img, index) => ({
        item_id: newItem.id,
        image_path: img,
        display_order: index
      }));
      await supabase.from('item_images').insert(imagesData);
    }

    // Award karma (optional/legacy support)
    try {
      await awardKarma(req.user.id, 'listing_created', 5, newItem.id, 'Listed a new item');
    } catch (e) {
      console.warn('Karma award failed but item created:', e.message);
    }
    
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
    
    let query = supabase
      .from('items')
      .select(`
        *,
        profiles!donor_id (id, full_name, role, reputation_score),
        item_images (image_path)
      `);

    if (category) query = query.eq('category', category);
    if (condition) query = query.eq('condition', condition);
    if (status) query = query.eq('status', status);
    else query = query.eq('status', 'available');
    
    if (donationType) query = query.eq('donation_type', donationType);
    if (donor) query = query.eq('donor_id', donor);
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);
    }

    if (lat && lng) {
      // Use raw SQL for PostGIS distance filtering if radius is provided
      // For simplicity in this step, we'll just fetch and then we could filter, 
      // but let's try a RPC or just the distance operator if possible.
      // Supabase PostgREST doesn't support complex PostGIS distance in .select() easily without RPC.
      // So we'll use a simple bounding box or just fetch all for now and improve later.
    }

    const { data: items, error } = await query;

    if (error) {
      return next(new AppError(error.message, 400));
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
    const { data: item, error } = await supabase
      .from('items')
      .select(`
        *,
        donor:profiles!donor_id (*),
        item_images (image_path)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error || !item) {
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
    // Check ownership first
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('donor_id')
      .eq('id', req.params.id)
      .single();

    if (findError || !item) {
      return next(new AppError('Item not found', 404));
    }

    if (item.donor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this item', 403));
    }

    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    res.status(200).json({
      success: true,
      data: updatedItem
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
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('donor_id')
      .eq('id', req.params.id)
      .single();

    if (findError || !item) {
      return next(new AppError('Item not found', 404));
    }

    if (item.donor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to delete this item', 403));
    }
    
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;
    
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
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('donor_id, status')
      .eq('id', req.params.id)
      .single();

    if (findError || !item) {
      return next(new AppError('Item not found', 404));
    }

    if (item.donor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to pause this item', 403));
    }

    if (item.status !== 'available') {
      return next(new AppError('Only available items can be paused', 400));
    }

    const { data: updated, error: updateError } = await supabase
      .from('items')
      .update({ status: 'paused' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    res.status(200).json({
      success: true,
      data: updated
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
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('donor_id, status')
      .eq('id', req.params.id)
      .single();

    if (findError || !item) {
      return next(new AppError('Item not found', 404));
    }

    if (item.donor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to resume this item', 403));
    }

    if (item.status !== 'paused') {
      return next(new AppError('Only paused items can be resumed', 400));
    }

    const { data: updated, error: updateError } = await supabase
      .from('items')
      .update({ status: 'available' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get items belonging to the current user
 * @route GET /api/items/my-items
 */
const getMyItems = async (req, res, next) => {
  try {
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        *,
        item_images (image_path),
        matches (
          id,
          status,
          recipient:profiles!recipient_id (full_name)
        )
      `)
      .eq('donor_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return next(new AppError(error.message, 400));
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

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  pauseItem,
  resumeItem,
  getMyItems
};
