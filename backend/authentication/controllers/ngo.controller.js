const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Register a new NGO recipient
 * @route POST /api/register/ngo
 */
const registerNGO = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, address, registrationNumber } = req.body;
    
    // Verify NGO registration number format
    if (!registrationNumber || !registrationNumber.startsWith('NGO') || registrationNumber.length < 6) {
      return next(new AppError(
        'Invalid NGO registration number. Must start with "NGO" and have at least 6 characters.',
        400,
        'registrationNumber'
      ));
    }
    
    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: 'NGO',
          registration_number: registrationNumber,
          address: address
        }
      }
    });

    if (authError) throw authError;

    // Trigger ensures a profile is created. Let's update it with specific NGO data if needed,
    // though the trigger should handle role/metadata if configured correctly.
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: {
        id: authData.user.id,
        fullName,
        email,
        role: 'NGO',
        registrationNumber
      }
    });
  } catch (error) {
    next(error);
  }
};



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

    const { data: createdRequests, error } = await supabase
      .from('wishlist')
      .upsert(requests.map(r => ({
        user_id: req.user.id,
        category: r.category,
        subcategory: r.subcategory || null,
        condition_min: r.conditionMin,
        quantity: r.quantity,
        is_urgent: r.isUrgent,
        is_bulk: true
      })))
      .select();

    if (error) throw error;

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