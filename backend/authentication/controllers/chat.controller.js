const AppError = require('../utils/AppError');
const supabase = require('../utils/supabase');

/**
 * Get all conversations for current user
 */
exports.getConversations = async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        item:items (id, name),
        participants:conversation_participants (
          user_id,
          profiles:profiles (id, full_name, role)
        )
      `)
      .contains('participants', [{ user_id: req.user.id }]); // Note: This depends on how participants are stored

    // Alternative: join query
    const { data: convs, error: err } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations(*, items(name))')
      .eq('user_id', req.user.id);

    if (error || err) {
      throw new Error(error?.message || err?.message);
    }

    res.status(200).json({
      status: 'success',
      data: convs
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Get messages for a specific conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Start or get a conversation
 */
exports.startConversation = async (req, res) => {
  try {
    const { participantId, itemId } = req.body;

    // Check if conversation already exists for this item between these two users
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_participants!inner(user_id)
      `)
      .eq('item_id', itemId)
      .filter('conversation_participants.user_id', 'in', `(${req.user.id},${participantId})`);

    // In a real app, you'd verify that both users are participants of the same conversation
    // For simplicity, let's look for an exact match or create
    
    let conversation;
    if (existing && existing.length > 0) {
      conversation = existing[0];
    } else {
      // Create conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({ item_id: itemId })
        .select()
        .single();

      if (createError) throw createError;

      // Add participants
      await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: req.user.id },
          { conversation_id: newConv.id, user_id: participantId }
        ]);

      conversation = newConv;
    }

    res.status(200).json({
      status: 'success',
      data: conversation
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: req.user.id,
        content
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last activity
    await supabase
      .from('conversations')
      .update({ updated_at: new Date() })
      .eq('id', conversationId);
    
    // Notifications and Realtime handled by DB triggers or client listeners
    // For backward compatibility, we can still emit socket events if needed
    try {
      const { getIO } = require('../utils/socket');
      const io = getIO();
      if (io) io.to(conversationId).emit('new_message', message);
    } catch (e) {}

    res.status(201).json({
      status: 'success',
      data: message
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

/**
 * Mark all messages in a conversation as read
 */
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', req.user.id)
      .eq('is_read', false);

    if (error) throw error;

    try {
      const { getIO } = require('../utils/socket');
      const io = getIO();
      if (io) io.to(conversationId).emit('messages_read', { conversationId, readerId: req.user.id });
    } catch (e) {}

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
