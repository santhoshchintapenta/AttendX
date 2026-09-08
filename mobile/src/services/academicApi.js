import api from './api';

export const getDepartments = async () => {
  const response = await api.get('/academic/departments');
  return response.data.data;
};

export const getSections = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/academic/sections?${params}`);
  return response.data.data;
};

export const getSubjects = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/academic/subjects?${params}`);
  return response.data.data;
};
