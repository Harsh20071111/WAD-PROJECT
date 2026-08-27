import api from './api';

export const listApprovedShops = async (search = '') => {
  const params = search ? { search } : {};
  const response = await api.get('/shops', { params });
  return response.data;
};

export const getShopById = async (shopId) => {
  const response = await api.get(`/shops/${shopId}`);
  return response.data;
};

export const getMyShop = async () => {
  const response = await api.get('/shops/my-shop');
  return response.data;
};

export const createShop = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.post('/shops', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const updateShop = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.put('/shops/my-shop', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};
