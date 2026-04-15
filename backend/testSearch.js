const mongoose = require('mongoose');
require('dotenv').config();
const { searchTransports } = require('./services/transportService');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  try {
    const res = await searchTransports({ origin: 'salem', type: 'bus' });
    console.log("Results count:", res.results.length);
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
}
test();
