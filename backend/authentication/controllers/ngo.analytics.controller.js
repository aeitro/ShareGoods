const Item = require('../models/item.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

/**
 * Get Demand-Gap Analytics (Supply vs Demand)
 * @route GET /api/ngo/analytics/demand-gap
 */
exports.getDemandGap = async (req, res, next) => {
  try {
    // Categories to track
    const categories = ["Clothing", "Shoes", "Books", "Toys", "Electronics", "Household Items", "Furniture"];
    
    const analytics = await Promise.all(categories.map(async (category) => {
      // Supply: Available items in this category
      const supply = await Item.countDocuments({ category, status: 'available' });
      
      // Demand: Pending matches for this NGO in this category (or total requests)
      const demand = await Match.countDocuments({ 
        'item.category': category, // This requires item population or aggregation
        status: 'pending' 
      });

      // Since 'item.category' deep querying in countDocuments is tricky without aggregation
      // let's use aggregation for a more robust approach
      return { category, supply, demand };
    }));

    // Better approach using aggregation for real-time stats
    const supplyStats = await Item.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const demandStats = await Match.aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      { $group: { _id: '$itemDetails.category', count: { $sum: 1 } } }
    ]);

    // Format for frontend
    const chartData = categories.map(cat => {
      const s = supplyStats.find(i => i._id === cat)?.count || 0;
      const d = demandStats.find(i => i._id === cat)?.count || 0;
      return { category: cat, supply: s, demand: d };
    });

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Donor Transparency Feed (N10)
 * List of donors who have successfully donated to this NGO
 */
exports.getNGODonors = async (req, res, next) => {
  try {
    const completedMatches = await Match.find({ 
      recipient: req.user.id, 
      status: 'completed' 
    }).populate('donor', 'fullName email avatarUrl reputationScore');

    // Filter unique donors
    const donorMap = new Map();
    completedMatches.forEach(match => {
      if (!match.donor) return;
      const donorId = match.donor._id.toString();
      if (!donorMap.has(donorId)) {
        donorMap.set(donorId, {
          id: donorId,
          fullName: match.donor.fullName,
          avatarUrl: match.donor.avatarUrl,
          reputationScore: match.donor.reputationScore,
          totalDonations: 1,
          lastDonationDate: match.updatedAt
        });
      } else {
        const d = donorMap.get(donorId);
        d.totalDonations += 1;
        if (match.updatedAt > d.lastDonationDate) {
          d.lastDonationDate = match.updatedAt;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: Array.from(donorMap.values())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get NGO Inventory (N6)
 */
exports.getNGOInventory = async (req, res, next) => {
  try {
    const inventory = await Match.find({
      recipient: req.user.id,
      status: 'completed'
    })
    .populate('item')
    .populate('donor', 'fullName email phone')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};
