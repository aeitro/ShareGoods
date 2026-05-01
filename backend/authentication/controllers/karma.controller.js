const User = require('../models/user.model');
const Item = require('../models/item.model');
const Match = require('../models/match.model');
const KarmaEvent = require('../models/karma.model');
const AppError = require('../utils/AppError');

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
    await KarmaEvent.create({ user: userId, eventType, points, referenceId, note });
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { karmaScore: points } },
      { new: true }
    );

    // Evaluate and award any newly unlocked badges
    const newBadges = [];
    for (const rule of BADGE_RULES) {
      if (!user.badges.includes(rule.id) && rule.check(user)) {
        newBadges.push(rule.id);
      }
    }
    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(userId, { $addToSet: { badges: { $each: newBadges } } });
    }

    return { karmaScore: user.karmaScore + points, newBadges };
  } catch (err) {
    console.error('awardKarma error:', err.message);
  }
};

// ────────────────────────────────────────────────────────
// GET /api/karma/my — authenticated user's karma + badges
// ────────────────────────────────────────────────────────
const getMyKarma = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('karmaScore badges handoverCount createdAt');
    const events = await KarmaEvent.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);

    // Enrich badge data with metadata
    const enrichedBadges = BADGE_RULES.map(rule => ({
      ...rule,
      earned: user.badges.includes(rule.id)
    }));

    // Determine next badge
    const nextBadge = enrichedBadges.find(b => !b.earned) || null;

    res.status(200).json({
      success: true,
      data: {
        karmaScore: user.karmaScore,
        handoverCount: user.handoverCount,
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
    const user = await User.findById(userId).select('karmaScore badges handoverCount createdAt fullName');

    const completedMatches = await Match.find({
      donor: userId,
      status: 'completed'
    }).populate('recipient', 'role').populate('item', 'name category');

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
        karmaScore: user.karmaScore,
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
    const match = await Match.findById(req.params.matchId)
      .populate('item', 'name category')
      .populate('donor', 'fullName')
      .populate('recipient', 'fullName role');

    if (!match) return next(new AppError('Match not found', 404));
    if (match.status !== 'completed') return next(new AppError('Certificate is only available for completed handovers', 400));
    if (match.donor._id.toString() !== req.user.id) return next(new AppError('Not authorised', 403));

    // In production: generate PDF via a service like Puppeteer/Cloudinary and return signed URL
    // For now, return structured data that the frontend can render or download as HTML
    const certificate = {
      donorName: match.donor.fullName,
      recipientName: match.recipient.fullName,
      recipientType: match.recipient.role,
      itemName: match.item.name,
      itemCategory: match.item.category,
      completedAt: match.updatedAt,
      certificateId: `CERT-${match._id.toString().slice(-8).toUpperCase()}`,
      downloadUrl: null, // Placeholder — wire to Cloudinary/PDF service
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
    const matches = await Match.find({
      recipient: req.user.id,
      status: 'completed'
    })
      .populate('item', 'name category images description condition')
      .populate('donor', 'fullName avatarUrl reputationScore')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches.map(m => ({
        matchId: m._id,
        item: m.item,
        donor: m.donor,
        completedAt: m.updatedAt,
        handoverMethod: m.handoverMethod
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { awardKarma, getMyKarma, getMyImpact, getCertificate, getReceivedHistory };
