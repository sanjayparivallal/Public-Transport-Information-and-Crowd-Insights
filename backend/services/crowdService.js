const CrowdLevel = require('../models/CrowdLevel');
const CrowdReport = require('../models/CrowdReport');
const Transport = require('../models/Transport');
const User = require('../models/User');
const Route = require('../models/Route');

const validateTransportUpdateAccess = async (userId, userRole, transportId) => {
  const transport = await Transport.findById(transportId)
    .select('authorityId assignedDriver assignedConductor')
    .lean();

  if (!transport) {
    const err = new Error('Transport not found');
    err.statusCode = 404;
    throw err;
  }

  const uid = String(userId);
  if (userRole === 'authority') {
    if (!transport.authorityId || String(transport.authorityId) !== uid) {
      const err = new Error('Authority can update only their own transports');
      err.statusCode = 403;
      throw err;
    }
    return transport;
  }

  if (userRole === 'driver' || userRole === 'conductor') {
    const user = await User.findById(userId).select('assignedTransport').lean();
    if (!user || !user.assignedTransport || String(user.assignedTransport) !== String(transportId)) {
      const err = new Error(`${userRole} can update only their assigned transport`);
      err.statusCode = 403;
      throw err;
    }

    const assignedField = userRole === 'driver' ? transport.assignedDriver : transport.assignedConductor;
    if (!assignedField || String(assignedField) !== uid) {
      const err = new Error(`${userRole} is not assigned to this transport`);
      err.statusCode = 403;
      throw err;
    }

    return transport;
  }

  const err = new Error('Only authority, driver, or conductor can update this transport');
  err.statusCode = 403;
  throw err;
};

/**
 * Staff (driver/conductor/authority) updates the official crowd level.
 * Uses upsert so only one live record exists per route.
 */
const updateCrowdLevel = async (userId, userRole, { transportId, routeId, crowdLevel, currentStop }) => {
  const allowed = ['driver', 'conductor', 'authority'];
  if (!allowed.includes(userRole)) {
    const err = new Error('Only driver, conductor, or authority can update crowd levels');
    err.statusCode = 403;
    throw err;
  }

  await validateTransportUpdateAccess(userId, userRole, transportId);

  const updatedByModel = userRole === 'authority' ? 'Authority' : 'User';

  const level = await CrowdLevel.findOneAndUpdate(
    { transportId, routeId },
    { transportId, routeId, crowdLevel, currentStop, updatedBy: userId, updatedByModel, updatedByRole: userRole },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // --- Smart Seat Estimation ---
  // If crowd level is updated, we should estimate available seats if not manually provided
  const transport = await Transport.findById(transportId);
  if (transport && transport.totalSeats) {
    let estimatedSeats = transport.availableSeats;
    
    if (crowdLevel === 'empty') {
      estimatedSeats = Math.floor(transport.totalSeats * 0.9); // 90% full of hope/seats
    } else if (crowdLevel === 'average') {
      estimatedSeats = Math.floor(transport.totalSeats * 0.2); // 20% seats left
    } else if (crowdLevel === 'crowded') {
      estimatedSeats = 0; // No seats
    }

    // Update Route
    await Route.findByIdAndUpdate(routeId, { availableSeats: estimatedSeats });

    // Update LivePosition if exists
    await LivePosition.findOneAndUpdate(
      { transportId, routeId },
      { availableSeats: estimatedSeats }
    );
  }

  return level;
};

/**
 * Commuter / staff / authority submits a crowd report (subjective feedback) for a route.
 */
const submitCrowdReport = async (userId, userRole, { routeId, crowdLevel, boardingStop }) => {
  const allowed = ['commuter', 'driver', 'conductor', 'authority'];
  if (!allowed.includes(userRole)) {
    const err = new Error('Only commuter, driver, conductor, or authority can submit crowd reports');
    err.statusCode = 403;
    throw err;
  }

  const report = await CrowdReport.create({
    routeId,
    reportedBy: userId,
    crowdLevel,
    boardingStop: boardingStop || null,
  });
  return report;
};

/**
 * GET aggregated crowd info for a transport (fetches via routes):
 * - Latest official CrowdLevel per route
 * - All crowd reports per routes
 */
const getCrowdForTransport = async (transportId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Fetch all routes for this transport
  const routes = await Route.find({ transportId }).select('_id origin destination').lean();
  const routeIds = routes.map(r => r._id);

  if (routeIds.length === 0) {
    return { official: [], reports: [], pagination: { total: 0, page, limit, pages: 0 } };
  }

  // Get official crowd levels for all routes
  const officials = await CrowdLevel.find({ routeId: { $in: routeIds } })
    .sort({ updatedAt: -1 })
    .populate('updatedBy', 'name role')
    .populate('routeId', 'origin destination')
    .lean();

  // Get reports for all routes
  const [reports, total] = await Promise.all([
    CrowdReport.find({ routeId: { $in: routeIds } })
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reportedBy', 'name')
      .populate('routeId', 'origin destination')
      .lean(),
    CrowdReport.countDocuments({ routeId: { $in: routeIds } })
  ]);

  return { official: officials, reports, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

module.exports = { updateCrowdLevel, submitCrowdReport, getCrowdForTransport, validateTransportUpdateAccess };
