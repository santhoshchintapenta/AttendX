import api from './api';

// GET /api/students — verified backend endpoint (HOD + Faculty)
// Response: { success: true, data: Student[] }
// Each student: { _id, fullName, rollNumber, email, year, semester,
//                 section: { sectionName }, department: { name, code } }
export const getStudents = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/students?${params}`);
  return response.data.data;
};
