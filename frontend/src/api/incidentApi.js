import api from './axiosInstance';

/**
 * Report an incident (commuter / driver / conductor).
 * @param {{
 *   transportId: string,
 *   routeId: string,
 *   incidentType: 'delay'|'breakdown'|'accident'|'overcrowding'|'other',
 *   severity?: 'low'|'medium'|'high'|'critical',
 *   description?: string,
 *   location?: string,
 *   img?: string   // optional base64 image: "data:image/png;base64,..."
 * }} data
 */
export const reportIncident = (data) => api.post('/incidents/report', data);

/**
 * Get all incidents.
 * - Authority: sees all incidents.
 * - Others: only see their own reports.
 * @param {{
 *   status?: 'open'|'acknowledged'|'resolved',
 *   severity?: 'low'|'medium'|'high'|'critical',
 *   transportId?: string,
 *   incidentType?: string,
 *   page?: number,
 *   limit?: number
 * }} params
 * @returns {Promise<{ data: { incidents: object[], pagination: { total, page, limit, pages } } }>}
 */
export const getAllIncidents = (params = {}) => api.get('/incidents', { params });

/**
 * Get incidents for a specific transport.
 * @param {string} transportId
 * @param {{ status?, severity?, incidentType?, page?, limit? }} params
 * @returns {Promise<{ data: { incidents: object[], pagination: { total, page, limit, pages } } }>}
 */
export const getIncidentsByTransport = (transportId, params = {}) =>
  api.get(`/incidents/${transportId}`, { params });

/**
 * Resolve or acknowledge an incident (Authority only).
 * @param {string} incidentId
 * @param {{ status: 'acknowledged'|'resolved' }} data
 */
export const resolveIncident = (incidentId, data) => api.put(`/incidents/${incidentId}/resolve`, data);

/**
 * Delete an incident (Authority only).
 * @param {string} incidentId
 */
export const deleteIncident = (incidentId) => api.delete(`/incidents/${incidentId}`);

/**
 * Get incident base64 image
 * @param {string} incidentId
 */
export const getIncidentImage = (incidentId) => api.get(`/incidents/${incidentId}/image`);

