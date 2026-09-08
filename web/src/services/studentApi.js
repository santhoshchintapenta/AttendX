import api from './api';

export const getStudents = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await api.get(`/students${query ? `?${query}` : ''}`);
  return response.data.data;
};

export const addStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const previewBulkUpload = async (formData, overrides) => {
  if (overrides) {
    if (overrides.year) formData.append('overrideYear', overrides.year);
    if (overrides.semester) formData.append('overrideSemester', overrides.semester);
    if (overrides.section) formData.append('overrideSection', overrides.section);
  }
  const response = await api.post('/students/bulk-upload/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const importBulkStudents = async (students) => {
  const response = await api.post('/students/bulk-upload/import', { students });
  return response.data.data;
};
