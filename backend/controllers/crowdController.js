const crowdService = require('../services/crowdService');
const LivePosition = require('../models/LivePosition');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// POST /api/crowd/report  — commuter submits crowd feedback
const submitCrowdReport = async (req, res, next) => {
  try {
    const { transportId, routeId, crowdLevel, boardingStop } = req.body;
    if (!transportId || !routeId || !crowdLevel) {
      return sendError(res, 400, 'transportId, routeId, and crowdLevel are required');
    }
    const report = await crowdService.submitCrowdReport(req.user.id, req.user.role, req.body);
    return sendSuccess(res, 201, report, 'Crowd report submitted');
  } catch (err) {
    next(err);
  }
};

// GET /api/crowd/:transportId  — aggregated crowd for a transport
const getCrowd = async (req, res, next) => {
  try {
    const data = await crowdService.getCrowdForTransport(req.params.transportId);
    return sendSuccess(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// PUT /api/crowd/level  — driver / conductor / authority updates official crowd level
const updateCrowdLevel = async (req, res, next) => {
  try {
    const { transportId, routeId, tripId, crowdLevel, currentStop } = req.body;
    if (!transportId || !routeId || !tripId || !crowdLevel) {
      return sendError(res, 400, 'transportId, routeId, tripId, and crowdLevel are required');
    }
    const level = await crowdService.updateCrowdLevel(req.user.id, req.user.role, req.body);
    return sendSuccess(res, 200, level, 'Crowd level updated');
  } catch (err) {
    next(err);
  }
};

// PUT /api/crowd/live  — driver / conductor updates live position
const updateLivePosition = async (req, res, next) => {
  try {
    const { transportId, routeId, tripId, currentStop, nextStop, stopIndex, delayMinutes, status } = req.body;
    if (!transportId || !routeId || !tripId) {
      return sendError(res, 400, 'transportId, routeId, and tripId are required');
    }
    const allowed = ['driver', 'conductor'];
    if (!allowed.includes(req.user.role)) {
      return sendError(res, 403, 'Only driver or conductor can update live position');
    }

    const position = await LivePosition.findOneAndUpdate(
      { transportId, tripId },
      {
        transportId,
        routeId,
        tripId,
        currentStop,
        nextStop,
        stopIndex:    stopIndex    ?? 0,
        delayMinutes: delayMinutes ?? 0,
        status:       status       || 'on-time',
        updatedBy:     req.user.id,
        updatedByRole: req.user.role,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return sendSuccess(res, 200, position, 'Live position updated');
  } catch (err) {
    next(err);
  }
};

// GET /api/crowd/live/:transportId  — get live position for a transport
const getLivePosition = async (req, res, next) => {
  try {
    const position = await LivePosition.findOne({ transportId: req.params.transportId })
      .sort({ updatedAt: -1 })
      .populate('updatedBy', 'name role')
      .lean();
    return sendSuccess(res, 200, position || null);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitCrowdReport, getCrowd, updateCrowdLevel, updateLivePosition, getLivePosition };
