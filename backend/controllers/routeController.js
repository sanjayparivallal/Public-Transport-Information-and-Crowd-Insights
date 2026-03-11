const routeService = require('../services/routeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/transport/:transportId/routes
const getRoutes = async (req, res, next) => {
  try {
    const routes = await routeService.getRoutesByTransport(req.params.transportId);
    return sendSuccess(res, 200, routes);
  } catch (err) {
    next(err);
  }
};

// POST /api/transport/:transportId/routes
const createRoute = async (req, res, next) => {
  try {
    const { routeNumber, routeName, origin, destination } = req.body;
    if (!routeNumber || !routeName || !origin || !destination) {
      return sendError(res, 400, 'routeNumber, routeName, origin, and destination are required');
    }
    const route = await routeService.createRoute(req.user.id, req.params.transportId, req.body);
    return sendSuccess(res, 201, route, 'Route created');
  } catch (err) {
    next(err);
  }
};

// PUT /api/transport/:transportId/routes/:routeId
const updateRoute = async (req, res, next) => {
  try {
    const route = await routeService.updateRoute(req.user.id, req.params.transportId, req.params.routeId, req.body);
    return sendSuccess(res, 200, route, 'Route updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transport/:transportId/routes/:routeId
const deleteRoute = async (req, res, next) => {
  try {
    await routeService.deleteRoute(req.user.id, req.params.transportId, req.params.routeId);
    return sendSuccess(res, 200, null, 'Route deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoutes, createRoute, updateRoute, deleteRoute };
