const Transport  = require('../models/Transport');
const Authority  = require('../models/Authority');
const Route      = require('../models/Route');
const User       = require('../models/User');
const CrowdLevel = require('../models/CrowdLevel');
const CrowdReport = require('../models/CrowdReport');
const LivePosition = require('../models/LivePosition');

/**
 * GET /api/transport/search
 * Query params: busNo, type, origin, destination, departureTime,
 *               authorityId, myTransports (bool — authority only),
 *               page, limit
 */
const searchTransports = async ({
  busNo,
  type,
  origin,
  destination,
  departureTime,
  authorityId,
  myTransports,
  userId,
  page  = 1,
  limit = 20,
}) => {
  const safePage  = Math.max(1, parseInt(page,  10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip      = (safePage - 1) * safeLimit;
  const mongoose  = require('mongoose');

  // Stage 1: filter routes
  const routeMatch = {};
  if (origin)        routeMatch.origin      = { $regex: origin, $options: 'i' };
  if (destination)   routeMatch.destination = { $regex: destination, $options: 'i' };
  if (departureTime) routeMatch['schedule.departureTime'] = departureTime;

  const pipeline = [{ $match: routeMatch }];

  // Stage 2: join Transport
  pipeline.push({
    $lookup: {
      from: 'transports',
      localField: 'transportId',
      foreignField: '_id',
      as: 'transportId',
    },
  });
  pipeline.push({ $unwind: '$transportId' });

  // Stage 3: filter on transport fields
  const transportMatch = { 'transportId.isActive': true };
  if (busNo) {
    if (!transportMatch.$or) transportMatch.$or = [];
    transportMatch.$or.push(
      { 'transportId.transportNumber': { $regex: busNo, $options: 'i' } },
      { 'transportId.name': { $regex: busNo, $options: 'i' } }
    );
  }
  if (type)  transportMatch['transportId.type'] = type;
  if (myTransports && userId && mongoose.isValidObjectId(userId)) {
    transportMatch['transportId.authorityId'] = new mongoose.Types.ObjectId(String(userId));
  } else if (authorityId && mongoose.isValidObjectId(authorityId)) {
    transportMatch['transportId.authorityId'] = new mongoose.Types.ObjectId(String(authorityId));
  }
  pipeline.push({ $match: transportMatch });

  // Stage 4: join Authority for display
  pipeline.push({
    $lookup: {
      from: 'authorities',
      localField: 'transportId.authorityId',
      foreignField: '_id',
      as: '_authority',
    },
  });
  pipeline.push({
    $addFields: { 'transportId.authorityId': { $arrayElemAt: ['$_authority', 0] } },
  });
  pipeline.push({ $unset: '_authority' });

  // Stage 5: count total before pagination
  const [countResult] = await Route.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult?.total || 0;

  // Stage 6: paginate
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: safeLimit });

  // Stage 7: strip sensitive fields
  pipeline.push({
    $project: {
      'transportId.authorityId.passwordHash':     0,
      'transportId.authorityId.refreshTokenHash': 0,
    },
  });

  const routes = await Route.aggregate(pipeline);

  // Attach latest crowd level for the SPECIFIC route
  const results = await Promise.all(
    routes.map(async (route) => {
      const crowd = await CrowdLevel.findOne({ routeId: route._id })
        .sort({ updatedAt: -1 })
        .select('crowdLevel updatedAt')
        .lean();
      return { ...route, crowdLevel: crowd?.crowdLevel || null };
    })
  );

  return {
    results,
    pagination: { total, page: safePage, limit: safeLimit, pages: Math.ceil(total / safeLimit) },
  };
};

/**
 * GET /api/transport/:id  — full details
 */
