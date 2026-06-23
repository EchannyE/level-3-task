import api from './axios.js';
export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const getMeApi = () => api.get('/auth/me');
export const searchUserApi = (email) =>
  api.get(`/auth/search?email=${encodeURIComponent(email)}`);