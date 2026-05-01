const { Server } = require('socket.io');
const { verifyToken } = require('./jwt');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token provided'));

    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Authentication error: Invalid token'));

    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Add to online users
    onlineUsers.set(socket.user.id, socket.id);
    io.emit('user_status_change', { userId: socket.user.id, status: 'online' });

    // Send current online users to the connected user
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user.id} joined room ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.user.id} left room ${conversationId}`);
    });

    // Typing indicators
    socket.on('typing_start', (conversationId) => {
      socket.to(conversationId).emit('user_typing_start', {
        conversationId,
        userId: socket.user.id,
        userName: socket.user.fullName
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(conversationId).emit('user_typing_stop', {
        conversationId,
        userId: socket.user.id
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      onlineUsers.delete(socket.user.id);
      io.emit('user_status_change', { userId: socket.user.id, status: 'offline' });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const sendToUser = (userId, event, data) => {
  if (!io) return;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};

module.exports = { initSocket, getIO, sendToUser };
