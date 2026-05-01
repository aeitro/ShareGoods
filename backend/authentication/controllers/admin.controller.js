const User = require('../models/user.model');
const Item = require('../models/item.model');
const Match = require('../models/match.model');
const Notification = require('../models/notification.model');
const AppError = require('../utils/AppError');

/**
 * Platform-wide stats
 * @route GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'DONOR' });
    const totalRecipients = await User.countDocuments({ role: 'INDIVIDUAL' });
    const totalNGOs = await User.countDocuments({ role: 'NGO' });
    const pendingNGOs = await User.countDocuments({ role: 'NGO', ngoVerificationStatus: 'pending' });
    const totalDonations = await Item.countDocuments({ donationType: 'free' });
    const activeListings = await Item.countDocuments({ status: 'available' });
    const pendingMatches = await Match.countDocuments({ status: 'pending' });
    const successfulMatches = await Match.countDocuments({ status: 'completed' });
    const suspendedUsers = await User.countDocuments({ isActive: false });

    const matchSuccessRate = pendingMatches + successfulMatches > 0
      ? ((successfulMatches / (pendingMatches + successfulMatches)) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers, totalDonors, totalRecipients, totalNGOs, pendingNGOs,
        totalDonations, activeListings,
        pendingMatches, successfulMatches, matchSuccessRate: parseFloat(matchSuccessRate),
        suspendedUsers
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Get all users with optional filters
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Suspend a user
 * @route POST /api/admin/users/:id/suspend
 */
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    await Notification.create({
      recipient: user._id,
      type: 'SYSTEM',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Contact support for assistance.',
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Reinstate a user
 * @route POST /api/admin/users/:id/reinstate
 */
exports.reinstateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Delete a user
 * @route DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Get NGO verification queue
 * @route GET /api/admin/ngo-queue
 */
exports.getNGOQueue = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'NGO', ngoVerificationStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: ngos.length, data: ngos });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Approve NGO
 * @route POST /api/admin/ngo/:id/approve
 */
exports.approveNGO = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ngoVerificationStatus: 'approved', isVerifiedNGO: true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ status: 'error', message: 'NGO not found' });

    await Notification.create({
      recipient: user._id,
      type: 'SYSTEM',
      title: 'NGO Verified ✅',
      message: 'Congratulations! Your NGO has been verified. You now have full access to platform features.',
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Reject NGO
 * @route POST /api/admin/ngo/:id/reject
 */
exports.rejectNGO = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ngoVerificationStatus: 'rejected', isVerifiedNGO: false },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ status: 'error', message: 'NGO not found' });

    await Notification.create({
      recipient: user._id,
      type: 'SYSTEM',
      title: 'NGO Verification Rejected',
      message: `Your NGO verification was rejected. Reason: ${reason || 'No reason provided'}. Please contact support.`,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
const Report = require('../models/report.model');

/**
 * Get all reports
 * @route GET /api/admin/reports
 */
exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'fullName email role')
      .populate('targetId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Update report status (Resolve/Dismiss)
 * @route PATCH /api/admin/reports/:id
 */
exports.resolveReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );

    if (!report) return res.status(404).json({ status: 'error', message: 'Report not found' });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Take down an item (Moderation)
 * @route PATCH /api/admin/items/:id/takedown
 */
exports.toggleItemStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });

    // Toggle status between 'available' and 'suspended'
    item.status = item.status === 'suspended' ? 'available' : 'suspended';
    await item.save();

    await Notification.create({
      recipient: item.donor,
      type: 'SYSTEM',
      title: item.status === 'suspended' ? 'Item Taken Down' : 'Item Reinstated',
      message: `Your item "${item.name}" has been ${item.status === 'suspended' ? 'removed from the platform' : 'reinstated'}.`,
    });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
