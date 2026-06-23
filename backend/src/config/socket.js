import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.util.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Socket auth middleware — reuses the same JWT strategy
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: no token'));

    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Authentication error: invalid token'));

    socket.user = decoded; // attach user payload to socket
    next();
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Connected: ${socket.user.name} [${socket.user.id}]`);

    // Each user joins a personal room for targeted notifications
    socket.join(`user:${socket.user.id}`);

    // Client emits this when entering a project page
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:joined', {
        userId: socket.user.id,
        name: socket.user.name,
      });
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

// Exported so services can emit from anywhere in the app
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};