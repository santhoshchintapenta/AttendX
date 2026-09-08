import api from './api';

export const getHODStats = async () => {
  const response = await api.get('/dashboard/hod-stats');
  return response.data.data;
};
