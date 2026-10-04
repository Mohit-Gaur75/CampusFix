import api from './axios';

export const updateMe = async (data) => {
  const res = await api.patch('/users/me', data);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await api.patch(`/users/${userId}/role`, { role });
  return res.data;
};
