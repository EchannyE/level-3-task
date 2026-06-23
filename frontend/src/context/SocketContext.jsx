import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore.js';
import useProjectStore from '../store/projectStore.js';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef        = useRef(null);
  const pendingRoomsRef  = useRef(new Set()); // rooms to join once connected
  const { token, isAuthenticated } = useAuthStore();

  const addTask         = useProjectStore((s) => s.addTask);
  const updateTask      = useProjectStore((s) => s.updateTask);
  const removeTask      = useProjectStore((s) => s.removeTask);
  const addMessage      = useProjectStore((s) => s.addMessage);
  const addNotification = useProjectStore((s) => s.addNotification);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);

      // Join any rooms that were requested before connection was ready
      pendingRoomsRef.current.forEach((projectId) => {
        console.log('🚪 Joining pending room:', projectId);
        socket.emit('join:project', projectId);
      });
      pendingRoomsRef.current.clear();
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    socket.on('reconnect', () => {
      console.log('♻️ Socket reconnected');
    });

    // ── Task events ──────────────────────────────────────────────────────
    socket.on('task:created', (task) => {
      console.log('📥 task:created:', task.title);
      addTask(task);
    });

    socket.on('task:updated', (task) => {
      console.log('📥 task:updated:', task.title);
      updateTask(task);
    });

    socket.on('task:deleted', ({ taskId }) => {
      console.log('📥 task:deleted:', taskId);
      removeTask(taskId);
    });

    // ── Chat events ───────────────────────────────────────────────────────
    socket.on('message:new', (message) => {
      addMessage(message);
    });

    // ── Notification events ───────────────────────────────────────────────
    socket.on('notification', (notification) => {
      console.log('🔔 NOTIFICATION RECEIVED:', notification);
      addNotification(notification);
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('message:new');
      socket.off('notification');
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  // ✅ If socket not connected yet, queue the room for when it connects
  const joinProject = useCallback((projectId) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      console.log('🚪 Joining project room:', projectId);
      socket.emit('join:project', projectId);
    } else {
      console.log('⏳ Socket not ready — queuing room:', projectId);
      pendingRoomsRef.current.add(projectId);
    }
  }, []);

  const leaveProject = useCallback((projectId) => {
    socketRef.current?.emit('leave:project', projectId);
    pendingRoomsRef.current.delete(projectId);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);