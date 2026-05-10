const supabase = require('../utils/supabase');

// @desc    Submit feedback for a completed match
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { matchId, rating, note } = req.body;

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ status: 'error', message: 'Match not found' });
    }

    if (match.status !== 'completed') {
      return res.status(400).json({ status: 'error', message: 'Feedback can only be given for completed matches' });
    }

    // Determine the reviewee based on the reviewer
    let revieweeId;
    if (match.donor_id === req.user.id) {
      revieweeId = match.recipient_id;
    } else if (match.recipient_id === req.user.id) {
      revieweeId = match.donor_id;
    } else {
      return res.status(403).json({ status: 'error', message: 'You are not part of this match' });
    }

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        match_id: matchId,
        reviewer_id: req.user.id,
        reviewee_id: revieweeId,
        rating,
        note
      })
      .select()
      .single();

    if (feedbackError) {
      if (feedbackError.code === '23505') {
        return res.status(400).json({ status: 'error', message: 'You have already reviewed this match' });
      }
      throw feedbackError;
    }

    res.status(201).json({
      status: 'success',
      data: feedback
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// @desc    Get feedback for a user
// @route   GET /api/users/:id/feedback
// @access  Private
exports.getUserFeedback = async (req, res) => {
  try {
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select(`
        *,
        reviewer:profiles!reviewer_id (*)
      `)
      .eq('reviewee_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
