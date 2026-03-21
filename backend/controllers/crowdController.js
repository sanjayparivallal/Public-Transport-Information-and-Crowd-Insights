const crowdService = require('../services/crowdService');
const LivePosition = require('../models/LivePosition');
const Transport = require('../models/Transport');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// POST /api/crowd/report  — commuter submits crowd feedback for a route
const submitCrowdReport = async (req, res, next) => {
  try {
    const { routeId, crowdLevel, boardingStop } = req.body;
    if (!routeId || !crowdLevel) {
      return sendError(res, 400, 'routeId and crowdLevel are required');
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
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const data = await crowdService.getCrowdForTransport(req.params.transportId, page, limit);
    return sendSuccess(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// PUT /api/crowd/level  — driver / conductor / authority updates official crowd level
const updateCrowdLevel = async (req, res, next) => {
  try {
    const { transportId, routeId, crowdLevel, currentStop } = req.body;
    if (!transportId || !routeId || !crowdLevel) {
      return sendError(res, 400, 'transportId, routeId, and crowdLevel are required');
    }
    const level = await crowdService.updateCrowdLevel(req.user.id, req.user.role, req.body);
    return sendSuccess(res, 200, level, 'Crowd level updated');
  } catch (err) {
    next(err);
  }
};

// PUT /api/crowd/live  — driver / conductor / authority updates live position
const updateLivePosition = async (req, res, next) => {
  try {
    const { transportId, routeId, currentStop, nextStop, stopIndex, delayMinutes, status, availableSeats } = req.body;
    if (!transportId || !routeId) {
      return sendError(res, 400, 'transportId and routeId are required');
    }
    const allowed = ['driver', 'conductor', 'authority'];
    if (!allowed.includes(req.user.role)) {
      return sendError(res, 403, 'Only driver, conductor, or authority can update live position');
    }

    await crowdService.validateTransportUpdateAccess(req.user.id, req.user.role, transportId);

    const updatedByModel = req.user.role === 'authority' ? 'Authority' : 'User';

    const position = await LivePosition.findOneAndUpdate(
      { transportId, routeId },
      {
        transportId,
        routeId,
        currentStop,
        nextStop,
        stopIndex:    stopIndex    ?? 0,
        delayMinutes: delayMinutes ?? 0,
        status:       status       || 'on-time',
        updatedByModel,
        updatedBy:     req.user.id,
        updatedByRole: req.user.role,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update the available seats on the specific route and transport
    if (availableSeats !== undefined) {
      const Route = require('../models/Route');
      await Route.findByIdAndUpdate(
        routeId,
        { availableSeats },
        { new: false }
      );
    }

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

// DELETE /api/crowd/report/:id  — authority or owner
const deleteCrowdReport = async (req, res, next) => {
  try {
    const CrowdReport = require('../models/CrowdReport');
    const report = await CrowdReport.findById(req.params.id);
    if (!report) return sendError(res, 404, 'Crowd report not found');

    // Check ownership or authority role
    if (req.user.role !== 'authority' && String(report.reportedBy) !== req.user.id) {
      return sendError(res, 403, 'You can only delete your own reports');
    }

    await CrowdReport.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, null, 'Crowd report deleted successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/crowd/my-reports  — commuter gets their submitted reports
const getMyCrowdReports = async (req, res, next) => {
  try {
    const CrowdReport = require('../models/CrowdReport');
    const Route = require('../models/Route');
    
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      CrowdReport.find({ reportedBy: req.user.id })
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'routeId',
          select: 'origin destination transportId',
          populate: { path: 'transportId', select: 'name transportNumber type' }
        })
        .lean(),
      CrowdReport.countDocuments({ reportedBy: req.user.id })
    ]);

    // Format for frontend
    const formattedReports = reports.map(r => ({
      ...r,
      transport: r.routeId?.transportId || null
    }));

    return sendSuccess(res, 200, {
      reports: formattedReports,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitCrowdReport, getCrowd, updateCrowdLevel, updateLivePosition, getLivePosition, deleteCrowdReport, getMyCrowdReports };
