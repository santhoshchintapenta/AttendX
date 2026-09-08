import api from './api';

export const getFacultyList = async () => {
  const response = await api.get('/faculty');
  return response.data.data;
};

export const getFacultyById = async (id) => {
  const response = await api.get(`/faculty/${id}`);
  return response.data.data;
};

export const addFaculty = async (data) => {
  const response = await api.post('/faculty', data);
  // We return the full response data because we need the temporaryPassword which is alongside 'data'
  return response.data;
};

export const updateFaculty = async (id, data) => {
  const response = await api.put(`/faculty/${id}`, data);
  return response.data.data;
};

export const updateFacultyStatus = async (id, status) => {
  const response = await api.patch(`/faculty/${id}/status`, { isActive: status });
  return response.data;
};

export const deleteFaculty = async (id) => {
  const response = await api.delete(`/faculty/${id}`);
  return response.data;
};

export const getFacultySubjects = async (id) => {
  const response = await api.get(`/faculty/${id}/subjects`);
  return response.data.data;
};

export const assignFacultySubjects = async (id, subjectIds) => {
  const response = await api.put(`/faculty/${id}/subjects`, { subjectIds });
  return response.data;
};

export const bulkPreviewFaculty = async (formData) => {
  const response = await api.post('/faculty/bulk-import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const bulkImportFaculty = async (rows) => {
  const response = await api.post('/faculty/bulk-import/import', { rows });
  return response.data;
};
