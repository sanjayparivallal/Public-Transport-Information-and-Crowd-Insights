import api from './axiosInstance';

/**
 * Search for transports.
 * @param {{
 *   busNo?: string,
 *   type?: 'bus'|'train',
 *   origin?: string,
 *   destination?: string,
 *   departureTime?: string,
 *   authorityId?: string,
 *   myTransports?: boolean,   // pass true in Authority dashboard to scope to own transports
 *   page?: number,
 *   limit?: number
 * }} params
 * @returns {Promise<{ data: { results: object[], pagination: { total, page, limit, pages } } }>}
 */
export const searchTransports = (params) => api.get('/transport/search', { params });

/**
 * Get full details of a transport (includes routes, live crowd).
 * @param {string} transportId
 */
export const getTransportById = (transportId) => api.get(`/transport/${transportId}`);

/**
 * Create a new transport (Authority only).
 * @param {{
 *   transportNumber: string,
 *   name: string,
 *   type: 'bus'|'train',
 *   operator?: string,
 *   amenities?: string[],
 *   totalSeats?: number,
 *   vehicleNumber?: string
 * }} data
 */
export const createTransport = (data) => api.post('/transport', data);

/**
 * Update a transport (Authority only).
 * @param {string} transportId
 * @param {{ transportNumber?, name?, type?, operator?, amenities?, totalSeats?, vehicleNumber?, isActive? }} data
 */
export const updateTransport = (transportId, data) => api.put(`/transport/${transportId}`, data);

/**
 * Delete a transport (Authority only).
 * @param {string} transportId
 */
export const deleteTransport = (transportId) => api.delete(`/transport/${transportId}`);

/**
 * Assign a commuter as driver or conductor (Authority only).
 * @param {string} transportId
 * @param {{ email: string, assignRole: 'driver'|'conductor' }} data
 */
export const assignStaff = (transportId, data) => api.post(`/transport/${transportId}/assign`, data);

// ── Route (schedule) sub-resources ────────────────────────────────────────────────

/**
 * Get all routes for a transport.
 * @param {string} transportId
 */
export const getRoutes = (transportId) => api.get(`/transport/${transportId}/routes`);

/**
 * Create a new route under a transport (Authority only).
 * @param {string} transportId
 * @param {{ routeNumber, routeName, origin, destination, direction, stops, schedule, fareTable, totalDistance, estimatedDuration }} data
 */
export const createRoute = (transportId, data) => api.post(`/transport/${transportId}/routes`, data);

/**
 * Update a route (Authority only).
 * @param {string} transportId
 * @param {string} routeId
 * @param {object} data
 */
export const updateRoute = (transportId, routeId, data) =>
  api.put(`/transport/${transportId}/routes/${routeId}`, data);

/**
 * Delete a route (Authority only).
 * @param {string} transportId
 * @param {string} routeId
 */
export const deleteRoute = (transportId, routeId) =>
  api.delete(`/transport/${transportId}/routes/${routeId}`);
