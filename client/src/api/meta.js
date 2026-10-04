import api from './axios';

export const getMeta = async () => {
  const { data } = await api.get('/meta');
  return data;
};
