const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Platform-wide stats
 * @route GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    // Platform stats using Supabase
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalDonors } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'DONOR');
    const { count: totalRecipients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'INDIVIDUAL');
    const { count: totalNGOs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'NGO');
    const { count: pendingNGOs } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'NGO').eq('ngo_verification_status', 'pending');
    
    const { count: totalDonations } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('donation_type', 'free');
    const { count: activeListings } = await supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'available');
    
    const { count: pendingMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: successfulMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    
    const { count: suspendedUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', false);

    const matchSuccessRate = (pendingMatches || 0) + (successfulMatches || 0) > 0
      ? (((successfulMatches || 0) / ((pendingMatches || 0) + (successfulMatches || 0))) * 100).toFixed(1)
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
    let query = supabase.from('profiles').select('*');

    if (role) query = query.eq('role', role);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data: users, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

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
    const { data: user, error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ status: 'error', message: 'User not found' });

    await supabase.from('notifications').insert({
      recipient_id: user.id,
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
    const { data: user, error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ status: 'error', message: 'User not found' });

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
    const { error } = await supabase.from('profiles').delete().eq('id', req.params.id);
    if (error) throw error;
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
    const { data: ngos, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'NGO')
      .eq('ngo_verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
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
    const { data: user, error } = await supabase
      .from('profiles')
      .update({ ngo_verification_status: 'approved', is_verified_ngo: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ status: 'error', message: 'NGO not found' });

    await supabase.from('notifications').insert({
      recipient_id: user.id,
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
    const { data: user, error } = await supabase
      .from('profiles')
      .update({ ngo_verification_status: 'rejected', is_verified_ngo: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ status: 'error', message: 'NGO not found' });

    await supabase.from('notifications').insert({
      recipient_id: user.id,
      type: 'SYSTEM',
      title: 'NGO Verification Rejected',
      message: `Your NGO verification was rejected. Reason: ${reason || 'No reason provided'}. Please contact support.`,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Get all reports
 * @route GET /api/admin/reports
 */
exports.getReports = async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id (full_name, email, role)
      `);
      
    if (status) query = query.eq('status', status);

    const { data: reports, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

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
    const { data: report, error } = await supabase
      .from('reports')
      .update({ status, admin_note: adminNote })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !report) return res.status(404).json({ status: 'error', message: 'Report not found' });

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
    const { data: item, error: findError } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (findError || !item) return res.status(404).json({ status: 'error', message: 'Item not found' });

    // Toggle status between 'available' and 'suspended'
    const newStatus = item.status === 'suspended' ? 'available' : 'suspended';
    
    const { data: updated, error: updateError } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    await supabase.from('notifications').insert({
      recipient_id: updated.donor_id,
      type: 'SYSTEM',
      title: updated.status === 'suspended' ? 'Item Taken Down' : 'Item Reinstated',
      message: `Your item "${updated.name}" has been ${updated.status === 'suspended' ? 'removed from the platform' : 'reinstated'}.`,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
