import { create } from 'zustand';

const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  messages: [],
  notifications: [],

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),

  // Tasks — all mutations are driven by socket events
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (updated) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t._id === updated._id ? updated : t)) })),
  removeTask: (taskId) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== taskId) })),

  // Messages — reversed because API returns newest first
  setMessages: (messages) => set({ messages: [...messages].reverse() }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),

  // Notifications
  addNotification: (notification) =>
    set((s) => ({
      notifications: [{ ...notification, id: Date.now(), read: false }, ...s.notifications],
    })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));

export default useProjectStore;