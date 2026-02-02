const socketIO = require('socket.io');

// Store online users
const onlineUsers = new Map();

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // When a user logs in or connects
    socket.on('userConnected', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        console.log(`User ${userId} connected. Online users:`, onlineUsers.size);
      }
    });

    // When a user disconnects
    socket.on('disconnect', () => {
      // Find and remove the disconnected user
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('onlineUsers', Array.from(onlineUsers.keys()));
          console.log(`User ${userId} disconnected. Online users:`, onlineUsers.size);
          break;
        }
      }
    });
  });

  return io;
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = { setupSocket, getOnlineUsers };
