import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore.js';
import useProjectStore from '../store/projectStore.js';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { token, isAuthenticated } = useAuthStore();
  const { addTask, updateTask, removeTask, addMessage, addNotification } = useProjectStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      { auth: { token }, transports: ['websocket'] }
    );

    const socket = socketRef.current;

    socket.on('connect', () => console.log('⚡ Socket connected:', socket.id));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    // Wire socket events directly to Zustand store mutations
    socket.on('task:created', addTask);
    socket.on('task:updated', updateTask);
    socket.on('task:deleted', ({ taskId }) => removeTask(taskId));
    socket.on('message:new', addMessage);
    socket.on('notification', addNotification);

    return () => socket.disconnect();
  }, [isAuthenticated, token]);

  const joinProject = (projectId) => socketRef.current?.emit('join:project', projectId);
  const leaveProject = (projectId) => socketRef.current?.emit('leave:project', projectId);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);