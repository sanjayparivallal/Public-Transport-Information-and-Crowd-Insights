const mongoose = require('mongoose');
require('dotenv').config();

const Transport = require('./models/Transport');
const Route = require('./models/Route');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const routes = await Route.find();
    console.log(`Processing ${routes.length} routes...`);

    let updatedCount = 0;
    for (const r of routes) {
      if (r.availableSeats === undefined || r.availableSeats === null) {
        const t = await Transport.findById(r.transportId);
        if (t && t.totalSeats) {
          r.availableSeats = t.totalSeats;
          await r.save();
          updatedCount++;
        }
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} routes.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
