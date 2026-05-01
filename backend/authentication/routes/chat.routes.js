const express = require('express');
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/start', chatController.startConversation);
router.post('/message', chatController.sendMessage);
router.patch('/read/:conversationId', chatController.markMessagesAsRead);

module.exports = router;
