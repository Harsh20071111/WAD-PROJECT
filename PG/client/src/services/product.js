import api from './api';

// Public: Get products of a specific shop (Isolation boundary)
export const getShopProducts = async (shopId, params = {}) => {
  const response = await api.get(`/shops/${shopId}/products`, { params });
  return response.data;
};

// Public: Get product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Seller: Get own shop's products
export const getMyProducts = async () => {
  const response = await api.get('/products/my-products');
  return response.data;
};

// Seller: Add product
export const addProduct = async (formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.post('/products', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Seller: Update product
export const updateProduct = async (id, formData) => {
  const isFormData = formData instanceof FormData;
  const response = await api.put(`/products/${id}`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// Seller: Delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
