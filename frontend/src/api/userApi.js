import api from './axiosInstance';

/**
 * Get the logged-in user's profile (with authority profile if applicable).
 */
export const getProfile = () => api.get('/users/profile');

/**
 * Update the logged-in user's profile.
 * @param {{ name?: string, phone?: string, password?: string }} data
 */
export const updateProfile = (data) => api.put('/users/profile', data);

/**
 * Add a transport route to the commuter's favourites.
 * @param {string} routeId
 */
export const addFavourite = (routeId) => api.post(`/users/favourites/${routeId}`);

/**
 * Remove a transport route from the commuter's favourites.
 * @param {string} routeId
 */
export const removeFavourite = (routeId) => api.delete(`/users/favourites/${routeId}`);
