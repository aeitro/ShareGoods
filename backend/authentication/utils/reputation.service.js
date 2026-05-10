const supabase = require('../utils/supabase');

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
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('handover_count, total_matches, no_show_count')
      .eq('id', userId)
      .single();

    if (userError || !user) return;

    // 1. Follow-through Rate (40%)
    let followThroughScore = 0;
    if (user.total_matches > 0) {
      followThroughScore = (user.handover_count / user.total_matches) * 40;
    } else {
      followThroughScore = 20; 
    }

    // 2. Feedback average (35%)
    const feedbackScore = (4.5 / 5) * 35;

    // 3. No-show Penalty (-15%)
    const noShowPenalty = (user.no_show_count || 0) * 5; 

    // 4. Response Speed (10%)
    const speedScore = 8; 

    // Calculate final score
    let finalScore = followThroughScore + feedbackScore + speedScore - noShowPenalty;
    
    // Clamp between 0 and 100
    finalScore = Math.max(0, Math.min(100, finalScore));

    await supabase
      .from('profiles')
      .update({ reputation_score: finalScore })
      .eq('id', userId);

    console.log(`[REPUTATION] User ${userId} score updated to: ${finalScore}`);
    
    return finalScore;
  } catch (error) {
    console.error(`[REPUTATION ERROR]`, error);
  }
};
