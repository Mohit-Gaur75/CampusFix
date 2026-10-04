import api from './axios';

export const getMyNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.patch('/notifications/mark-all-read');
  return data;
};
