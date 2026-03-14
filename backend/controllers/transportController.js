const transportService = require('../services/transportService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/transport/search
// Query: busNo, type, origin, destination, departureTime, myTransports, authorityId, page, limit
const searchTransports = async (req, res, next) => {
  try {
    const { busNo, type, origin, destination, departureTime, myTransports, page, limit } = req.query;

    let resolvedAuthorityId = req.query.authorityId || undefined;

    // If the logged-in user is an authority and myTransports=true, scope to their transports.
    // For authority tokens req.user.id IS the authority._id directly.
    if (myTransports === 'true' && req.user.role === 'authority') {
      resolvedAuthorityId = req.user.id;
    }

    const data = await transportService.searchTransports({
      busNo,
      type,
      origin,
      destination,
      departureTime,
      authorityId: resolvedAuthorityId,
      page,
      limit,
    });
    return sendSuccess(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/transport/mine — Authority: get own transports as flat list
const getMyTransports = async (req, res, next) => {
  try {
    const data = await transportService.getMyTransports(req.user.id);
    return sendSuccess(res, 200, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/transport/:id
const getTransportById = async (req, res, next) => {
  try {
    const transport = await transportService.getTransportById(req.params.id);
    return sendSuccess(res, 200, transport);
  } catch (err) {
    next(err);
  }
};

// POST /api/transport
const createTransport = async (req, res, next) => {
  try {
    const { transportNumber, name, type } = req.body;
    if (!transportNumber || !name || !type) {
      return sendError(res, 400, 'transportNumber, name, and type are required');
    }
    const transport = await transportService.createTransport(req.user.id, req.body);
    return sendSuccess(res, 201, transport, 'Transport created');
  } catch (err) {
    next(err);
  }
};

// PUT /api/transport/:id
const updateTransport = async (req, res, next) => {
  try {
    const transport = await transportService.updateTransport(req.user.id, req.params.id, req.body);
    return sendSuccess(res, 200, transport, 'Transport updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transport/:id
const deleteTransport = async (req, res, next) => {
  try {
    await transportService.deleteTransport(req.user.id, req.params.id);
    return sendSuccess(res, 200, null, 'Transport deleted');
  } catch (err) {
    next(err);
  }
};

// POST /api/transport/:id/assign
const assignStaff = async (req, res, next) => {
  try {
    const { email, assignRole } = req.body;
    if (!email || !assignRole) {
      return sendError(res, 400, 'email and assignRole are required');
    }
    const result = await transportService.assignStaff(req.user.id, req.params.id, { email, assignRole });
    return sendSuccess(res, 200, result, `${assignRole} assigned successfully`);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transport/:id/unassign/:role
const unassignStaff = async (req, res, next) => {
  try {
    const { role } = req.params;
    const result = await transportService.unassignStaff(req.user.id, req.params.id, role);
    return sendSuccess(res, 200, result, result.message);
  } catch (err) {
    next(err);
  }
};

module.exports = { searchTransports, getTransportById, getMyTransports, createTransport, updateTransport, deleteTransport, assignStaff, unassignStaff };