const getTransportById = async (id) => {
  const mongoose = require('mongoose');
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error('Invalid Transport ID');
    err.statusCode = 400;
    throw err;
  }

  const transport = await Transport.findById(id)
    .populate('authorityId', 'organizationName region authorityCode')
    .populate('assignedDriver', 'name email phone')
    .populate('assignedConductor', 'name email phone')
    .lean();
  if (!transport) {
    const err = new Error('Transport not found');
    err.statusCode = 404;
    throw err;
  }

  const routes     = await Route.find({ transportId: id }).lean();
  
  const crowdLevels = await CrowdLevel.find({ transportId: id })
    .select('routeId crowdLevel updatedAt')
    .lean();
  const livePositions = await LivePosition.find({ transportId: id })
    .select('routeId currentStop nextStop stopIndex delayMinutes status updatedAt')
    .lean();

  const enrichedRoutes = routes.map(route => {
    const c = crowdLevels.find(cl => String(cl.routeId) === String(route._id));
    const lp = livePositions.find(l => String(l.routeId) === String(route._id));
    return {
      ...route,
      crowdLevel: c?.crowdLevel || null,
      livePosition: lp || null,
    };
  });

  // the first route is typically forward, but maintaining null if undefined
  const firstRoute = enrichedRoutes[0];

  return {
    ...transport,
    routes: enrichedRoutes,
    crowdLevel: firstRoute?.crowdLevel || null,
    livePosition: firstRoute?.livePosition || null,
  };
};

/**
 * POST /api/transport — Authority creates a transport
 */
const createTransport = async (userId, { transportNumber, name, type, operator, amenities, totalSeats, availableSeats, vehicleNumber }) => {
  const authority = await Authority.findById(userId);
  if (!authority) {
    const err = new Error('Authority profile not found');
    err.statusCode = 403;
    throw err;
  }

  const transport = await Transport.create({
    transportNumber,
    name,
    type,
    operator:      operator      || undefined,
    amenities:     amenities     || [],
    totalSeats:    totalSeats    || undefined,
    availableSeats: availableSeats ?? null,
    vehicleNumber: vehicleNumber || undefined,
    authorityId: authority._id,
  });

  await Authority.findByIdAndUpdate(
    authority._id,
    { $addToSet: { managedTransports: transport._id } },
    { returnDocument: 'after' }
  );

  return transport;
};

/**
 * PUT /api/transport/:id — Authority edits a transport
 */
const updateTransport = async (userId, transportId, updates) => {
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

  const allowed = ['transportNumber', 'name', 'type', 'operator', 'amenities', 'totalSeats', 'availableSeats', 'vehicleNumber', 'isActive'];
  allowed.forEach((f) => {
    if (updates[f] !== undefined) transport[f] = updates[f];
  });
  await transport.save();
  return transport;
};

/**
 * DELETE /api/transport/:id — Authority deletes a transport
 */
const deleteTransport = async (userId, transportId) => {
  const authority = await Authority.findById(userId);
  if (!authority) {
    const err = new Error('Authority profile not found');
    err.statusCode = 403;
    throw err;
  }

  const transport = await Transport.findOneAndDelete({ _id: transportId, authorityId: authority._id });
  if (!transport) {
    const err = new Error('Transport not found or not owned by this authority');
    err.statusCode = 404;
    throw err;
  }

  // Cascade delete all related documents
  const routeIds = (await Route.find({ transportId: transport._id }).select('_id').lean()).map(r => r._id);
  
  await Promise.all([
    Route.deleteMany({ transportId: transport._id }),
    CrowdLevel.deleteMany({ routeId: { $in: routeIds } }),
    CrowdReport.deleteMany({ routeId: { $in: routeIds } }),
    LivePosition.deleteMany({ routeId: { $in: routeIds } }),
    User.updateMany(
      { assignedTransport: transport._id },
      { $set: { assignedTransport: null, assignedBy: null, assignedAt: null } }
    ),
    Authority.findByIdAndUpdate(
      authority._id,
      { $pull: { managedTransports: transport._id } },
      { returnDocument: 'after' }
    ),
  ]);

  return transport;
};

/**
 * POST /api/transport/:id/assign
 * Assign a commuter as driver or conductor for this transport.
 * Searches by email, elevates role.
 */
