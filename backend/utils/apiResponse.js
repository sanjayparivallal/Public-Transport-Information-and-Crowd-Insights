/**
 * Send a standardised success response.
 */
const sendSuccess = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Send a standardised error response.
 */
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
