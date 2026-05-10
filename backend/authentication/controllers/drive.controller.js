const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Create a new collection drive (NGO only)
 */
exports.createDrive = async (req, res, next) => {
  try {
    const { title, description, date, address, pincode, capacity, longitude, latitude } = req.body;

    const { data: drive, error: driveError } = await supabase
      .from('drives')
      .insert({
        ngo_id: req.user.id,
        title,
        description,
        date,
        address,
        pincode,
        capacity,
        location: `POINT(${longitude} ${latitude})`
      })
      .select()
      .single();

    if (driveError) throw driveError;

    // Notify donors in the same pincode/city
    const { data: nearbyDonors } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'DONOR')
      .eq('pincode', pincode);

    if (nearbyDonors && nearbyDonors.length > 0) {
      const notifications = nearbyDonors.map(donor => ({
        recipient_id: donor.id,
        type: 'DRIVE_ALERT',
        title: 'New Donation Drive Nearby!',
        message: `${req.user.full_name} is organizing a drive: ${title}`,
        reference_id: drive.id
      }));

      await supabase.from('notifications').insert(notifications);
    }

    res.status(201).json({
      success: true,
      data: drive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all drives
 */
exports.getAllDrives = async (req, res, next) => {
  try {
    const { data: drives, error } = await supabase
      .from('drives')
      .select(`
        *,
        ngo:profiles!ngo_id (*)
      `)
      .order('date', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RSVP to a drive (Donor only)
 */
exports.rsvpToDrive = async (req, res, next) => {
  try {
    const driveId = req.params.id;
    
    // Get drive details
    const { data: drive, error: driveError } = await supabase
      .from('drives')
      .select('*, rsvps:drive_rsvps(count)')
      .eq('id', driveId)
      .single();

    if (driveError || !drive) return next(new AppError('Drive not found', 404));
    if (drive.status !== 'upcoming') return next(new AppError('Drive is no longer open for RSVP', 400));

    // Check capacity (Supabase count might be nested depending on join structure)
    const currentCount = drive.rsvps?.[0]?.count || 0;
    if (drive.capacity > 0 && currentCount >= drive.capacity) {
      return next(new AppError('Drive is at full capacity', 400));
    }

    const { data: rsvp, error: rsvpError } = await supabase
      .from('drive_rsvps')
      .insert({
        drive_id: driveId,
        donor_id: req.user.id
      })
      .select()
      .single();

    if (rsvpError) {
      if (rsvpError.code === '23505') {
        return next(new AppError('You have already RSVPed to this drive', 400));
      }
      throw rsvpError;
    }

    res.status(201).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get RSVPs for a specific drive (NGO only)
 */
exports.getDriveRSVPs = async (req, res, next) => {
  try {
    const driveId = req.params.id;
    
    const { data: drive, error: driveError } = await supabase
      .from('drives')
      .select('*')
      .eq('id', driveId)
      .single();

    if (driveError || !drive) return next(new AppError('Drive not found', 404));
    
    if (drive.ngo_id !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized', 403));
    }

    const { data: rsvps, error: rsvpsError } = await supabase
      .from('drive_rsvps')
      .select(`
        *,
        donor:profiles!donor_id (id, full_name, email, phone, avatar_url)
      `)
      .eq('drive_id', driveId);

    if (rsvpsError) throw rsvpsError;

    res.status(200).json({
      success: true,
      count: rsvps.length,
      data: rsvps
    });
  } catch (error) {
    next(error);
  }
};
