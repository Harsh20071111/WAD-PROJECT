import api from './api';

const data = (response) => response.data.data;

export const getComplaints = async () => data(await api.get('/complaints'));
export const createComplaint = async (payload) => data(await api.post('/complaints', payload));
export const updateComplaint = async (id, payload) => data(await api.patch(`/complaints/${id}`, payload));
export const getStaff = async () => data(await api.get('/staff'));
export const getResidents = async () => data(await api.get('/residents'));
export const createResident = async (payload) => data(await api.post('/residents', payload));
export const getPayments = async () => data(await api.get('/payments'));
export const createPayment = async (payload) => data(await api.post('/payments', payload));
export const getMyPayments = async () => data(await api.get('/payments/mine'));
export const createPaymentOrder = async (id) => data(await api.post(`/payments/${id}/order`));
export const verifyPayment = async (id, payload) => data(await api.post(`/payments/${id}/verify`, payload));
export const getNotifications = async () => data(await api.get('/notifications'));
export const getRooms = async () => data(await api.get('/rooms'));
export const getSummary = async () => data(await api.get('/pg/summary'));
export const getResidentsForAssignment = async () => data(await api.get('/residents'));
export const assignBed = async (bedId, residentId) => data(await api.post(`/rooms/beds/${bedId}/assign`, { residentId }));
export const vacateBed = async (bedId) => data(await api.post(`/rooms/beds/${bedId}/vacate`));
export const updateBedStatus = async (bedId, payload) => data(await api.patch(`/rooms/beds/${bedId}/status`, payload));
