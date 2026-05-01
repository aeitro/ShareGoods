const User = require('../models/user.model');

/**
 * Recalculate reputation score for a user
 * 
 * Weights:
 * - Follow-through rate (confirmed handovers / total accepted matches): 40%
 * - Feedback average: 35% (Placeholder for rating model)
 * - No-show count: penalises missed pickups (-15% penalty)
 * - Response speed: 10% (Placeholder for message latency)
 */
exports.recalculateScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // 1. Follow-through Rate (40%)
    // Base score is 50. HandoverCount/TotalMatches ratio adds/subtracts from it.
    let followThroughScore = 0;
    if (user.totalMatches > 0) {
      followThroughScore = (user.handoverCount / user.totalMatches) * 40;
    } else {
      followThroughScore = 20; // Default middle ground for new users
    }

    // 2. Feedback average (35%)
    // Since we don't have a Rating model yet, we'll use a placeholder average of 4.5/5
    const feedbackScore = (4.5 / 5) * 35;

    // 3. No-show Penalty (-15%)
    const noShowPenalty = user.noShowCount * 5; // -5 points per no-show

    // 4. Response Speed (10%)
    // Placeholder: Assume average speed for now
    const speedScore = 8; 

    // Calculate final score
    let finalScore = followThroughScore + feedbackScore + speedScore - noShowPenalty;
    
    // Clamp between 0 and 100
    finalScore = Math.max(0, Math.min(100, finalScore));

    user.reputationScore = finalScore;
    await user.save();

    console.log(`[REPUTATION] User ${userId} score updated to: ${finalScore}`);
    
    return finalScore;
  } catch (error) {
    console.error(`[REPUTATION ERROR]`, error);
  }
};
