const CrowdLevel  = require('../models/CrowdLevel');
const CrowdReport = require('../models/CrowdReport');
const Transport   = require('../models/Transport');
const Route       = require('../models/Route');

/**
 * Staff (driver/conductor/authority) updates the official crowd level.
 * Uses upsert so only one live record exists per tripId.
 */
const updateCrowdLevel = async (userId, userRole, { transportId, routeId, tripId, crowdLevel, currentStop }) => {
  const allowed = ['driver', 'conductor', 'authority'];
  if (!allowed.includes(userRole)) {
    const err = new Error('Only driver, conductor, or authority can update crowd levels');
    err.statusCode = 403;
    throw err;
  }

  const updatedByModel = userRole === 'authority' ? 'Authority' : 'User';

  const level = await CrowdLevel.findOneAndUpdate(
    { transportId, tripId },
    { transportId, routeId, tripId, crowdLevel, currentStop, updatedBy: userId, updatedByModel, updatedByRole: userRole },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return level;
};

/**
 * Commuter submits a crowd report (subjective feedback).
 */
const submitCrowdReport = async (userId, userRole, { transportId, routeId, crowdLevel, boardingStop }) => {
  if (userRole !== 'commuter') {
    const err = new Error('Only commuters can submit crowd reports');
    err.statusCode = 403;
    throw err;
  }

  const report = await CrowdReport.create({
    transportId,
    routeId,
    reportedBy: userId,
    crowdLevel,
    boardingStop: boardingStop || null,
  });
  return report;
};

/**
 * GET aggregated crowd info for a transport:
 * - Latest official CrowdLevel
 * - Last 50 crowd reports (for authority analysis)
 */
const getCrowdForTransport = async (transportId) => {
  const official = await CrowdLevel.findOne({ transportId })
    .sort({ updatedAt: -1 })
    .populate('updatedBy', 'name role')
    .lean();

  const reports = await CrowdReport.find({ transportId })
    .sort({ reportedAt: -1 })
    .limit(50)
    .populate('reportedBy', 'name')
    .lean();

  return { official, reports };
};

module.exports = { updateCrowdLevel, submitCrowdReport, getCrowdForTransport };
