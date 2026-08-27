import api from './api';

// Buyer: Place order
export const placeOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Buyer: Get my orders
export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

// Seller: Get shop's incoming orders
export const getShopOrders = async () => {
  const response = await api.get('/orders/shop-orders');
  return response.data;
};

// Seller: Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};
