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
 * Add a transport to the commuter's favourites.
 * @param {string} transportId
 */
export const addFavourite = (transportId) => api.post(`/users/favourites/${transportId}`);

/**
 * Remove a transport from the commuter's favourites.
 * @param {string} transportId
 */
export const removeFavourite = (transportId) => api.delete(`/users/favourites/${transportId}`);
