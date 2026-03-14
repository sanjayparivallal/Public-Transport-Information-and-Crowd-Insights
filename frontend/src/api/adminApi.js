/**
 * adminApi.js  — Authority-specific convenience wrappers.
 * These combine calls from transportApi and incidentApi for the Authority dashboard.
 */
import api from './axiosInstance';

/**
 * Get the full authority profile for the logged-in authority user.
 * (The user profile endpoint already returns authorityProfile)
 */
export const getAuthorityProfile = () => api.get('/users/profile');

/**
 * Get all transports managed by this authority.
 * Uses the search endpoint with no params — the backend uses req.user for scoping
 * when an authority is logged in.
 */
export const getManagedTransports = () => api.get('/transport/mine');

/**
 * Get all open + acknowledged incidents across all managed transports (authority view).
 * @param {{ status?: string, severity?: string }} params
 */
export const getAllIncidentsForAuthority = (params = {}) => api.get('/incidents', { params });

/**
 * Get crowd levels for all transports (pass individual transportId calls as needed).
 * @param {string} transportId
 */
export const getCrowdForTransport = (transportId) => api.get(`/crowd/${transportId}`);

/**
 * Assign driver or conductor to a transport.
 * @param {string} transportId
 * @param {{ email: string, assignRole: 'driver'|'conductor' }} data
 */
export const assignStaff = (transportId, data) =>
  api.post(`/transport/${transportId}/assign`, data);

/**
 * Create a transport (admin shorthand).
 * @param {{ transportNumber: string, transportName: string, type: 'bus'|'train' }} data
 */
export const createTransport = (data) => api.post('/transport', data);

/**
 * Update a transport (admin shorthand).
 */
export const updateTransport = (transportId, data) => api.put(`/transport/${transportId}`, data);

/**
 * Delete a transport (admin shorthand).
 */
export const deleteTransport = (transportId) => api.delete(`/transport/${transportId}`);
