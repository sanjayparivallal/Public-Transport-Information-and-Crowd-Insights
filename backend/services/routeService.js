const Route     = require('../models/Route');
const Transport = require('../models/Transport');
const Authority = require('../models/Authority');
const CrowdLevel   = require('../models/CrowdLevel');
const CrowdReport  = require('../models/CrowdReport');
const LivePosition = require('../models/LivePosition');
const Incident     = require('../models/Incident');

// Verify that the requesting authority owns the given transport
const _verifyOwnership = async (userId, transportId) => {
  const authority = await Authority.findById(userId);
  if (!authority) {
    const err = new Error('Authority profile not found');
    err.statusCode = 403;
    throw err;
  }
  const transport = await Transport.findOne({ _id: transportId, authorityId: authority._id });
  if (!transport) {
    const err = new Error('Transport not found or not owned by this authority');
    err.statusCode = 404;
    throw err;
  }
  return { authority, transport };
};

// GET /api/transport/:transportId/routes
const getRoutesByTransport = async (transportId) => {
  return Route.find({ transportId }).lean();
};

// POST /api/transport/:transportId/routes
const createRoute = async (userId, transportId, data) => {
  await _verifyOwnership(userId, transportId);
  try {
    const route = await Route.create({ ...data, transportId });
    return route;
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A route with number '${data.routeNumber || 'that name'}' already exists.`);
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

// PUT /api/transport/:transportId/routes/:routeId
const updateRoute = async (userId, transportId, routeId, data) => {
  await _verifyOwnership(userId, transportId);
  try {
    const route = await Route.findOneAndUpdate(
      { _id: routeId, transportId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!route) {
      const err = new Error('Route not found');
      err.statusCode = 404;
      throw err;
    }
    return route;
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error(`A route with number '${data.routeNumber || 'that name'}' already exists.`);
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

// DELETE /api/transport/:transportId/routes/:routeId
const deleteRoute = async (userId, transportId, routeId) => {
  await _verifyOwnership(userId, transportId);
  const route = await Route.findOneAndDelete({ _id: routeId, transportId });
  if (!route) {
    const err = new Error('Route not found');
    err.statusCode = 404;
    throw err;
  }

  // Cascade delete all route-scoped data
  await Promise.all([
    CrowdLevel.deleteMany({ routeId: route._id }),
    CrowdReport.deleteMany({ routeId: route._id }),
    LivePosition.deleteMany({ routeId: route._id }),
    Incident.deleteMany({ routeId: route._id }),
  ]);

  return route;
};

module.exports = { getRoutesByTransport, createRoute, updateRoute, deleteRoute };
