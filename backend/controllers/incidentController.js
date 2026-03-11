const Incident = require('../models/Incident');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// POST /api/incidents/report  — commuter, driver, or conductor
const reportIncident = async (req, res, next) => {
  try {
    const { transportId, routeId, incidentType, severity, description, location, img } = req.body;
    if (!transportId || !routeId || !incidentType) {
      return sendError(res, 400, 'transportId, routeId, and incidentType are required');
    }

    const allowed = ['commuter', 'driver', 'conductor'];
    if (!allowed.includes(req.user.role)) {
      return sendError(res, 403, 'Authorities cannot report incidents — use the dashboard to resolve them');
    }

    // Validate base64 image if provided
    if (img && !/^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(img)) {
      return sendError(res, 400, 'img must be a valid base64 image string: data:image/<type>;base64,...');
    }

    const incident = await Incident.create({
      transportId,
      routeId,
      reportedBy:   req.user.id,
      reporterRole: req.user.role,
      incidentType,
      severity:    severity    || 'low',
      description: description || '',
      location:    location    || '',
      img:         img         || null,
    });
    return sendSuccess(res, 201, incident, 'Incident reported');
  } catch (err) {
    next(err);
  }
};

// GET /api/incidents  — authority sees all; others see only their own reports
// Query: status, severity, transportId, incidentType, page, limit
const getAllIncidents = async (req, res, next) => {
  try {
    const { status, severity, transportId, incidentType } = req.query;
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.user.role !== 'authority') {
      filter.reportedBy = req.user.id;
    }
    if (status)       filter.status       = status;
    if (severity)     filter.severity     = severity;
    if (transportId)  filter.transportId  = transportId;
    if (incidentType) filter.incidentType = incidentType;

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('transportId', 'transportNumber transportName')
        .populate('reportedBy',  'name email role')
        .populate('resolvedBy',  'name')
        .lean(),
      Incident.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
      incidents,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/incidents/:transportId  — incidents for a specific transport
// Query: status, severity, incidentType, page, limit
const getIncidentsByTransport = async (req, res, next) => {
  try {
    const { status, severity, incidentType } = req.query;
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const filter = { transportId: req.params.transportId };
    if (req.user.role !== 'authority') {
      filter.reportedBy = req.user.id;
    }
    if (status)       filter.status       = status;
    if (severity)     filter.severity     = severity;
    if (incidentType) filter.incidentType = incidentType;

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort({ reportedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name role')
        .populate('resolvedBy', 'name')
        .lean(),
      Incident.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, {
      incidents,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/incidents/:incidentId/resolve  — authority only
const resolveIncident = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['acknowledged', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, 400, `status must be one of: ${validStatuses.join(', ')}`);
    }

    const update = { status, updatedAt: new Date() };
    if (status === 'resolved') {
      update.resolvedBy = req.user.id;
      update.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(req.params.incidentId, { $set: update }, { new: true }).lean();
    if (!incident) return sendError(res, 404, 'Incident not found');
    return sendSuccess(res, 200, incident, `Incident ${status}`);
  } catch (err) {
    next(err);
  }
};

module.exports = { reportIncident, getAllIncidents, getIncidentsByTransport, resolveIncident };
