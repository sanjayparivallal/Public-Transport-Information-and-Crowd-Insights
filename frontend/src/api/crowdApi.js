import api from './axiosInstance';

/**
 * Commuter / authority / driver / conductor submits a crowd report for a route.
 * @param {{ routeId: string, crowdLevel: 'empty'|'average'|'crowded', boardingStop?: string }} data
 */
export const submitCrowdReport = (data) => api.post('/crowd/report', data);

/**
 * Driver / Conductor / Authority updates the official crowd level.
 * @param {{ transportId: string, routeId: string, crowdLevel: 'empty'|'average'|'crowded', currentStop?: string }} data
 */
export const updateCrowdLevel = (data) => api.put('/crowd/level', data);

/**
 * Driver / Conductor / Authority updates the live position of the transport.
 * @param {{ transportId: string, routeId: string, currentStop?: string, nextStop?: string, stopIndex?: number, delayMinutes?: number, status?: string, availableSeats?: number }} data
 */
export const updateLivePosition = (data) => api.put('/crowd/live', data);

/**
 * Get the live position for a transport.
 * @param {string} transportId
 */
export const getLivePosition = (transportId) => api.get(`/crowd/live/${transportId}`);

/**
 * Get aggregated crowd data (official level + recent commuter reports) for a transport.
 * @param {string} transportId
 */
export const getCrowd = (transportId) => api.get(`/crowd/${transportId}`);

/**
 * Get all crowd reports submitted by the current user.
 */
export const getAllCrowdReports = () => api.get('/crowd/my-reports');

/**
 * Delete a crowd report (must be owner or authority).
 * @param {string} id 
 */
export const deleteCrowdReport = (id) => api.delete(`/crowd/report/${id}`);
