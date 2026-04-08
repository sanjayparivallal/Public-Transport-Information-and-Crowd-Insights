const mongoose = require('mongoose');
require('dotenv').config();
const Transport = require('./models/Transport');
const Incident = require('./models/Incident');

async function cleanDoc(doc) {
  if (!doc) return null;
  const copy = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete copy.__v;
  return copy;
}

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  // Find an authority that has incidents
  const incidentsAll = await Incident.find({}).populate('transportId');
  if (incidentsAll.length === 0) {
      console.log("No incidents at all in DB!");
      process.exit();
  }
  const sampleIncident = incidentsAll[0];
  const t = sampleIncident.transportId;
  const authorityId = String(t.authorityId);
  
  console.log(`Testing with authorityId: ${authorityId}`);

  // copy logic from fetchIncidents
  try {
    const managedTransports = await Transport.find({ authorityId }, '_id').lean();
    const tIds = managedTransports.map((t) => t._id);
    console.log(`Found ${tIds.length} managed transports for this authority`);
    const query = { transportId: { $in: tIds } };

    const incidents = await Incident.find(query)
      .sort({ reportedAt: -1 })
      .populate('transportId', 'transportNumber name')
      .populate('reportedBy',  'name role')
      .select('-img')
      .lean();
    console.log(`Found ${incidents.length} incidents in backend logic!`);
  } catch (e) {
      console.error("ERROR during backend logic", e);
  }
  process.exit();
}
test();
