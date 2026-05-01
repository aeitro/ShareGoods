const Drive = require('../models/drive.model');
const DriveRSVP = require('../models/driveRSVP.model');
const AppError = require('../utils/AppError');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

/**
 * Create a new collection drive (NGO only)
 */
exports.createDrive = async (req, res, next) => {
  try {
    const { title, description, date, address, pincode, capacity, longitude, latitude } = req.body;

    const drive = await Drive.create({
      ngo: req.user.id,
      title,
      description,
      date,
      address,
      pincode,
      capacity,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    // Notify donors in the same pincode/city
    const nearbyDonors = await User.find({
      role: 'DONOR',
      pincode: pincode
    });

    const notifications = nearbyDonors.map(donor => ({
      recipient: donor._id,
      type: 'DRIVE_ALERT',
      title: 'New Donation Drive Nearby!',
      message: `${req.user.fullName} is organizing a drive: ${title}`,
      referenceId: drive._id,
      onModel: 'Drive'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
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
    const drives = await Drive.find()
      .populate('ngo', 'fullName avatarUrl reputationScore')
      .sort({ date: 1 });

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
    const drive = await Drive.findById(driveId);

    if (!drive) return next(new AppError('Drive not found', 404));
    if (drive.status !== 'upcoming') return next(new AppError('Drive is no longer open for RSVP', 400));

    // Check capacity
    const currentRSVPs = await DriveRSVP.countDocuments({ drive: driveId });
    if (currentRSVPs >= drive.capacity) {
      return next(new AppError('Drive is at full capacity', 400));
    }

    const rsvp = await DriveRSVP.create({
      drive: driveId,
      donor: req.user.id
    });

    res.status(201).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You have already RSVPed to this drive', 400));
    }
    next(error);
  }
};

/**
 * Get RSVPs for a specific drive (NGO only)
 */
exports.getDriveRSVPs = async (req, res, next) => {
  try {
    const driveId = req.params.id;
    const drive = await Drive.findById(driveId);

    if (!drive) return next(new AppError('Drive not found', 404));
    if (drive.ngo.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorized', 403));
    }

    const rsvps = await DriveRSVP.find({ drive: driveId })
      .populate('donor', 'fullName email phone avatarUrl');

    res.status(200).json({
      success: true,
      count: rsvps.length,
      data: rsvps
    });
  } catch (error) {
    next(error);
  }
};
