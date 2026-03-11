import api from './axiosInstance';

/**
 * Register a new commuter account.
 * @param {{ name: string, email: string, password: string, phone?: string }} data
 * @returns {Promise<{ data: { accessToken, refreshToken, user } }>}
 */
export const registerCommuter = (data) => api.post('/auth/register/commuter', data);

/**
 * Register a new authority account.
 * @param {{ name, email, password, organizationName, authorityCode, region, ... }} data
 * @returns {Promise<{ data: { accessToken, refreshToken, user, authority } }>}
 */
export const registerAuthority = (data) => api.post('/auth/register/authority', data);

/**
 * Log in with any role (commuter / authority / driver / conductor).
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ data: { accessToken: string, refreshToken: string, user: object } }>}
 */
export const loginUser = (credentials) => api.post('/auth/login', credentials);

/**
 * Exchange a refresh token for a new access token (+ rotated refresh token).
 * This call does NOT need the Authorization header.
 * @param {string} refreshToken
 * @returns {Promise<{ data: { accessToken: string, refreshToken: string, user: object } }>}
 */
export const refreshAccessToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

/**
 * Log out — clears the server-side refresh token hash.
 * Requires a valid (non-expired) access token in the Authorization header.
 */
export const logoutUser = () => api.post('/auth/logout');
