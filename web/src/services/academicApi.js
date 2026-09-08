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

export const createSection = async (data) => {
  const response = await api.post('/academic/sections', data);
  return response.data.data;
};

export const updateSection = async (id, data) => {
  const response = await api.put(`/academic/sections/${id}`, data);
  return response.data.data;
};

export const deleteSection = async (id) => {
  const response = await api.delete(`/academic/sections/${id}`);
  return response.data;
};

export const getSubjects = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/academic/subjects?${params}`);
  return response.data.data;
};

export const createSubject = async (data) => {
  const response = await api.post('/academic/subjects', data);
  return response.data.data;
};

export const updateSubject = async (id, data) => {
  const response = await api.put(`/academic/subjects/${id}`, data);
  return response.data.data;
};

export const deleteSubject = async (id) => {
  const response = await api.delete(`/academic/subjects/${id}`);
  return response.data;
};
