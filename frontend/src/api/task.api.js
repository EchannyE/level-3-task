import api from './axios.js';
export const createTaskApi = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const getTasksApi = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const updateTaskApi = (projectId, taskId, data) =>
  api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
export const deleteTaskApi = (projectId, taskId) =>
  api.delete(`/projects/${projectId}/tasks/${taskId}`);