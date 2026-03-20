const mongoose = require('mongoose');
const Incident = require('./backend/models/Incident');

mongoose.connect('mongodb://127.0.0.1:27017/pti-db').then(async () => {
  try {
    const incs = await Incident.find().limit(2)
      .populate('transportId', 'transportNumber name')
      .populate('reportedBy',  'name email role')
      .populate('resolvedBy',  'name')
      .lean();
    console.log("INCIDENTS:", JSON.stringify(incs, null, 2));
  } catch(e) {
    console.error("ERROR:", e);
  }
  process.exit(0);
});
