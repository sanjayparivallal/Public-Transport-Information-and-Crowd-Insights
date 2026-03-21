const mongoose = require('mongoose');
require('dotenv').config();

const Transport = require('./models/Transport');
const CrowdLevel = require('./models/CrowdLevel');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const t = await Transport.findOne({ transportNumber: 'BUS-0014' }).lean();
    if (!t) { console.log('BUS-0014 not found'); process.exit(0); }
    
    console.log('Transport ID:', t._id);
    console.log('Available Seats:', t.availableSeats);
    console.log('Total Seats:', t.totalSeats);
    
    const crowds = await CrowdLevel.find({ transportId: t._id }).sort({ updatedAt: -1 }).lean();
    console.log('Crowd Levels found:', crowds.length);
    if (crowds.length > 0) {
      console.log('Latest Crowd Level:', crowds[0].crowdLevel);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
