const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// POST /api/auth/register/commuter
const registerCommuter = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }
    const result = await authService.registerCommuter({ name, email, password, phone });
    return sendSuccess(res, 201, result, 'Commuter registered successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register/authority
const registerAuthority = async (req, res, next) => {
  try {
    const { name, email, password, phone, organizationName, authorityCode, region } = req.body;
    if (!name || !email || !password || !organizationName || !authorityCode || !region) {
      return sendError(res, 400, 'Name, email, password, organizationName, authorityCode, and region are required');
    }
    const result = await authService.registerAuthority(req.body);
    return sendSuccess(res, 201, result, 'Authority registered successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }
    const result = await authService.login({ email, password });
    return sendSuccess(res, 200, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
// Body: { refreshToken: "<token>" }
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incoming } = req.body;
    if (!incoming) {
      return sendError(res, 400, 'refreshToken is required');
    }
    const result = await authService.refreshAccessToken(incoming);
    return sendSuccess(res, 200, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout  (requires valid access token)
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id, req.user.role);
    return sendSuccess(res, 200, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { registerCommuter, registerAuthority, login, refreshToken, logout };
