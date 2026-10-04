import api from './axios';

export const getMyIssues = async (params) => {
  const { data } = await api.get('/issues/mine', { params });
  return data;
};

export const getIssueById = async (id) => {
  const { data } = await api.get(`/issues/${id}`);
  return data;
};

export const suggestCategory = async (description) => {
  const { data } = await api.post('/issues/suggest-category', { description });
  return data;
};

export const checkDuplicates = async (payload, config = {}) => {
  const { data } = await api.post('/issues/check-duplicates', payload, config);
  return data;
};

export const createIssue = async (formData) => {
  const { data } = await api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const provideFeedback = async (id, action) => {
  const { data } = await api.post(`/issues/${id}/feedback`, { action });
  return data;
};
