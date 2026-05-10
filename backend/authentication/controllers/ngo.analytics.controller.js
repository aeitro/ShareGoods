const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Get Demand-Gap Analytics (Supply vs Demand)
 * @route GET /api/ngo/analytics/demand-gap
 */
exports.getDemandGap = async (req, res, next) => {
  try {
    const categories = ["Clothing", "Shoes", "Books", "Toys", "Electronics", "Household Items", "Furniture"];
    
    // Get supply stats from Supabase
    const { data: supplyStats, error: supplyError } = await supabase
      .from('items')
      .select('category')
      .eq('status', 'available');

    if (supplyError) throw supplyError;

    // Get demand stats from Supabase
    const { data: demandStats, error: demandError } = await supabase
      .from('matches')
      .select('items!inner(category)')
      .eq('status', 'pending');

    if (demandError) throw demandError;

    const chartData = categories.map(cat => {
      const s = supplyStats.filter(i => i.category === cat).length;
      const d = demandStats.filter(i => i.items.category === cat).length;
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
    const { data: completedMatches, error } = await supabase
      .from('matches')
      .select(`
        *,
        donor:profiles!donor_id (*)
      `)
      .eq('recipient_id', req.user.id)
      .eq('status', 'completed');

    if (error) throw error;

    const donorMap = new Map();
    completedMatches.forEach(match => {
      if (!match.donor) return;
      const donorId = match.donor.id;
      if (!donorMap.has(donorId)) {
        donorMap.set(donorId, {
          id: donorId,
          fullName: match.donor.full_name,
          avatarUrl: match.donor.avatar_url,
          reputationScore: match.donor.reputation_score,
          totalDonations: 1,
          lastDonationDate: match.updated_at
        });
      } else {
        const d = donorMap.get(donorId);
        d.totalDonations += 1;
        if (match.updated_at > d.lastDonationDate) {
          d.lastDonationDate = match.updated_at;
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
    const { data: inventory, error } = await supabase
      .from('matches')
      .select(`
        *,
        item:items (*),
        donor:profiles!donor_id (*)
      `)
      .eq('recipient_id', req.user.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};