const assignStaff = async (authorityUserId, transportId, { email, assignRole }) => {
  if (!['driver', 'conductor'].includes(assignRole)) {
    const err = new Error('assignRole must be "driver" or "conductor"');
    err.statusCode = 400;
    throw err;
  }

  const authority = await Authority.findById(authorityUserId);
  if (!authority) {
    const err = new Error('Authority profile not found');
    err.statusCode = 403;
    throw err;
  }

  // Verify the authority owns this transport
  const transport = await Transport.findOne({ _id: transportId, authorityId: authority._id });
  if (!transport) {
    const err = new Error('Transport not found or not owned by this authority');
    err.statusCode = 404;
    throw err;
  }

  const staffUser = await User.findOne({ email });
  if (!staffUser) {
    const err = new Error('No user found with that email');
    err.statusCode = 404;
    throw err;
  }
  if (!['commuter', 'driver', 'conductor'].includes(staffUser.role)) {
    const err = new Error('This user cannot be assigned as staff');
    err.statusCode = 400;
    throw err;
  }

  // Remove from previous managed lists (in case of re-assignment)
  await Authority.findByIdAndUpdate(
    authority._id,
    { $pull: { managedDrivers: staffUser._id, managedConductors: staffUser._id } },
    { returnDocument: 'after' }
  );

  // Update user
  staffUser.role             = assignRole;
  staffUser.assignedTransport = transport._id;
  staffUser.assignedBy        = authorityUserId;
  staffUser.assignedAt        = new Date();
  await staffUser.save();

  // Update authority managed lists
  const listField = assignRole === 'driver' ? 'managedDrivers' : 'managedConductors';
  await Authority.findByIdAndUpdate(
    authority._id,
    { $addToSet: { [listField]: staffUser._id } },
    { returnDocument: 'after' }
  );

  // Mirror assignment on the transport document
  const transportField = assignRole === 'driver' ? 'assignedDriver' : 'assignedConductor';
  await Transport.findByIdAndUpdate(
    transport._id,
    { [transportField]: staffUser._id },
    { returnDocument: 'after' }
  );

  return {
    assignedUser: { id: staffUser._id, name: staffUser.name, email: staffUser.email, role: staffUser.role },
    transport:    { id: transport._id, transportNumber: transport.transportNumber },
  };
};

/**
 * GET /api/transport/mine — Authority gets their own transports (flat list)
 * Returns Transport documents directly, not Route documents.
 */
const getMyTransports = async (userId) => {
  const authority = await Authority.findById(userId);
  if (!authority) {
    const err = new Error('Authority profile not found');
    err.statusCode = 403;
    throw err;
  }
  const transports = await Transport.find({ authorityId: authority._id })
    .populate('assignedDriver',    'name email phone')
    .populate('assignedConductor', 'name email phone')
    .lean();
  return { transports, total: transports.length };
};

/**
 * DELETE /api/transport/:id/unassign/:role
 * Unassign a driver or conductor from this transport.
 */
const unassignStaff = async (authorityUserId, transportId, assignRole) => {
  if (!['driver', 'conductor'].includes(assignRole)) {
    const err = new Error('assignRole must be "driver" or "conductor"');
    err.statusCode = 400;
    throw err;
  }

  const authority = await Authority.findById(authorityUserId);
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

  const transportField = assignRole === 'driver' ? 'assignedDriver' : 'assignedConductor';
  const staffUserId = transport[transportField];

  if (!staffUserId) {
    const err = new Error(`No ${assignRole} is currently assigned to this transport`);
    err.statusCode = 400;
    throw err;
  }

  const staffUser = await User.findById(staffUserId);

  // 1. Remove from transport document
  await Transport.findByIdAndUpdate(
    transport._id,
    { $unset: { [transportField]: "" } },
    { returnDocument: 'after' }
  );

  // 2. Remove from authority managed list
  const listField = assignRole === 'driver' ? 'managedDrivers' : 'managedConductors';
  await Authority.findByIdAndUpdate(
    authority._id,
    { $pull: { [listField]: staffUserId } },
    { returnDocument: 'after' }
  );

  // 3. Reset user profile
  if (staffUser) {
    staffUser.role = 'commuter';
    staffUser.assignedTransport = undefined;
    staffUser.assignedBy = undefined;
    staffUser.assignedAt = undefined;
    await staffUser.save();
  }

  return { message: `${assignRole} unassigned successfully` };
};

module.exports = {
  searchTransports,
  getTransportById,
  getMyTransports,
  createTransport,
  updateTransport,
  deleteTransport,
  assignStaff,
  unassignStaff,
};
