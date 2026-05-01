const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
