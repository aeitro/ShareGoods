const AppError = require('../utils/AppError');
const { recalculateScore } = require('../utils/reputation.service');
const { awardKarma } = require('./karma.controller');
const supabase = require('../utils/supabase');
const { emailService } = require('../services');
/**
 * Request an item (create a match record)
 * @route POST /api/matches/request
 */
const requestItem = async (req, res, next) => {
  try {
    const { itemId, initialMessage } = req.body;
    
    // Check item in Supabase
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return next(new AppError('Item not found', 404));
    }
    
    if (item.status !== 'available') {
      return next(new AppError('Item is no longer available', 400));
    }
    
    // Check if user is trying to request their own item
    if (item.donor_id === req.user.id) {
      return next(new AppError('You cannot request your own item', 400));
    }
    
    // Check if a request already exists
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('item_id', itemId)
      .eq('recipient_id', req.user.id)
      .maybeSingle();

    if (existingMatch) {
      return next(new AppError('You have already requested this item', 400));
    }
    
    const { data: newMatch, error: matchError } = await supabase
      .from('matches')
      .insert({
        item_id: itemId,
        donor_id: item.donor_id,
        recipient_id: req.user.id,
        initial_message: initialMessage,
        status: 'pending'
      })
      .select()
      .single();

    if (matchError) throw matchError;
    
    // Create notification in Supabase
    await supabase.from('notifications').insert({
      user_id: item.donor_id,
      type: 'MATCH_REQUEST',
      title: 'New Item Request',
      message: `Someone requested your item: ${item.name}`,
      reference_id: newMatch.id
    });

    // Send Email Notification to Donor
    const { data: donor } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', item.donor_id)
      .single();

    if (donor && donor.email) {
      await emailService.sendMatchRequestEmail(donor.email, {
        donorName: donor.full_name,
        recipientName: req.user.full_name || 'A neighbor',
        itemName: item.name
      });
    }
    
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
    let query = supabase
      .from('matches')
      .select(`
        *,
        item:items (*),
        donor:profiles!donor_id (*),
        recipient:profiles!recipient_id (*)
      `);

    if (req.user.role === 'DONOR') {
      query = query.eq('donor_id', req.user.id);
    } else {
      query = query.eq('recipient_id', req.user.id);
    }
    
    const { data: matches, error } = await query;

    if (error) throw error;
    
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
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        item:items (*),
        donor:profiles!donor_id (id, full_name, email, phone, avatar_url, reputation_score),
        recipient:profiles!recipient_id (id, full_name, email, phone, avatar_url, reputation_score)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !match) {
      return next(new AppError('Match not found', 404));
    }

    // Only participants can view the match
    const isDonor = match.donor_id === req.user.id;
    const isRecipient = match.recipient_id === req.user.id;
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
    const { data: match, error: findError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (findError || !match) {
      return next(new AppError('Match record not found', 404));
    }
    
    // Authorization logic
    const isDonor = match.donor_id === req.user.id;
    const isRecipient = match.recipient_id === req.user.id;
    
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
    
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    // If status is confirmed, update item status
    if (status === 'confirmed') {
      await supabase.from('items').update({ status: 'matched' }).eq('id', match.item_id);
      await supabase.from('notifications').insert({
        user_id: match.recipient_id,
        type: 'MATCH_UPDATE',
        title: 'Request Confirmed',
        message: 'Your request has been confirmed by the donor.',
        reference_id: match.id
      });

      // Send Email Notification to Recipient
      const { data: recipient } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', match.recipient_id)
        .single();

      if (recipient && recipient.email) {
        await emailService.sendMatchConfirmedEmail(recipient.email, {
          recipientName: recipient.full_name,
          donorName: req.user.full_name || 'The donor',
          itemName: match.item?.name || 'an item'
        });
      }
    } else if (status === 'completed') {
      await supabase.from('items').update({ status: 'completed' }).eq('id', match.item_id);
      // Update reputation for both parties
      await supabase.rpc('increment_handover_count', { user_id: match.donor_id });
      await supabase.rpc('increment_handover_count', { user_id: match.recipient_id });
      
      await recalculateScore(match.donor_id);
      await recalculateScore(match.recipient_id);
      
      await supabase.from('notifications').insert({
        recipient_id: match.donor_id,
        type: 'MATCH_UPDATE',
        title: 'Handover Completed',
        message: 'The item handover was marked as completed.',
        reference_id: match.id
      });
    } else if (status === 'declined' || status === 'cancelled') {
      await recalculateScore(match.donor_id);
      await recalculateScore(match.recipient_id);
      
      const notifyTarget = isDonor ? match.recipient_id : match.donor_id;
      await supabase.from('notifications').insert({
        recipient_id: notifyTarget,
        type: 'MATCH_UPDATE',
        title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `The item request was ${status}.`,
        reference_id: match.id
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedMatch
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

    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, donor_id, name')
      .in('id', itemIds)
      .eq('status', 'available');

    if (fetchError) throw fetchError;

    const matchesToInsert = items.map(item => ({
      item_id: item.id,
      recipient_id: req.user.id,
      donor_id: item.donor_id,
      status: 'pending'
    }));

    const { data: successfulMatches, error: insertError } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select();

    if (insertError) throw insertError;

    // Notifications
    for (const match of successfulMatches) {
      const item = items.find(i => i.id === match.item_id);
      await supabase.from('notifications').insert({
        recipient_id: match.donor_id,
        type: 'MATCH_REQUEST',
        title: 'New Bulk Request',
        message: `An NGO has requested your item: ${item.name}`,
        reference_id: match.id
      });
    }

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
    const { data: match, error: findError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (findError || !match) {
      return next(new AppError('Match record not found', 404));
    }
    
    const isDonor = match.donor_id === req.user.id;
    const isRecipient = match.recipient_id === req.user.id;
    
    if (!isDonor && !isRecipient && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this match', 403));
    }
    
    const updates = {
      donor_confirmed_handover: false,
      recipient_confirmed_handover: false
    };
    if (handoverAt) updates.handover_at = handoverAt;
    if (handoverLocation) updates.handover_location = handoverLocation;
    if (handoverMethod) updates.handover_method = handoverMethod;
    
    const { data: updated, error: updateError } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    const notifyUser = isDonor ? match.recipient_id : match.donor_id;
    await supabase.from('notifications').insert({
      user_id: notifyUser,
      type: 'MATCH_UPDATE',
      title: 'Handover Rescheduled',
      message: 'The handover time/location has been updated.',
      reference_id: match.id
    });

    // Send Email Notification
    const { data: notifiedUser } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', notifyUser)
      .single();

    if (notifiedUser && notifiedUser.email) {
      await emailService.sendHandoverScheduledEmail(notifiedUser.email, {
        userName: notifiedUser.full_name,
        itemName: match.item?.name || 'your item',
        time: updates.handover_at,
        location: updates.handover_location
      });
    }
    
    res.status(200).json({
      success: true,
      data: updated
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
    const { data: match, error: findError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (findError || !match) {
      return next(new AppError('Match record not found', 404));
    }
    
    const isDonor = match.donor_id === req.user.id;
    const isRecipient = match.recipient_id === req.user.id;
    
    if (!isDonor && !isRecipient) {
      return next(new AppError('You do not have permission to confirm this match', 403));
    }
    
    const updates = {};
    if (isDonor) updates.donor_confirmed_handover = true;
    else updates.recipient_confirmed_handover = true;
    
    let { data: updated, error: updateError } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    if (updated.donor_confirmed_handover && updated.recipient_confirmed_handover) {
      const { data: finalized, error: finalError } = await supabase
        .from('matches')
        .update({ status: 'completed' })
        .eq('id', req.params.id)
        .select()
        .single();

      if (finalError) throw finalError;
      updated = finalized;
      
      await supabase.from('items').update({ status: 'completed' }).eq('id', updated.item_id);
      
      await supabase.rpc('increment_handover_count', { user_id: updated.donor_id });
      await supabase.rpc('increment_handover_count', { user_id: updated.recipient_id });
      
      await recalculateScore(updated.donor_id);
      await recalculateScore(updated.recipient_id);

      // Award karma
      await awardKarma(updated.donor_id, 'handover_confirmed', 20, updated.id, 'Completed item handover');
      await awardKarma(updated.recipient_id, 'handover_confirmed', 5, updated.id, 'Received donation');
      
      await supabase.from('notifications').insert([
        {
          recipient_id: updated.donor_id,
          type: 'MATCH_UPDATE',
          title: 'Handover Completed',
          message: 'The item handover was marked as completed.',
          reference_id: updated.id
        },
        {
          recipient_id: updated.recipient_id,
          type: 'MATCH_UPDATE',
          title: 'Handover Completed',
          message: 'The item handover was marked as completed.',
          reference_id: updated.id
        }
      ]);
    }
    
    res.status(200).json({
      success: true,
      data: updated
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
    const { data: match, error: findError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findError || !match) return next(new AppError('Match not found', 404));

    if (match.recipient_id !== req.user.id) {
      return next(new AppError('Only the recipient can set urgency', 403));
    }

    const { data: updated, error: updateError } = await supabase
      .from('matches')
      .update({ is_urgent: !match.is_urgent })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({ success: true, data: updated });
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
