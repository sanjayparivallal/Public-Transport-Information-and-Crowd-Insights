/**
 * One-time script: replace searchTransports with aggregation pipeline.
 * Run: node scripts/fixSearch.js
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../services/transportService.js');
let content = fs.readFileSync(filePath, 'utf8');

const fnStart = content.indexOf('const searchTransports');
// Find the blank line + jsdoc that starts the next function
const nextFnMarker = '\r\n/**\r\n * GET /api/transport/:id';
const fnEnd = content.indexOf(nextFnMarker, fnStart);

if (fnStart === -1 || fnEnd === -1) {
  console.error('Could not locate function boundaries');
  process.exit(1);
}

const newFn = `const searchTransports = async ({
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
  if (busNo) transportMatch['transportId.transportNumber'] = { $regex: busNo, $options: 'i' };
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

  // Attach latest crowd level (small result set after pagination)
  const results = await Promise.all(
    routes.map(async (route) => {
      const crowd = await CrowdLevel.findOne({ transportId: route.transportId._id })
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
`;

const newContent = content.substring(0, fnStart) + newFn + content.substring(fnEnd);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('searchTransports replaced successfully.');
console.log('Old length:', content.length, '-> New length:', newContent.length);
