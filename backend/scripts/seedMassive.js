/**
 * Huge Seed script
 * Creates 7 authorities, 500 commuters, 250 drivers, 275 conductors,
 * 200 buses, 100 trains, and various mock incidents using real local images.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Adjust to match wherever .env is located
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Authority = require('../models/Authority');
const User = require('../models/User');
const Transport = require('../models/Transport');
const Route = require('../models/Route');
const LivePosition = require('../models/LivePosition');
const CrowdLevel = require('../models/CrowdLevel');
const CrowdReport = require('../models/CrowdReport');
const Incident = require('../models/Incident');

const PLAIN_PASSWORD = 'Test@1234';

const SEED_IMG_DIR = 'd:\\Public-Transport-Information-and-Crowd-Insights\\seed img';
const TN_CITIES = ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupattur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'];
function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1. Convert local images to base64
function getBase64Images() {
  const images = [];
  try {
    const files = fs.readdirSync(SEED_IMG_DIR);
    for (const f of files) {
      if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
        const ext = f.endsWith('.png') ? 'png' : 'jpeg';
        const buffer = fs.readFileSync(path.join(SEED_IMG_DIR, f));
        const base64 = buffer.toString('base64');
        images.push(`data:image/${ext};base64,${base64}`);
      }
    }
  } catch (err) {
    console.warn("Could not read seed directory:", err.message);
  }
  return images;
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  console.log('Dropping old database to clear legacy indexes...');
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped successfully.');

  const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, 12);

  // ---------- AUTHORITIES ----------
  console.log('Creating Authorities...');
  const authDefs = [
    { name: 'TNSTC – Villupuram', authorityCode: 'TNSTC-VPM', email: 'vpm@tnstc.in', region: 'Villupuram' },
    { name: 'TNSTC – Kumbakonam', authorityCode: 'TNSTC-KUM', email: 'kum@tnstc.in', region: 'Kumbakonam' },
    { name: 'TNSTC – Salem', authorityCode: 'TNSTC-SLM', email: 'slm@tnstc.in', region: 'Salem' },
    { name: 'TNSTC – Coimbatore', authorityCode: 'TNSTC-CBE', email: 'cbe@tnstc.in', region: 'Coimbatore' },
    { name: 'TNSTC – Madurai', authorityCode: 'TNSTC-MDU', email: 'mdu@tnstc.in', region: 'Madurai' },
    { name: 'TNSTC – Tirunelveli', authorityCode: 'TNSTC-TNV', email: 'tnv@tnstc.in', region: 'Tirunelveli' },
    { name: 'TNSTC – Dindigul', authorityCode: 'TNSTC-DGL', email: 'dgl@tnstc.in', region: 'Dindigul' },
  ];
  const authorities = [];
  for (const def of authDefs) {
    const auth = await Authority.create({
      ...def,
      passwordHash: PLAIN_PASSWORD, // Authority pre-save hook will hash it
      organizationName: def.name,
      contactEmail: def.email,
      contactPhone: '044-12345678',
      coveredDistricts: [def.region],
      officeAddress: `Main Depot, ${def.region}, Tamil Nadu`
    });
    authorities.push(auth);
  }
  console.log(`Created ${authorities.length} authorities.`);

  // ---------- USERS ----------
  console.log('Creating 500 commuters, 250 drivers, 275 conductors...');
  const usersToInsert = [];
  for (let i = 1; i <= 500; i++) {
    usersToInsert.push({ name: `user${i}`, email: `user${i}@gmail.com`, role: 'commuter', passwordHash: hashedPassword });
  }
  for (let i = 1; i <= 250; i++) {
    usersToInsert.push({ name: `driver${i}`, email: `driver${i}@gmail.com`, role: 'driver', passwordHash: hashedPassword });
  }
  for (let i = 1; i <= 275; i++) {
    usersToInsert.push({ name: `conductor${i}`, email: `conductor${i}@gmail.com`, role: 'conductor', passwordHash: hashedPassword });
  }
  const insertedUsers = await User.insertMany(usersToInsert);
  const commuters = insertedUsers.filter(u => u.role === 'commuter');
  const drivers = insertedUsers.filter(u => u.role === 'driver');
  const conductors = insertedUsers.filter(u => u.role === 'conductor');
  console.log(`Created users in bulk.`);

  // ---------- TRANSPORTS ----------
  console.log('Creating 200 buses, 100 trains...');
  const transportsToInsert = [];
  const assignmentsByAuth = new Map(); // authorityId -> { drivers: [], conductors: [], transports: [] }
  authorities.forEach(a => assignmentsByAuth.set(a._id.toString(), { drivers: [], conductors: [], transports: [] }));

  let driverIdx = 0;
  let condIdx = 0;

  for (let i = 1; i <= 300; i++) {
    const isBus = i <= 200;
    const auth = randItem(authorities);
    const authMap = assignmentsByAuth.get(auth._id.toString());

    // Assignment logic
    let assignedDriver = null;
    let assignedConductor = null;

    // For buses (1..200): leave 50 buses with no driver -> So 150 buses get drivers.
    // Buses 1..150 get drivers (index 0..149).
    // Trains (201..300) get drivers (index 150..249).
    if (isBus && i <= 150) {
      assignedDriver = drivers[driverIdx++];
    } else if (!isBus && driverIdx < 250) {
      assignedDriver = drivers[driverIdx++];
    }

    // Conductors
    if (condIdx < conductors.length) {
      assignedConductor = conductors[condIdx++];
    }

    if (assignedDriver) authMap.drivers.push(assignedDriver._id);
    if (assignedConductor) authMap.conductors.push(assignedConductor._id);

    // Provide default fallback variables for origin & destination
    const org = randItem(TN_CITIES);
    let dest = randItem(TN_CITIES);
    while (dest === org) dest = randItem(TN_CITIES);

    transportsToInsert.push({
      transportNumber: (isBus ? `BUS-` : `TRN-`) + i.toString().padStart(4, '0'),
      name: `${org} - ${dest} ${isBus ? 'Express' : 'Superfast'}`,
      type: isBus ? 'bus' : 'train',
      operator: auth.organizationName,
      authorityId: auth._id,
      assignedDriver: assignedDriver ? assignedDriver._id : null,
      assignedConductor: assignedConductor ? assignedConductor._id : null,
      totalSeats: isBus ? 50 : 800,
      vehicleNumber: `TN-${randInt(10, 99)}-XX-${randInt(1000, 9999)}`,
      amenities: isBus ? ['AC'] : ['AC', 'Sleeper', 'Pantry'],
      __tempOrg: org,
      __tempDest: dest,
      __tempAssignedDriver: assignedDriver ? assignedDriver._id : null
    });
  }

  const insertedTransports = await Transport.insertMany(transportsToInsert);
  insertedTransports.forEach(t => {
    assignmentsByAuth.get(t.authorityId.toString()).transports.push(t._id);
  });

  // ---------- SYNC RELATIONAL ASSIGNMENTS ----------
  console.log('Synchronizing user and authority assignments...');
  // Update users
  const userUpdates = [];
  insertedTransports.forEach((t) => {
    const dId = t.__tempAssignedDriver || t.assignedDriver; // from memory
    const cId = transportsToInsert.find(x => x.transportNumber === t.transportNumber).assignedConductor;
    if (dId) {
      userUpdates.push({ updateOne: { filter: { _id: dId }, update: { $set: { assignedTransport: t._id, assignedBy: t.authorityId, assignedAt: new Date() } } } });
    }
    if (cId) {
      userUpdates.push({ updateOne: { filter: { _id: cId }, update: { $set: { assignedTransport: t._id, assignedBy: t.authorityId, assignedAt: new Date() } } } });
    }
  });
  if (userUpdates.length > 0) await User.bulkWrite(userUpdates);

  // Update authorities
  const authUpdates = authorities.map(a => {
    const mapped = assignmentsByAuth.get(a._id.toString());
    return {
      updateOne: {
        filter: { _id: a._id },
        update: { $set: { managedTransports: mapped.transports, managedDrivers: mapped.drivers, managedConductors: mapped.conductors } }
      }
    };
  });
  await Authority.bulkWrite(authUpdates);

  // ---------- ROUTES ----------
  console.log('Generating Forward and Return routes...');
  const routesToInsert = [];
  const routesFlat = []; // to use for later

  insertedTransports.forEach((t) => {
    // Retain origin logic
    const ref = transportsToInsert.find(x => x.transportNumber === t.transportNumber);
    const origin = ref.__tempOrg;
    const dest = ref.__tempDest;
    const dist = randInt(50, 400);

    const stopsFwd = [
      { stopName: origin, stopOrder: 1, distanceFromOrigin: 0, scheduledArrival: '06:00', scheduledDeparture: '06:10' },
      { stopName: dest, stopOrder: 2, distanceFromOrigin: dist, scheduledArrival: '10:00', scheduledDeparture: '10:00' },
    ];

    // forward
    routesToInsert.push({
      transportId: t._id,
      routeNumber: t.transportNumber + '-F',
      routeName: `${origin} → ${dest}`,
      origin: origin,
      destination: dest,
      direction: 'forward',
      totalDistance: dist,
      estimatedDuration: dist * 1.5,
      availableSeats: randInt(0, ref.totalSeats),
      stops: stopsFwd,
      schedule: [{ tripId: `${t.transportNumber}-T1`, departureTime: '06:10', arrivalTime: '10:00', isActive: true, daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
      fareTable: [{ fromStop: origin, toStop: dest, fare: dist * 1.2, fareClass: 'general' }]
    });

    // return
    const stopsRet = [
      { stopName: dest, stopOrder: 1, distanceFromOrigin: 0, scheduledArrival: '14:00', scheduledDeparture: '14:10' },
      { stopName: origin, stopOrder: 2, distanceFromOrigin: dist, scheduledArrival: '18:00', scheduledDeparture: '18:00' },
    ];

    routesToInsert.push({
      transportId: t._id,
      routeNumber: t.transportNumber + '-R',
      routeName: `${dest} → ${origin}`,
      origin: dest,
      destination: origin,
      direction: 'return',
      totalDistance: dist,
      estimatedDuration: dist * 1.5,
      availableSeats: randInt(0, ref.totalSeats),
      stops: stopsRet,
      schedule: [{ tripId: `${t.transportNumber}-T2`, departureTime: '14:10', arrivalTime: '18:00', isActive: true, daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
      fareTable: [{ fromStop: dest, toStop: origin, fare: dist * 1.2, fareClass: 'general' }]
    });
  });

  const insertedRoutes = await Route.insertMany(routesToInsert);
  console.log(`Generated ${insertedRoutes.length} routes.`);

  // Load images
  console.log('Loading base64 images from seed folder...');
  const base64Imgs = getBase64Images();

  // ---------- LIVE DATA, CROWD & INCIDENTS ----------
  console.log('Generating Live positions, Crowd levels, Crowd reports, Incidents...');
  const liveToInsert = [];
  const crowdLvlsToInsert = [];
  const crowdRepsToInsert = [];
  const incsToInsert = [];

  const types = ['delay', 'breakdown', 'accident', 'overcrowding', 'other'];
  const sevs = ['low', 'medium', 'high', 'critical'];
  const clvls = ['empty', 'average', 'crowded'];

  insertedRoutes.forEach((route) => {
    // 50% chance a route is active right now
    if (Math.random() > 0.5) {
      // Find transport for driver
      const t = insertedTransports.find(x => String(x._id) === String(route.transportId));
      if (t && t.assignedDriver) {
        liveToInsert.push({
          transportId: t._id, routeId: route._id,
          currentStop: route.origin, nextStop: route.destination, stopIndex: 1, delayMinutes: randInt(0, 15),
          status: 'on-time', updatedByModel: 'User', updatedBy: t.assignedDriver, updatedByRole: 'driver'
        });
        crowdLvlsToInsert.push({
          transportId: t._id, routeId: route._id, crowdLevel: randItem(clvls),
          currentStop: route.origin, updatedByModel: 'User', updatedBy: t.assignedDriver, updatedByRole: 'driver'
        });
      }
    }

    // Commuter reports
    if (Math.random() > 0.3) {
      for (let i = 0; i < randInt(1, 5); i++) {
        crowdRepsToInsert.push({
          routeId: route._id, reportedBy: randItem(commuters)._id,
          crowdLevel: randItem(clvls), boardingStop: route.origin, reportedAt: new Date(Date.now() - randInt(10000, 10000000))
        });
      }
    }

    // Incidents (use our base64 images optionally)
    if (Math.random() > 0.8) {
      for (let i = 0; i < randInt(1, 2); i++) {
        const hasImg = base64Imgs.length && Math.random() > 0.3;
        incsToInsert.push({
          transportId: route.transportId,
          routeId: route._id,
          reportedBy: randItem(commuters)._id,
          reporterRole: 'commuter',
          incidentType: randItem(types),
          severity: randItem(sevs),
          description: `Extensive issues reported between ${route.origin} and ${route.destination}.`,
          location: `Near ${route.origin}`,
          status: 'open',
          img: hasImg ? randItem(base64Imgs) : null,
          reportedAt: new Date(Date.now() - randInt(10000, 10000000))
        });
      }
    }
  });

  if (liveToInsert.length) await LivePosition.insertMany(liveToInsert);
  if (crowdLvlsToInsert.length) await CrowdLevel.insertMany(crowdLvlsToInsert);
  if (crowdRepsToInsert.length) await CrowdReport.insertMany(crowdRepsToInsert);
  if (incsToInsert.length) await Incident.insertMany(incsToInsert);

  console.log(`LivePositions: ${liveToInsert.length}, CrowdLevels: ${crowdLvlsToInsert.length}, CrowdReports: ${crowdRepsToInsert.length}, Incidents: ${incsToInsert.length}`);

  console.log('SEED COMPLETE!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
