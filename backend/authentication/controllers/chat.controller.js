const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const Notification = require('../models/notification.model');

/**
 * Get all conversations for current user
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'fullName role')
    .populate('item', 'name images')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: conversations
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
    const messages = await Message.find({
      conversation: req.params.conversationId
    })
    .sort({ createdAt: 1 });

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

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] },
      item: itemId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, participantId],
        item: itemId
      });
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

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content
    });

    const conversation = await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id
    });
    
    const recipientId = conversation.participants.find(p => p.toString() !== req.user.id);
    if (recipientId) {
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `${req.user.fullName} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        referenceId: conversationId,
        onModel: 'Conversation'
      });

      const { getIO, sendToUser } = require('../utils/socket');
      sendToUser(recipientId, 'new_notification', notification);
    }

    const { getIO } = require('../utils/socket');
    const io = getIO();
    io.to(conversationId).emit('new_message', message);

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

    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user.id }, read: false },
      { $set: { read: true } }
    );

    const { getIO } = require('../utils/socket');
    const io = getIO();
    io.to(conversationId).emit('messages_read', { conversationId, readerId: req.user.id });

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
