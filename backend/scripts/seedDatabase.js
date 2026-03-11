/**
 * Seed script — Tamil Nadu public transport data
 *
 * Usage (from project root):  node backend/scripts/seedDatabase.js
 * Usage (from backend/):      node scripts/seedDatabase.js
 *
 * Creates:
 *   - 3 Authority accounts (standalone, not in users collection)
 *   - 12 User accounts (6 drivers + 6 conductors)
 *   - 6 Transports (2 per authority)
 *   - 12 Routes (1 forward + 1 return per transport)
 *
 * All locations are Tamil Nadu districts.
 * Password for every account: Password@123
 */

'use strict';

const path   = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load .env from backend folder regardless of cwd
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Authority   = require('../models/Authority');
const User        = require('../models/User');
const Transport   = require('../models/Transport');
const Route       = require('../models/Route');

// ---------------------------------------------------------------------------
// Tamil Nadu district constraint
// ---------------------------------------------------------------------------
const TN_DISTRICTS = new Set([
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Villupuram', 'Virudhunagar',
]);

function assertTN(name) {
  if (!TN_DISTRICTS.has(name)) {
    throw new Error(`"${name}" is not a Tamil Nadu district`);
  }
}

// ---------------------------------------------------------------------------
// Validate all seed data upfront before touching the DB
// ---------------------------------------------------------------------------
function validateSeedData() {
  // Authority covered districts
  for (const a of AUTHORITY_DEFS) {
    for (const d of a.coveredDistricts) assertTN(d);
  }
  // Route origins / destinations / stops
  for (const r of ROUTE_DEFS) {
    assertTN(r.origin);
    assertTN(r.destination);
    for (const s of r.stops) assertTN(s.stopName);
  }
}

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------
const PLAIN_PASSWORD = 'Password@123';

