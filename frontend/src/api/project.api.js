import api from './axios.js';
export const createProjectApi = (data) => api.post('/projects', data);
export const getProjectsApi = () => api.get('/projects');
export const getProjectApi = (id) => api.get(`/projects/${id}`);
export const addMemberApi = (id, userId) => api.patch(`/projects/${id}/members`, { userId });
export const deleteProjectApi = (id) => api.delete(`/projects/${id}`);