import api from './axios';

export const getOverview = async (days = 30) => {
  const { data } = await api.get('/analytics/overview', { params: { days } });
  return data;
};
