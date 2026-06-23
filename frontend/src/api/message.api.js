import api from './axios.js';
export const getMessagesApi = (projectId, page = 1) =>
  api.get(`/projects/${projectId}/messages?page=${page}`);
export const sendMessageApi = (projectId, content) =>
  api.post(`/projects/${projectId}/messages`, { content });