const AppError = require('../utils/AppError');
const User = require('../models/user.model');
const Item = require('../models/item.model');
const Match = require('../models/match.model');
const Notification = require('../models/notification.model');
const { recalculateScore } = require('../utils/reputation.service');
const { awardKarma } = require('./karma.controller');
/**
 * Request an item (create a match record)
 * @route POST /api/matches/request
 */
const requestItem = async (req, res, next) => {
  try {
    const { itemId, initialMessage } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) {
      return next(new AppError('Item not found', 404));
    }
    
    if (item.status !== 'available') {
      return next(new AppError('Item is no longer available', 400));
    }
    
    // Check if user is trying to request their own item
    if (item.donor.toString() === req.user.id) {
      return next(new AppError('You cannot request your own item', 400));
    }
    
    // Check if a request already exists from this user for this item
    const existingMatch = await Match.findOne({ item: itemId, recipient: req.user.id });
    if (existingMatch) {
      return next(new AppError('You have already requested this item', 400));
    }
    
    const newMatch = await Match.create({
      item: itemId,
      donor: item.donor,
      recipient: req.user.id,
      initialMessage
    });
    
    await Notification.create({
      recipient: item.donor,
      type: 'MATCH_REQUEST',
      title: 'New Item Request',
      message: `Someone requested your item: ${item.name}`,
      referenceId: newMatch._id,
      onModel: 'Match'
    });
    
    await User.findByIdAndUpdate(item.donor, { $inc: { totalMatches: 1 } });
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalMatches: 1 } });

    res.status(201).json({
      success: true,
      data: newMatch
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get matches for the current user
 * @route GET /api/matches
 */
const getMatches = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'DONOR') {
      query.donor = req.user.id;
    } else {
      query.recipient = req.user.id;
    }
    
    const matches = await Match.find(query)
      .populate('item')
      .populate('donor', 'fullName email phone avatarUrl reputationScore')
      .populate('recipient', 'fullName email phone avatarUrl reputationScore');
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single match by ID
 * @route GET /api/matches/:id
 */
const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('item')
      .populate('donor', 'fullName email phone avatarUrl reputationScore')
      .populate('recipient', 'fullName email phone avatarUrl reputationScore');

    if (!match) {
      return next(new AppError('Match not found', 404));
    }

    // Only participants can view the match
    const isDonor = match.donor._id.toString() === req.user.id;
    const isRecipient = match.recipient._id.toString() === req.user.id;
    if (!isDonor && !isRecipient && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorised to view this match', 403));
    }

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

/**
 * Update match status
 * @route PATCH /api/matches/:id
 */
const updateMatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let match = await Match.findById(req.params.id);
    
    if (!match) {
      return next(new AppError('Match record not found', 404));
    }
    
    // Authorization logic
    const isDonor = match.donor.toString() === req.user.id;
    const isRecipient = match.recipient.toString() === req.user.id;
    
    if (!isDonor && !isRecipient && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this match', 403));
    }
    
    // Status transition logic
    if (status === 'confirmed' && !isDonor) {
      return next(new AppError('Only the donor can confirm the match', 403));
    }
    
    if (status === 'completed' && !isRecipient) {
      return next(new AppError('Only the recipient can mark a match as completed', 403));
    }
    
    match.status = status;
    await match.save();
    
    // If status is confirmed, update item status
    if (status === 'confirmed') {
      await Item.findByIdAndUpdate(match.item, { status: 'matched' });
      await Notification.create({
        recipient: match.recipient,
        type: 'MATCH_UPDATE',
        title: 'Request Confirmed',
        message: 'Your request has been confirmed by the donor.',
        referenceId: match._id,
        onModel: 'Match'
      });
    } else if (status === 'completed') {
      await Item.findByIdAndUpdate(match.item, { status: 'completed' });
      // Update reputation for both parties
      await User.findByIdAndUpdate(match.donor, { $inc: { handoverCount: 1 } });
      await User.findByIdAndUpdate(match.recipient, { $inc: { handoverCount: 1 } });
      await recalculateScore(match.donor);
      await recalculateScore(match.recipient);
      
      await Notification.create({
        recipient: match.donor,
        type: 'MATCH_UPDATE',
        title: 'Handover Completed',
        message: 'The item handover was marked as completed.',
        referenceId: match._id,
        onModel: 'Match'
      });
    } else if (status === 'declined' || status === 'cancelled') {
      // Potentially increment noShowCount if it was a late cancellation
      // For now, let's just trigger a recalc
      await recalculateScore(match.donor);
      await recalculateScore(match.recipient);
      
      const notifyTarget = isDonor ? match.recipient : match.donor;
      await Notification.create({
        recipient: notifyTarget,
        type: 'MATCH_UPDATE',
        title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `The item request was ${status}.`,
        referenceId: match._id,
        onModel: 'Match'
      });
    }
    
    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk request items (for NGOs)
 */
const bulkRequest = async (req, res, next) => {
  try {
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Please provide an array of item IDs' });
    }

    const matches = await Promise.all(itemIds.map(async (itemId) => {
      const item = await Item.findById(itemId);
      if (!item || item.status !== 'available') return null;

      const match = await Match.create({
        item: itemId,
        recipient: req.user.id,
        donor: item.donor,
        status: 'pending'
      });
      
      await Notification.create({
        recipient: item.donor,
        type: 'MATCH_REQUEST',
        title: 'New Bulk Request',
        message: `An NGO has requested your item: ${item.name}`,
        referenceId: match._id,
        onModel: 'Match'
      });
      
      return match;
    }));

    const successfulMatches = matches.filter(m => m !== null);

    res.status(201).json({
      status: 'success',
      data: successfulMatches
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Schedule handover (propose time and location)
 * @route PATCH /api/matches/:id/schedule
 */
const scheduleHandover = async (req, res, next) => {
  try {
    const { handoverAt, handoverLocation, handoverMethod } = req.body;
    let match = await Match.findById(req.params.id);
    
    if (!match) {
      return next(new AppError('Match record not found', 404));
    }
    
    const isDonor = match.donor.toString() === req.user.id;
    const isRecipient = match.recipient.toString() === req.user.id;
    
    if (!isDonor && !isRecipient && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this match', 403));
    }
    
    if (handoverAt) match.handoverAt = handoverAt;
    if (handoverLocation) match.handoverLocation = handoverLocation;
    if (handoverMethod) match.handoverMethod = handoverMethod;
    
    match.donorConfirmedHandover = false;
    match.recipientConfirmedHandover = false;
    
    await match.save();
    
    const notifyUser = isDonor ? match.recipient : match.donor;
    await Notification.create({
      recipient: notifyUser,
      type: 'MATCH_UPDATE',
      title: 'Handover Rescheduled',
      message: 'The handover time/location has been updated.',
      referenceId: match._id,
      onModel: 'Match'
    });
    
    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm Handover Completion
 * @route POST /api/matches/:id/confirm-handover
 */
const confirmHandover = async (req, res, next) => {
  try {
    let match = await Match.findById(req.params.id);
    
    if (!match) {
      return next(new AppError('Match record not found', 404));
    }
    
    const isDonor = match.donor.toString() === req.user.id;
    const isRecipient = match.recipient.toString() === req.user.id;
    
    if (!isDonor && !isRecipient) {
      return next(new AppError('You do not have permission to confirm this match', 403));
    }
    
    if (isDonor) {
      match.donorConfirmedHandover = true;
    } else {
      match.recipientConfirmedHandover = true;
    }
    
    await match.save();
    
    if (match.donorConfirmedHandover && match.recipientConfirmedHandover) {
      match.status = 'completed';
      await match.save();
      
      await Item.findByIdAndUpdate(match.item, { status: 'completed' });
      
      await User.findByIdAndUpdate(match.donor, { $inc: { handoverCount: 1 } });
      await User.findByIdAndUpdate(match.recipient, { $inc: { handoverCount: 1 } });
      await recalculateScore(match.donor);
      await recalculateScore(match.recipient);

      // Award karma to donor
      await awardKarma(match.donor, 'handover_confirmed', 20, match._id, 'Completed item handover');
      // Award karma to recipient
      await awardKarma(match.recipient, 'handover_confirmed', 5, match._id, 'Received donation');
      
      await Notification.create([{
        recipient: match.donor,
        type: 'MATCH_UPDATE',
        title: 'Handover Completed',
        message: 'The item handover was marked as completed.',
        referenceId: match._id,
        onModel: 'Match'
      }, {
        recipient: match.recipient,
        type: 'MATCH_UPDATE',
        title: 'Handover Completed',
        message: 'The item handover was marked as completed.',
        referenceId: match._id,
        onModel: 'Match'
      }]);
    }
    
    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle urgency flag on a match (recipient only)
 * @route PATCH /api/matches/:id/urgency
 */
const setUrgency = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return next(new AppError('Match not found', 404));

    if (match.recipient.toString() !== req.user.id) {
      return next(new AppError('Only the recipient can set urgency', 403));
    }

    match.isUrgent = !match.isUrgent;
    await match.save();

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestItem,
  getMatches,
  getMatchById,
  updateMatchStatus,
  bulkRequest,
  scheduleHandover,
  confirmHandover,
  setUrgency
};
