const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const supabase = require('../utils/supabase');

const router = express.Router();

router.use(protect);

/**
 * Get my notifications
 */
router.get('/my', async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    
    res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

/**
 * Mark all as read
 */
router.post('/read-all', async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .is('read_at', null);

    if (error) throw error;
    
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