/** 3 Transport Authorities */
const AUTHORITY_DEFS = [
  {
    _key: 'NTH',
    name: 'TNSTC Northern Division',
    email: 'admin@tnstc-nth.tn.gov.in',
    phone: '04272-220011',
    organizationName: 'Tamil Nadu State Transport Corporation (Northern)',
    authorityCode: 'TNSTC-NTH',
    region: 'Salem',
    coveredDistricts: ['Salem', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Erode'],
    contactEmail: 'contact@tnstc-nth.tn.gov.in',
    contactPhone: '04272-220011',
    officeAddress: '12 Salem Main Road, Salem, Tamil Nadu 636001',
  },
  {
    _key: 'STH',
    name: 'TNSTC Southern Division',
    email: 'admin@tnstc-sth.tn.gov.in',
    phone: '04522-330022',
    organizationName: 'Tamil Nadu State Transport Corporation (Southern)',
    authorityCode: 'TNSTC-STH',
    region: 'Madurai',
    coveredDistricts: ['Madurai', 'Dindigul', 'Theni', 'Ramanathapuram', 'Virudhunagar'],
    contactEmail: 'contact@tnstc-sth.tn.gov.in',
    contactPhone: '04522-330022',
    officeAddress: '8 Madurai Bypass Road, Madurai, Tamil Nadu 625001',
  },
  {
    _key: 'MET',
    name: 'MTC Metropolitan',
    email: 'admin@mtc.tn.gov.in',
    phone: '044-25300200',
    organizationName: 'Metropolitan Transport Corporation (Chennai)',
    authorityCode: 'MTC-MET',
    region: 'Chennai',
    coveredDistricts: ['Chennai', 'Tiruvallur', 'Kancheepuram', 'Chengalpattu', 'Vellore'],
    contactEmail: 'contact@mtc.tn.gov.in',
    contactPhone: '044-25300200',
    officeAddress: '5 Anna Salai, Chennai, Tamil Nadu 600002',
  },
];

/**
 * 12 Staff users: 4 per division (2 drivers + 2 conductors).
 * _div maps to AUTHORITY_DEFS._key.
 */
const STAFF_DEFS = [
  // NTH Division
  { _div: 'NTH', role: 'driver',    name: 'Murugan Selvam',   email: 'murugan.s@tnstc-nth.in',  phone: '9841001001' },
  { _div: 'NTH', role: 'driver',    name: 'Rajan Krishnan',   email: 'rajan.k@tnstc-nth.in',    phone: '9841001002' },
  { _div: 'NTH', role: 'conductor', name: 'Priya Devi',       email: 'priya.d@tnstc-nth.in',    phone: '9841001003' },
  { _div: 'NTH', role: 'conductor', name: 'Anand Raj',        email: 'anand.r@tnstc-nth.in',    phone: '9841001004' },
  // STH Division
  { _div: 'STH', role: 'driver',    name: 'Kumar Pandian',    email: 'kumar.p@tnstc-sth.in',    phone: '9865002001' },
  { _div: 'STH', role: 'driver',    name: 'Selvaraj Mutu',    email: 'selvaraj.m@tnstc-sth.in', phone: '9865002002' },
  { _div: 'STH', role: 'conductor', name: 'Lakshmi Bai',      email: 'lakshmi.b@tnstc-sth.in',  phone: '9865002003' },
  { _div: 'STH', role: 'conductor', name: 'Velu Nadar',       email: 'velu.n@tnstc-sth.in',     phone: '9865002004' },
  // MET Division
  { _div: 'MET', role: 'driver',    name: 'Arjun Suresh',     email: 'arjun.s@mtc-met.in',      phone: '9944003001' },
  { _div: 'MET', role: 'driver',    name: 'Dinesh Babu',      email: 'dinesh.b@mtc-met.in',     phone: '9944003002' },
  { _div: 'MET', role: 'conductor', name: 'Meena Sundaram',   email: 'meena.s@mtc-met.in',      phone: '9944003003' },
  { _div: 'MET', role: 'conductor', name: 'Rajesh Pillai',    email: 'rajesh.p@mtc-met.in',     phone: '9944003004' },
];

/**
 * 6 Transports: 2 per authority.
 * _div → authority key.  _driverIdx / _conductorIdx → index within STAFF_DEFS for that div.
 */
const TRANSPORT_DEFS = [
  {
    _div: 'NTH', _driverKey: 'murugan.s@tnstc-nth.in', _conductorKey: 'priya.d@tnstc-nth.in',
    transportNumber: 'SLM-001', name: 'Salem–Krishnagiri Express',
    type: 'bus', operator: 'TNSTC', amenities: ['AC'], totalSeats: 52, vehicleNumber: 'TN-30-AB-1001',
  },
  {
    _div: 'NTH', _driverKey: 'rajan.k@tnstc-nth.in', _conductorKey: 'anand.r@tnstc-nth.in',
    transportNumber: 'SLM-002', name: 'Salem–Erode Ordinary',
    type: 'bus', operator: 'TNSTC', amenities: [], totalSeats: 48, vehicleNumber: 'TN-30-AC-2002',
  },
  {
    _div: 'STH', _driverKey: 'kumar.p@tnstc-sth.in', _conductorKey: 'lakshmi.b@tnstc-sth.in',
    transportNumber: 'MDU-001', name: 'Madurai–Dindigul Deluxe',
    type: 'bus', operator: 'TNSTC', amenities: ['AC'], totalSeats: 44, vehicleNumber: 'TN-58-BA-3003',
  },
  {
    _div: 'STH', _driverKey: 'selvaraj.m@tnstc-sth.in', _conductorKey: 'velu.n@tnstc-sth.in',
    transportNumber: 'MDU-002', name: 'Madurai–Ramanathapuram Express',
    type: 'bus', operator: 'TNSTC', amenities: [], totalSeats: 52, vehicleNumber: 'TN-58-BB-4004',
  },
  {
    _div: 'MET', _driverKey: 'arjun.s@mtc-met.in', _conductorKey: 'meena.s@mtc-met.in',
    transportNumber: 'CHN-001', name: 'Chennai–Vellore Super Deluxe',
    type: 'bus', operator: 'MTC', amenities: ['AC', 'WiFi'], totalSeats: 44, vehicleNumber: 'TN-01-CA-5005',
  },
  {
    _div: 'MET', _driverKey: 'dinesh.b@mtc-met.in', _conductorKey: 'rajesh.p@mtc-met.in',
    transportNumber: 'CHN-002', name: 'Chennai–Kancheepuram Ordinary',
    type: 'bus', operator: 'MTC', amenities: [], totalSeats: 48, vehicleNumber: 'TN-01-CB-6006',
  },
];

/**
 * 12 Routes — 1 forward + 1 return per transport.
 * _transportNumber links to TRANSPORT_DEFS.transportNumber.
 */
const ROUTE_DEFS = [
  // SLM-001  Salem–Krishnagiri Express
  {
    _transportNumber: 'SLM-001', routeNumber: 'RT-SLM001-F', routeName: 'Salem → Krishnagiri',
    origin: 'Salem', destination: 'Krishnagiri', direction: 'forward',
    totalDistance: 94, estimatedDuration: 130,
    stops: [
      { stopName: 'Salem',        stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '06:00', scheduledDeparture: '06:00' },
      { stopName: 'Dharmapuri',   stopOrder: 2, distanceFromOrigin: 55, scheduledArrival: '07:10', scheduledDeparture: '07:15' },
      { stopName: 'Krishnagiri',  stopOrder: 3, distanceFromOrigin: 94, scheduledArrival: '08:10', scheduledDeparture: '08:10' },
    ],
    schedule: [
      { tripId: 'SLM001-F-0600', departureTime: '06:00', arrivalTime: '08:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM001-F-1400', departureTime: '14:00', arrivalTime: '16:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Salem', toStop: 'Dharmapuri',  fare: 70,  fareClass: 'AC' },
      { fromStop: 'Salem', toStop: 'Krishnagiri', fare: 120, fareClass: 'AC' },
      { fromStop: 'Dharmapuri', toStop: 'Krishnagiri', fare: 60, fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'SLM-001', routeNumber: 'RT-SLM001-R', routeName: 'Krishnagiri → Salem',
    origin: 'Krishnagiri', destination: 'Salem', direction: 'return',
    totalDistance: 94, estimatedDuration: 130,
    stops: [
      { stopName: 'Krishnagiri',  stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '09:00', scheduledDeparture: '09:00' },
      { stopName: 'Dharmapuri',   stopOrder: 2, distanceFromOrigin: 39, scheduledArrival: '09:50', scheduledDeparture: '09:55' },
      { stopName: 'Salem',        stopOrder: 3, distanceFromOrigin: 94, scheduledArrival: '11:10', scheduledDeparture: '11:10' },
    ],
    schedule: [
      { tripId: 'SLM001-R-0900', departureTime: '09:00', arrivalTime: '11:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM001-R-1700', departureTime: '17:00', arrivalTime: '19:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Krishnagiri', toStop: 'Dharmapuri', fare: 60,  fareClass: 'AC' },
      { fromStop: 'Krishnagiri', toStop: 'Salem',      fare: 120, fareClass: 'AC' },
      { fromStop: 'Dharmapuri',  toStop: 'Salem',      fare: 70,  fareClass: 'AC' },
    ],
  },
  // SLM-002  Salem–Erode Ordinary
  {
    _transportNumber: 'SLM-002', routeNumber: 'RT-SLM002-F', routeName: 'Salem → Erode',
    origin: 'Salem', destination: 'Erode', direction: 'forward',
    totalDistance: 65, estimatedDuration: 100,
    stops: [
      { stopName: 'Salem',  stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '07:00', scheduledDeparture: '07:00' },
      { stopName: 'Namakkal', stopOrder: 2, distanceFromOrigin: 38, scheduledArrival: '07:50', scheduledDeparture: '07:55' },
      { stopName: 'Erode',  stopOrder: 3, distanceFromOrigin: 65, scheduledArrival: '08:40', scheduledDeparture: '08:40' },
    ],
    schedule: [
      { tripId: 'SLM002-F-0700', departureTime: '07:00', arrivalTime: '08:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM002-F-1300', departureTime: '13:00', arrivalTime: '14:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Salem',    toStop: 'Namakkal', fare: 35, fareClass: 'general' },
      { fromStop: 'Salem',    toStop: 'Erode',    fare: 60, fareClass: 'general' },
      { fromStop: 'Namakkal', toStop: 'Erode',    fare: 30, fareClass: 'general' },
    ],
  },
  {
    _transportNumber: 'SLM-002', routeNumber: 'RT-SLM002-R', routeName: 'Erode → Salem',
    origin: 'Erode', destination: 'Salem', direction: 'return',
    totalDistance: 65, estimatedDuration: 100,
    stops: [
      { stopName: 'Erode',    stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '09:30', scheduledDeparture: '09:30' },
      { stopName: 'Namakkal', stopOrder: 2, distanceFromOrigin: 27, scheduledArrival: '10:15', scheduledDeparture: '10:20' },
      { stopName: 'Salem',    stopOrder: 3, distanceFromOrigin: 65, scheduledArrival: '11:10', scheduledDeparture: '11:10' },
    ],
    schedule: [
      { tripId: 'SLM002-R-0930', departureTime: '09:30', arrivalTime: '11:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM002-R-1530', departureTime: '15:30', arrivalTime: '17:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Erode',    toStop: 'Namakkal', fare: 30, fareClass: 'general' },
      { fromStop: 'Erode',    toStop: 'Salem',    fare: 60, fareClass: 'general' },
      { fromStop: 'Namakkal', toStop: 'Salem',    fare: 35, fareClass: 'general' },
    ],
  },
  // MDU-001  Madurai–Dindigul Deluxe
  {
    _transportNumber: 'MDU-001', routeNumber: 'RT-MDU001-F', routeName: 'Madurai → Dindigul',
    origin: 'Madurai', destination: 'Dindigul', direction: 'forward',
    totalDistance: 64, estimatedDuration: 90,
    stops: [
      { stopName: 'Madurai',  stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '06:30', scheduledDeparture: '06:30' },
      { stopName: 'Dindigul', stopOrder: 2, distanceFromOrigin: 64, scheduledArrival: '08:00', scheduledDeparture: '08:00' },
    ],
    schedule: [
      { tripId: 'MDU001-F-0630', departureTime: '06:30', arrivalTime: '08:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'MDU001-F-1230', departureTime: '12:30', arrivalTime: '14:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Madurai', toStop: 'Dindigul', fare: 90, fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'MDU-001', routeNumber: 'RT-MDU001-R', routeName: 'Dindigul → Madurai',
    origin: 'Dindigul', destination: 'Madurai', direction: 'return',
    totalDistance: 64, estimatedDuration: 90,
    stops: [
      { stopName: 'Dindigul', stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '08:30', scheduledDeparture: '08:30' },
      { stopName: 'Madurai',  stopOrder: 2, distanceFromOrigin: 64, scheduledArrival: '10:00', scheduledDeparture: '10:00' },
    ],
    schedule: [
      { tripId: 'MDU001-R-0830', departureTime: '08:30', arrivalTime: '10:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'MDU001-R-1500', departureTime: '15:00', arrivalTime: '16:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Dindigul', toStop: 'Madurai', fare: 90, fareClass: 'AC' },
    ],
  },
  // MDU-002  Madurai–Ramanathapuram Express
  {
    _transportNumber: 'MDU-002', routeNumber: 'RT-MDU002-F', routeName: 'Madurai → Ramanathapuram',
    origin: 'Madurai', destination: 'Ramanathapuram', direction: 'forward',
    totalDistance: 120, estimatedDuration: 160,
    stops: [
      { stopName: 'Madurai',         stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '07:00', scheduledDeparture: '07:00' },
      { stopName: 'Sivaganga',       stopOrder: 2, distanceFromOrigin: 60,  scheduledArrival: '08:05', scheduledDeparture: '08:10' },
      { stopName: 'Ramanathapuram',  stopOrder: 3, distanceFromOrigin: 120, scheduledArrival: '09:40', scheduledDeparture: '09:40' },
    ],
    schedule: [
      { tripId: 'MDU002-F-0700', departureTime: '07:00', arrivalTime: '09:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Madurai',   toStop: 'Sivaganga',      fare: 70,  fareClass: 'general' },
      { fromStop: 'Madurai',   toStop: 'Ramanathapuram', fare: 130, fareClass: 'general' },
      { fromStop: 'Sivaganga', toStop: 'Ramanathapuram', fare: 70,  fareClass: 'general' },
    ],
  },
  {
    _transportNumber: 'MDU-002', routeNumber: 'RT-MDU002-R', routeName: 'Ramanathapuram → Madurai',
    origin: 'Ramanathapuram', destination: 'Madurai', direction: 'return',
    totalDistance: 120, estimatedDuration: 160,
    stops: [
      { stopName: 'Ramanathapuram',  stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '10:30', scheduledDeparture: '10:30' },
      { stopName: 'Sivaganga',       stopOrder: 2, distanceFromOrigin: 60,  scheduledArrival: '12:00', scheduledDeparture: '12:05' },
      { stopName: 'Madurai',         stopOrder: 3, distanceFromOrigin: 120, scheduledArrival: '13:10', scheduledDeparture: '13:10' },
    ],
    schedule: [
      { tripId: 'MDU002-R-1030', departureTime: '10:30', arrivalTime: '13:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Ramanathapuram', toStop: 'Sivaganga', fare: 70,  fareClass: 'general' },
      { fromStop: 'Ramanathapuram', toStop: 'Madurai',   fare: 130, fareClass: 'general' },
      { fromStop: 'Sivaganga',      toStop: 'Madurai',   fare: 70,  fareClass: 'general' },
    ],
  },
  // CHN-001  Chennai–Vellore Super Deluxe
  {
    _transportNumber: 'CHN-001', routeNumber: 'RT-CHN001-F', routeName: 'Chennai → Vellore',
    origin: 'Chennai', destination: 'Vellore', direction: 'forward',
    totalDistance: 140, estimatedDuration: 180,
    stops: [
      { stopName: 'Chennai',  stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '05:30', scheduledDeparture: '05:30' },
      { stopName: 'Ranipet',  stopOrder: 2, distanceFromOrigin: 105, scheduledArrival: '07:30', scheduledDeparture: '07:35' },
      { stopName: 'Vellore',  stopOrder: 3, distanceFromOrigin: 140, scheduledArrival: '08:30', scheduledDeparture: '08:30' },
    ],
    schedule: [
      { tripId: 'CHN001-F-0530', departureTime: '05:30', arrivalTime: '08:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN001-F-1330', departureTime: '13:30', arrivalTime: '16:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Chennai', toStop: 'Ranipet', fare: 130, fareClass: 'AC' },
      { fromStop: 'Chennai', toStop: 'Vellore', fare: 180, fareClass: 'AC' },
      { fromStop: 'Ranipet', toStop: 'Vellore', fare: 60,  fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'CHN-001', routeNumber: 'RT-CHN001-R', routeName: 'Vellore → Chennai',
    origin: 'Vellore', destination: 'Chennai', direction: 'return',
    totalDistance: 140, estimatedDuration: 180,
    stops: [
      { stopName: 'Vellore',  stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '09:30', scheduledDeparture: '09:30' },
      { stopName: 'Ranipet',  stopOrder: 2, distanceFromOrigin: 35,  scheduledArrival: '10:15', scheduledDeparture: '10:20' },
      { stopName: 'Chennai',  stopOrder: 3, distanceFromOrigin: 140, scheduledArrival: '12:30', scheduledDeparture: '12:30' },
    ],
    schedule: [
      { tripId: 'CHN001-R-0930', departureTime: '09:30', arrivalTime: '12:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN001-R-1730', departureTime: '17:30', arrivalTime: '20:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Vellore',  toStop: 'Ranipet',  fare: 60,  fareClass: 'AC' },
      { fromStop: 'Vellore',  toStop: 'Chennai',  fare: 180, fareClass: 'AC' },
      { fromStop: 'Ranipet',  toStop: 'Chennai',  fare: 130, fareClass: 'AC' },
    ],
  },
  // CHN-002  Chennai–Kancheepuram Ordinary
  {
    _transportNumber: 'CHN-002', routeNumber: 'RT-CHN002-F', routeName: 'Chennai → Kancheepuram',
    origin: 'Chennai', destination: 'Kancheepuram', direction: 'forward',
    totalDistance: 75, estimatedDuration: 100,
    stops: [
      { stopName: 'Chennai',      stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '07:00', scheduledDeparture: '07:00' },
      { stopName: 'Chengalpattu', stopOrder: 2, distanceFromOrigin: 45, scheduledArrival: '08:00', scheduledDeparture: '08:05' },
      { stopName: 'Kancheepuram', stopOrder: 3, distanceFromOrigin: 75, scheduledArrival: '08:45', scheduledDeparture: '08:45' },
    ],
    schedule: [
      { tripId: 'CHN002-F-0700', departureTime: '07:00', arrivalTime: '08:45', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-F-1100', departureTime: '11:00', arrivalTime: '12:45', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-F-1600', departureTime: '16:00', arrivalTime: '17:45', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Chennai',      toStop: 'Chengalpattu', fare: 50, fareClass: 'general' },
      { fromStop: 'Chennai',      toStop: 'Kancheepuram', fare: 80, fareClass: 'general' },
      { fromStop: 'Chengalpattu', toStop: 'Kancheepuram', fare: 40, fareClass: 'general' },
    ],
  },
  {
    _transportNumber: 'CHN-002', routeNumber: 'RT-CHN002-R', routeName: 'Kancheepuram → Chennai',
    origin: 'Kancheepuram', destination: 'Chennai', direction: 'return',
    totalDistance: 75, estimatedDuration: 100,
    stops: [
      { stopName: 'Kancheepuram', stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '09:30', scheduledDeparture: '09:30' },
      { stopName: 'Chengalpattu', stopOrder: 2, distanceFromOrigin: 30, scheduledArrival: '10:10', scheduledDeparture: '10:15' },
      { stopName: 'Chennai',      stopOrder: 3, distanceFromOrigin: 75, scheduledArrival: '11:10', scheduledDeparture: '11:10' },
    ],
    schedule: [
      { tripId: 'CHN002-R-0930', departureTime: '09:30', arrivalTime: '11:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-R-1300', departureTime: '13:00', arrivalTime: '14:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-R-1800', departureTime: '18:00', arrivalTime: '19:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Kancheepuram', toStop: 'Chengalpattu', fare: 40, fareClass: 'general' },
      { fromStop: 'Kancheepuram', toStop: 'Chennai',       fare: 80, fareClass: 'general' },
      { fromStop: 'Chengalpattu', toStop: 'Chennai',       fare: 50, fareClass: 'general' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seedDatabase() {
  // 1. Validate all district names before touching the DB
  validateSeedData();
  console.log('✔ Seed data district validation passed');

  // 2. Connect
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✔ Connected to MongoDB');

  // 3. Idempotency check — abort if already seeded
  const existing = await Authority.findOne({ authorityCode: 'TNSTC-NTH' });
  if (existing) {
    console.log('⚠ Seed data already present (TNSTC-NTH exists). Skipping.');
    await mongoose.disconnect();
    return;
  }

  // 4. Hash password once (Authority.pre('save') will also hash — but insertMany bypasses hooks)
  //    We call Authority.create() individually so hooks DO run; no pre-hash needed for Authority.
  //    For User.insertMany we must pre-hash since insertMany bypasses hooks.
  const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, 12);
  console.log('✔ Password hashed');

  // ---------------------------------------------------------------------------
  // 5. Create Authorities (standalone — NOT in users collection)
  //    Authority.create() triggers pre('save') hook, so we pass the plain password.
  // ---------------------------------------------------------------------------
  const authorityMap = {}; // _key → Authority document
  for (const def of AUTHORITY_DEFS) {
    const { _key, ...fields } = def;
    const auth = await Authority.create({ ...fields, passwordHash: PLAIN_PASSWORD });
    authorityMap[_key] = auth;
  }
  console.log(`✔ Created ${Object.keys(authorityMap).length} authorities`);

  // ---------------------------------------------------------------------------
  // 6. Create Staff Users via insertMany (hooks bypassed — use pre-hashed password)
  // ---------------------------------------------------------------------------
  const staffDocs = STAFF_DEFS.map(({ _div, ...fields }) => ({
    ...fields,
    passwordHash: hashedPassword,
  }));
  const staffUsers = await User.insertMany(staffDocs);

  // Build email → User doc map
  const staffMap = {};
  for (const u of staffUsers) staffMap[u.email] = u;
  console.log(`✔ Created ${staffUsers.length} staff users`);

  // ---------------------------------------------------------------------------
  // 7. Create Transports + assign staff + create Routes
  // ---------------------------------------------------------------------------
  let transportCount = 0;
  let routeCount     = 0;

  for (const tDef of TRANSPORT_DEFS) {
    const { _div, _driverKey, _conductorKey, ...tFields } = tDef;

    const authority  = authorityMap[_div];
    const driver     = staffMap[_driverKey];
    const conductor  = staffMap[_conductorKey];

    if (!authority) throw new Error(`No authority found for _div="${_div}"`);
    if (!driver)    throw new Error(`No staff found for driver email "${_driverKey}"`);
    if (!conductor) throw new Error(`No staff found for conductor email "${_conductorKey}"`);

    // Create transport
    const transport = await Transport.create({
      ...tFields,
      authorityId:       authority._id,
      assignedDriver:    driver._id,
      assignedConductor: conductor._id,
    });
    transportCount++;

    // Mirror assignment on Authority
    await Authority.findByIdAndUpdate(authority._id, {
      $addToSet: {
        managedTransports: transport._id,
        managedDrivers:    driver._id,
        managedConductors: conductor._id,
      },
    });

    // Mirror assignment on User docs
    const now = new Date();
    await User.findByIdAndUpdate(driver._id, {
      $set: { assignedTransport: transport._id, assignedBy: authority._id, assignedAt: now },
    });
    await User.findByIdAndUpdate(conductor._id, {
      $set: { assignedTransport: transport._id, assignedBy: authority._id, assignedAt: now },
    });

    // Create routes for this transport
    const routes = ROUTE_DEFS.filter((r) => r._transportNumber === tDef.transportNumber);
    for (const rDef of routes) {
      const { _transportNumber, ...rFields } = rDef;
      await Route.create({ ...rFields, transportId: transport._id });
      routeCount++;
    }
  }

  console.log(`✔ Created ${transportCount} transports`);
  console.log(`✔ Created ${routeCount} routes`);

  // ---------------------------------------------------------------------------
  // 8. Summary
  // ---------------------------------------------------------------------------
  console.log('\n=== Seed Complete ===');
  console.log(`  Authorities : ${Object.keys(authorityMap).length}`);
  console.log(`  Staff users : ${staffUsers.length}  (${staffUsers.filter(u => u.role === 'driver').length} drivers, ${staffUsers.filter(u => u.role === 'conductor').length} conductors)`);
  console.log(`  Transports  : ${transportCount}`);
  console.log(`  Routes      : ${routeCount}`);
  console.log('\nLogin credentials (all accounts):');
  console.log(`  Password: ${PLAIN_PASSWORD}`);
  console.log('\nAuthority accounts:');
  AUTHORITY_DEFS.forEach((a) => console.log(`  ${a.authorityCode.padEnd(12)} ${a.email}`));
  console.log('\nStaff accounts (drivers/conductors):');
  STAFF_DEFS.forEach((s) => console.log(`  ${s.role.padEnd(10)} ${s.email}`));

  await mongoose.disconnect();
  console.log('\n✔ Disconnected from MongoDB');
}

seedDatabase().catch((err) => {
  console.error('Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
