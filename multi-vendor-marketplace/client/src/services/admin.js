import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const listPendingShops = async () => {
  const response = await api.get('/admin/shops/pending');
  return response.data;
};

export const listAllShops = async () => {
  const response = await api.get('/admin/shops');
  return response.data;
};

export const approveShop = async (shopId) => {
  const response = await api.put(`/admin/shops/${shopId}/approve`);
  return response.data;
};

export const rejectShop = async (shopId) => {
  const response = await api.put(`/admin/shops/${shopId}/reject`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/admin/categories', data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

export const listAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};
