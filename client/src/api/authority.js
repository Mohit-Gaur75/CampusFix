import api from './axios';

export const getAuthorityIssues = async (params) => {
  const { data } = await api.get('/authority/issues', { params });
  return data;
};

export const getSimilarIssues = async (id) => {
  const { data } = await api.get(`/authority/issues/${id}/similar`);
  return data;
};

export const assignIssue = async (id, payload) => {
  const { data } = await api.patch(`/authority/issues/${id}/assign`, payload);
  return data;
};

export const changeStatus = async (id, payload) => {
  const { data } = await api.patch(`/authority/issues/${id}/status`, payload);
  return data;
};

export const overridePriority = async (id, payload) => {
  const { data } = await api.patch(`/authority/issues/${id}/priority`, payload);
  return data;
};

export const addRemark = async (id, payload) => {
  const { data } = await api.post(`/authority/issues/${id}/remarks`, payload);
  return data;
};

export const mergeIssues = async (targetId, sourceId) => {
  const { data } = await api.post(`/authority/issues/${targetId}/merge/${sourceId}`);
  return data;
};
