/**
 * Ensures all 8 MongoDB collections exist (creates empty ones if missing).
 * Safe to run multiple times — createCollection is a no-op if already exists.
 *
 * Usage:  node backend/scripts/createCollections.js
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');

// All collection names used by the app (Mongoose lowercases + pluralises model names)
const COLLECTIONS = [
  'users',
  'authorities',
  'transports',
  'routes',
  'livepositions',
  'crowdlevels',
  'crowdreports',
  'incidents',
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✔ Connected to MongoDB');

  const db = mongoose.connection.db;
  const existing = (await db.listCollections().toArray()).map((c) => c.name);

  for (const name of COLLECTIONS) {
    if (existing.includes(name)) {
      console.log(`  ─  ${name} (already exists)`);
    } else {
      await db.createCollection(name);
      console.log(`  ✔  ${name} created`);
    }
  }

  await mongoose.disconnect();
  console.log('\n✔ Done');
})().catch((err) => {
  console.error('Failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
