import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.util.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: no token'));
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        return next(new Error('Authentication error: invalid token'));
      }

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user.id);

    socket.join(`user:${userId}`);

    console.log(
      `⚡ Connected: ${socket.user.name} | room=user:${userId}`
    );

    socket.on('join:project', (projectId) => {
      const room = `project:${projectId}`;

      socket.join(room);

      console.log(
        `🚪 ${socket.user.name} joined ${room}`
      );

      socket.to(room).emit('user:joined', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(
        `❌ Disconnected: ${socket.user.name}`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }

  return io;
};

export const emitTaskCreated = (projectId, task) => {
  io.to(`project:${projectId}`).emit('task:created', task);
};

export const emitTaskUpdated = (projectId, task) => {
  io.to(`project:${projectId}`).emit('task:updated', task);
};

export const emitTaskDeleted = (projectId, taskId) => {
  io.to(`project:${projectId}`).emit('task:deleted', {
    taskId,
  });
};

export const emitNotification = (userId, notification) => {
  io.to(`user:${userId}`).emit('notification', {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    read: false,
    ...notification,
  });
};

export const emitMessage = (projectId, message) => {
  io.to(`project:${projectId}`).emit(
    'message:new',
    message
  );
};