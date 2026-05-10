const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

// ────────────────────────────────────────────────────────
// Badge definitions — condition evaluated at award time
// ────────────────────────────────────────────────────────
const BADGE_RULES = [
  {
    id: 'first_donation',
    label: 'First Donation',
    icon: '🎁',
    description: 'Completed your first donation handover',
    check: (user) => user.handoverCount >= 1
  },
  {
    id: 'ten_items_given',
    label: 'Generous Giver',
    icon: '💚',
    description: 'Completed 10 donation handovers',
    check: (user) => user.handoverCount >= 10
  },
  {
    id: 'five_items_given',
    label: 'Rising Donor',
    icon: '🌱',
    description: 'Completed 5 donation handovers',
    check: (user) => user.handoverCount >= 5
  },
  {
    id: 'one_year_donor',
    label: 'Loyal Donor',
    icon: '🏆',
    description: 'Active for over a year with at least one donation',
    check: (user) => {
      const msInYear = 365 * 24 * 60 * 60 * 1000;
      return (Date.now() - new Date(user.createdAt).getTime() >= msInYear) && user.handoverCount >= 1;
    }
  }
];

// ────────────────────────────────────────────────────────
// Award karma helper — called by other controllers
// ────────────────────────────────────────────────────────
const awardKarma = async (userId, eventType, points, referenceId = null, note = '') => {
  try {
    // Record event in Supabase
    const { error: eventError } = await supabase.from('karma_events').insert({
      user_id: userId,
      event_type: eventType,
      points,
      reference_id: referenceId,
      note
    });
    if (eventError) throw eventError;

    // Update user karma score in Supabase
    const { data: profile, error: profileError } = await supabase.rpc('increment_karma', {
      user_id: userId,
      inc_points: points
    });

    // Note: RPC 'increment_karma' should be defined in Supabase to handle concurrency.
    // Alternatively, a simple update:
    /*
    const { data: current } = await supabase.from('profiles').select('karma_score, badges').eq('id', userId).single();
    await supabase.from('profiles').update({ karma_score: (current.karma_score || 0) + points }).eq('id', userId);
    */

    // Badge logic would go here, checking 'profile.handover_count' etc.
    
    return { success: true };
  } catch (err) {
    console.error('awardKarma error:', err.message);
  }
};

// ────────────────────────────────────────────────────────
// GET /api/karma/my — authenticated user's karma + badges
// ────────────────────────────────────────────────────────
const getMyKarma = async (req, res, next) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('karma_score, badges, handover_count, created_at')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;

    const { data: events, error: eventsError } = await supabase
      .from('karma_events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (eventsError) throw eventsError;

    // Enrich badge data
    const enrichedBadges = BADGE_RULES.map(rule => ({
      ...rule,
      earned: (user.badges || []).includes(rule.id)
    }));

    const nextBadge = enrichedBadges.find(b => !b.earned) || null;

    res.status(200).json({
      success: true,
      data: {
        karmaScore: user.karma_score,
        handoverCount: user.handover_count,
        badges: enrichedBadges,
        nextBadge,
        recentEvents: events
      }
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// GET /api/impact/my — authenticated donor's impact summary
// ────────────────────────────────────────────────────────
const getMyImpact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('karma_score, badges, handover_count, full_name')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { data: completedMatches, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        recipient:profiles!recipient_id (role),
        item:items (name, category)
      `)
      .eq('donor_id', userId)
      .eq('status', 'completed');

    if (matchError) throw matchError;

    const totalItems = completedMatches.length;
    const ngoCount = completedMatches.filter(m => m.recipient?.role === 'NGO').length;
    const individualCount = totalItems - ngoCount;
    // Simple CO2 estimate: 2 kg per item diverted from landfill
    const co2Saved = totalItems * 2;
    const kgDiverted = totalItems * 3;

    // Category breakdown
    const categoryMap = {};
    completedMatches.forEach(m => {
      const cat = m.item?.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        individualsHelped: individualCount,
        ngosServed: ngoCount,
        co2Saved,
        kgDiverted,
        categoryBreakdown: categoryMap,
        karmaScore: user.karma_score,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// GET /api/impact/certificate/:matchId
// Returns a mock certificate object (placeholder for PDF gen)
// ────────────────────────────────────────────────────────
const getCertificate = async (req, res, next) => {
  try {
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        *,
        item:items (name, category),
        donor:profiles!donor_id (full_name),
        recipient:profiles!recipient_id (full_name, role)
      `)
      .eq('id', req.params.matchId)
      .single();

    if (error || !match) return next(new AppError('Match not found', 404));
    if (match.status !== 'completed') return next(new AppError('Certificate is only available for completed handovers', 400));
    if (match.donor_id !== req.user.id) return next(new AppError('Not authorised', 403));

    const certificate = {
      donorName: match.donor.full_name,
      recipientName: match.recipient.full_name,
      recipientType: match.recipient.role,
      itemName: match.item.name,
      itemCategory: match.item.category,
      completedAt: match.updated_at,
      certificateId: `CERT-${match.id.toString().slice(-8).toUpperCase()}`,
      downloadUrl: null, // Placeholder
      shareText: `I donated ${match.item.name} via ShareGoods and helped someone in need! 💚 #ShareGoods #CommunityDonation`
    };

    res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// GET /api/impact/received — recipient's received items log
// ────────────────────────────────────────────────────────
const getReceivedHistory = async (req, res, next) => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        updated_at,
        handover_method,
        item:items (name, category, description, condition),
        donor:profiles!donor_id (full_name, avatar_url, reputation_score)
      `)
      .eq('recipient_id', req.user.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches.map(m => ({
        matchId: m.id,
        item: m.item,
        donor: m.donor,
        completedAt: m.updated_at,
        handoverMethod: m.handover_method
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { awardKarma, getMyKarma, getMyImpact, getCertificate, getReceivedHistory };
