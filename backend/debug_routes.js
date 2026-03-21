const mongoose = require('mongoose');
require('dotenv').config();

const Transport = require('./models/Transport');
const Route = require('./models/Route');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const routes = await Route.find().populate('transportId').limit(10).lean();
    for (const r of routes) {
      console.log(`Route: ${r.origin} -> ${r.destination}, Seats: ${r.availableSeats}, TransportTotal: ${r.transportId?.totalSeats}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
