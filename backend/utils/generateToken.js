const jwt = require('jsonwebtoken');

/**
 * Short-lived access token (default 15 min).
 * Payload: { id, role }
 */
const generateAccessToken = (id, role) => {
  return jwt.sign(
    { id: id.toString(), role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Long-lived refresh token (default 7 days).
 * Payload: { id, role } — role is embedded so refresh knows which collection to query.
 */
const generateRefreshToken = (id, role) => {
  return jwt.sign(
    { id: id.toString(), role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
