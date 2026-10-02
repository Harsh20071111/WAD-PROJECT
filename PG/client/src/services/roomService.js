import axios from 'axios';

// Get base URL logic similar to api.js or simply import api instance if it is exported.
// I will import the api instance. Wait, let me check if api.js exports the configured axios instance.
// In api.js: const api = axios.create(...); export default api;
// So I will just import it.

import api from './api';

export const getRoomsMatrix = async () => {
  const response = await api.get('/rooms/matrix');
  return response.data.data;
};

export const updateRoom = async (roomId, data) => {
  const response = await api.put(`/rooms/${roomId}`, data);
  return response.data.data;
};

export const assignBed = async (roomId, bedId, residentData) => {
  const response = await api.post(`/rooms/${roomId}/beds/${bedId}/assign`, residentData);
  return response.data;
};

export const checkoutBed = async (roomId, bedId) => {
  const response = await api.post(`/rooms/${roomId}/beds/${bedId}/checkout`);
  return response.data;
};
