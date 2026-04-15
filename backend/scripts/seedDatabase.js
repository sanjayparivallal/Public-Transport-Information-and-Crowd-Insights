'use strict';
/**
 * seedDatabase.js — Fresh structured seed
 *
 * Drops the entire DB and seeds:
 *   - 4 Authority accounts
 *   - 16 Staff users (drivers + conductors)
 *   - 8 Transports
 *   - 16 Routes (2 per transport: forward + return) with 5–6 stops each
 *   - Multi-class fare tables (general + AC)
 *
 * Includes Chennai→Salem, Chennai→Karur, and other key Tamil Nadu routes.
 * Run: node scripts/seedDatabase.js
 */

const path     = require('path');
const bcrypt   = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Authority   = require('../models/Authority');
const User        = require('../models/User');
const Transport   = require('../models/Transport');
const Route       = require('../models/Route');

const PLAIN_PASSWORD = 'Password@123';

// ─── Authority Definitions ─────────────────────────────────────────────────
const AUTHORITY_DEFS = [
  {
    _key: 'MET',
    name: 'MTC Metropolitan',
    email: 'admin@mtc.tn.gov.in',
    phone: '044-25300200',
    organizationName: 'Metropolitan Transport Corporation (Chennai)',
    authorityCode: 'MTC-MET',
    region: 'Chennai',
    coveredDistricts: ['Chennai', 'Tiruvallur', 'Kancheepuram', 'Chengalpattu', 'Vellore', 'Salem', 'Karur'],
    contactEmail: 'contact@mtc.tn.gov.in',
    contactPhone: '044-25300200',
    officeAddress: '5 Anna Salai, Chennai, Tamil Nadu 600002',
  },
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
    coveredDistricts: ['Madurai', 'Dindigul', 'Theni', 'Ramanathapuram', 'Virudhunagar', 'Thoothukudi', 'Tirunelveli'],
    contactEmail: 'contact@tnstc-sth.tn.gov.in',
    contactPhone: '04522-330022',
    officeAddress: '8 Madurai Bypass Road, Madurai, Tamil Nadu 625001',
  },
  {
    _key: 'CBE',
    name: 'TNSTC Coimbatore Division',
    email: 'admin@tnstc-cbe.tn.gov.in',
    phone: '0422-2301200',
    organizationName: 'Tamil Nadu State Transport Corporation (Coimbatore)',
    authorityCode: 'TNSTC-CBE',
    region: 'Coimbatore',
    coveredDistricts: ['Coimbatore', 'Tiruppur', 'Erode', 'Nilgiris'],
    contactEmail: 'contact@tnstc-cbe.tn.gov.in',
    contactPhone: '0422-2301200',
    officeAddress: '15 Avinashi Road, Coimbatore, Tamil Nadu 641018',
  },
];

// ─── Staff Definitions ────────────────────────────────────────────────────
const STAFF_DEFS = [
  // MET
  { _div: 'MET', role: 'driver',    name: 'Arjun Suresh',     email: 'arjun.s@mtc-met.in',      phone: '9944003001' },
  { _div: 'MET', role: 'driver',    name: 'Dinesh Babu',      email: 'dinesh.b@mtc-met.in',     phone: '9944003002' },
  { _div: 'MET', role: 'conductor', name: 'Meena Sundaram',   email: 'meena.s@mtc-met.in',      phone: '9944003003' },
  { _div: 'MET', role: 'conductor', name: 'Rajesh Pillai',    email: 'rajesh.p@mtc-met.in',     phone: '9944003004' },
  // NTH
  { _div: 'NTH', role: 'driver',    name: 'Murugan Selvam',   email: 'murugan.s@tnstc-nth.in',  phone: '9841001001' },
  { _div: 'NTH', role: 'driver',    name: 'Rajan Krishnan',   email: 'rajan.k@tnstc-nth.in',    phone: '9841001002' },
  { _div: 'NTH', role: 'conductor', name: 'Priya Devi',       email: 'priya.d@tnstc-nth.in',    phone: '9841001003' },
  { _div: 'NTH', role: 'conductor', name: 'Anand Raj',        email: 'anand.r@tnstc-nth.in',    phone: '9841001004' },
  // STH
  { _div: 'STH', role: 'driver',    name: 'Kumar Pandian',    email: 'kumar.p@tnstc-sth.in',    phone: '9865002001' },
  { _div: 'STH', role: 'driver',    name: 'Selvaraj Mutu',    email: 'selvaraj.m@tnstc-sth.in', phone: '9865002002' },
  { _div: 'STH', role: 'conductor', name: 'Lakshmi Bai',      email: 'lakshmi.b@tnstc-sth.in',  phone: '9865002003' },
  { _div: 'STH', role: 'conductor', name: 'Velu Nadar',       email: 'velu.n@tnstc-sth.in',     phone: '9865002004' },
  // CBE
  { _div: 'CBE', role: 'driver',    name: 'Suresh Kumar',     email: 'suresh.k@tnstc-cbe.in',   phone: '9876004001' },
  { _div: 'CBE', role: 'driver',    name: 'Prabhu Raja',      email: 'prabhu.r@tnstc-cbe.in',   phone: '9876004002' },
  { _div: 'CBE', role: 'conductor', name: 'Geetha Devi',      email: 'geetha.d@tnstc-cbe.in',   phone: '9876004003' },
  { _div: 'CBE', role: 'conductor', name: 'Ramesh Babu',      email: 'ramesh.b@tnstc-cbe.in',   phone: '9876004004' },
];

// ─── Transport Definitions ────────────────────────────────────────────────
const TRANSPORT_DEFS = [
  // MET — Chennai metropolitan routes
  {
    _div: 'MET', _driverKey: 'arjun.s@mtc-met.in', _conductorKey: 'meena.s@mtc-met.in',
    transportNumber: 'CHN-001', name: 'Chennai–Vellore Super Deluxe',
    type: 'bus', operator: 'MTC', amenities: ['AC', 'WiFi', 'USB Charging'], totalSeats: 44, vehicleNumber: 'TN-01-CA-5005',
  },
  {
    _div: 'MET', _driverKey: 'dinesh.b@mtc-met.in', _conductorKey: 'rajesh.p@mtc-met.in',
    transportNumber: 'CHN-002', name: 'Chennai–Kancheepuram Ordinary',
    type: 'bus', operator: 'MTC', amenities: [], totalSeats: 48, vehicleNumber: 'TN-01-CB-6006',
  },
  {
    _div: 'MET', _driverKey: 'arjun.s@mtc-met.in', _conductorKey: 'meena.s@mtc-met.in',
    transportNumber: 'CHN-003', name: 'Chennai–Salem AC Express',
    type: 'bus', operator: 'MTC', amenities: ['AC', 'USB Charging'], totalSeats: 44, vehicleNumber: 'TN-01-CC-7007',
  },
  {
    _div: 'MET', _driverKey: 'dinesh.b@mtc-met.in', _conductorKey: 'rajesh.p@mtc-met.in',
    transportNumber: 'CHN-004', name: 'Chennai–Karur Super Express',
    type: 'bus', operator: 'MTC', amenities: ['AC', 'WiFi'], totalSeats: 44, vehicleNumber: 'TN-01-CD-8008',
  },
  // NTH — Salem–based routes
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
  // STH — Madurai-based routes
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
];

// ─── Route Definitions ────────────────────────────────────────────────────
const ROUTE_DEFS = [

  // ══════════════════════════════════════════════════════════════════════
  // CHN-001  Chennai–Vellore Super Deluxe (AC + WiFi + USB)
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'CHN-001', routeNumber: 'RT-CHN001-F', routeName: 'Chennai → Vellore',
    origin: 'Chennai', destination: 'Vellore', direction: 'forward',
    totalDistance: 140, estimatedDuration: 180,
    stops: [
      { stopName: 'Chennai',          stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '05:30', scheduledDeparture: '05:30' },
      { stopName: 'Kancheepuram',     stopOrder: 2, distanceFromOrigin: 72,  scheduledArrival: '06:45', scheduledDeparture: '06:50' },
      { stopName: 'Ranipet',          stopOrder: 3, distanceFromOrigin: 105, scheduledArrival: '07:30', scheduledDeparture: '07:35' },
      { stopName: 'Arcot',            stopOrder: 4, distanceFromOrigin: 118, scheduledArrival: '07:55', scheduledDeparture: '08:00' },
      { stopName: 'Vellore',          stopOrder: 5, distanceFromOrigin: 140, scheduledArrival: '08:30', scheduledDeparture: '08:30' },
    ],
    schedule: [
      { tripId: 'CHN001-F-T1', departureTime: '05:30', arrivalTime: '08:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN001-F-T2', departureTime: '13:30', arrivalTime: '16:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Chennai',      toStop: 'Kancheepuram', fare: 85,  fareClass: 'general' },
      { fromStop: 'Chennai',      toStop: 'Kancheepuram', fare: 130, fareClass: 'AC' },
      { fromStop: 'Chennai',      toStop: 'Ranipet',      fare: 120, fareClass: 'general' },
      { fromStop: 'Chennai',      toStop: 'Ranipet',      fare: 185, fareClass: 'AC' },
      { fromStop: 'Chennai',      toStop: 'Vellore',      fare: 160, fareClass: 'general' },
      { fromStop: 'Chennai',      toStop: 'Vellore',      fare: 240, fareClass: 'AC' },
      { fromStop: 'Kancheepuram', toStop: 'Vellore',      fare: 90,  fareClass: 'general' },
      { fromStop: 'Kancheepuram', toStop: 'Vellore',      fare: 140, fareClass: 'AC' },
      { fromStop: 'Ranipet',      toStop: 'Vellore',      fare: 55,  fareClass: 'general' },
      { fromStop: 'Ranipet',      toStop: 'Vellore',      fare: 85,  fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'CHN-001', routeNumber: 'RT-CHN001-R', routeName: 'Vellore → Chennai',
    origin: 'Vellore', destination: 'Chennai', direction: 'return',
    totalDistance: 140, estimatedDuration: 180,
    stops: [
      { stopName: 'Vellore',          stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '09:30', scheduledDeparture: '09:30' },
      { stopName: 'Arcot',            stopOrder: 2, distanceFromOrigin: 22,  scheduledArrival: '10:00', scheduledDeparture: '10:05' },
      { stopName: 'Ranipet',          stopOrder: 3, distanceFromOrigin: 35,  scheduledArrival: '10:20', scheduledDeparture: '10:25' },
      { stopName: 'Kancheepuram',     stopOrder: 4, distanceFromOrigin: 68,  scheduledArrival: '11:15', scheduledDeparture: '11:20' },
      { stopName: 'Chennai',          stopOrder: 5, distanceFromOrigin: 140, scheduledArrival: '12:30', scheduledDeparture: '12:30' },
    ],
    schedule: [
      { tripId: 'CHN001-R-T1', departureTime: '09:30', arrivalTime: '12:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN001-R-T2', departureTime: '17:30', arrivalTime: '20:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Vellore', toStop: 'Ranipet',      fare: 55,  fareClass: 'general' },
      { fromStop: 'Vellore', toStop: 'Ranipet',      fare: 85,  fareClass: 'AC' },
      { fromStop: 'Vellore', toStop: 'Kancheepuram', fare: 90,  fareClass: 'general' },
      { fromStop: 'Vellore', toStop: 'Kancheepuram', fare: 140, fareClass: 'AC' },
      { fromStop: 'Vellore', toStop: 'Chennai',       fare: 160, fareClass: 'general' },
      { fromStop: 'Vellore', toStop: 'Chennai',       fare: 240, fareClass: 'AC' },
      { fromStop: 'Ranipet', toStop: 'Chennai',       fare: 120, fareClass: 'general' },
      { fromStop: 'Ranipet', toStop: 'Chennai',       fare: 185, fareClass: 'AC' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // CHN-002  Chennai–Kancheepuram Ordinary
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'CHN-002', routeNumber: 'RT-CHN002-F', routeName: 'Chennai → Kancheepuram',
    origin: 'Chennai', destination: 'Kancheepuram', direction: 'forward',
    totalDistance: 75, estimatedDuration: 100,
    stops: [
      { stopName: 'Chennai',          stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '06:00', scheduledDeparture: '06:00' },
      { stopName: 'Tambaram',         stopOrder: 2, distanceFromOrigin: 28, scheduledArrival: '06:40', scheduledDeparture: '06:45' },
      { stopName: 'Chengalpattu',     stopOrder: 3, distanceFromOrigin: 45, scheduledArrival: '07:15', scheduledDeparture: '07:20' },
      { stopName: 'Singaperumalkoil', stopOrder: 4, distanceFromOrigin: 60, scheduledArrival: '07:45', scheduledDeparture: '07:50' },
      { stopName: 'Kancheepuram',     stopOrder: 5, distanceFromOrigin: 75, scheduledArrival: '08:20', scheduledDeparture: '08:20' },
    ],
    schedule: [
      { tripId: 'CHN002-F-T1', departureTime: '06:00', arrivalTime: '08:20', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-F-T2', departureTime: '11:00', arrivalTime: '13:20', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-F-T3', departureTime: '16:30', arrivalTime: '18:50', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Chennai',      toStop: 'Tambaram',         fare: 30, fareClass: 'general' },
      { fromStop: 'Chennai',      toStop: 'Chengalpattu',     fare: 50, fareClass: 'general' },
      { fromStop: 'Chennai',      toStop: 'Kancheepuram',     fare: 75, fareClass: 'general' },
      { fromStop: 'Tambaram',     toStop: 'Chengalpattu',     fare: 25, fareClass: 'general' },
      { fromStop: 'Tambaram',     toStop: 'Kancheepuram',     fare: 55, fareClass: 'general' },
      { fromStop: 'Chengalpattu', toStop: 'Kancheepuram',     fare: 35, fareClass: 'general' },
    ],
  },
  {
    _transportNumber: 'CHN-002', routeNumber: 'RT-CHN002-R', routeName: 'Kancheepuram → Chennai',
    origin: 'Kancheepuram', destination: 'Chennai', direction: 'return',
    totalDistance: 75, estimatedDuration: 100,
    stops: [
      { stopName: 'Kancheepuram',     stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '09:00', scheduledDeparture: '09:00' },
      { stopName: 'Singaperumalkoil', stopOrder: 2, distanceFromOrigin: 15, scheduledArrival: '09:25', scheduledDeparture: '09:30' },
      { stopName: 'Chengalpattu',     stopOrder: 3, distanceFromOrigin: 30, scheduledArrival: '09:55', scheduledDeparture: '10:00' },
      { stopName: 'Tambaram',         stopOrder: 4, distanceFromOrigin: 47, scheduledArrival: '10:30', scheduledDeparture: '10:35' },
      { stopName: 'Chennai',          stopOrder: 5, distanceFromOrigin: 75, scheduledArrival: '11:20', scheduledDeparture: '11:20' },
    ],
    schedule: [
      { tripId: 'CHN002-R-T1', departureTime: '09:00', arrivalTime: '11:20', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-R-T2', departureTime: '14:00', arrivalTime: '16:20', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN002-R-T3', departureTime: '18:30', arrivalTime: '20:50', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Kancheepuram', toStop: 'Chengalpattu', fare: 35, fareClass: 'general' },
      { fromStop: 'Kancheepuram', toStop: 'Tambaram',     fare: 55, fareClass: 'general' },
      { fromStop: 'Kancheepuram', toStop: 'Chennai',       fare: 75, fareClass: 'general' },
      { fromStop: 'Chengalpattu', toStop: 'Tambaram',     fare: 25, fareClass: 'general' },
      { fromStop: 'Chengalpattu', toStop: 'Chennai',       fare: 50, fareClass: 'general' },
      { fromStop: 'Tambaram',     toStop: 'Chennai',       fare: 30, fareClass: 'general' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // CHN-003  Chennai–Salem AC Express
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'CHN-003', routeNumber: 'RT-CHN003-F', routeName: 'Chennai → Salem',
    origin: 'Chennai', destination: 'Salem', direction: 'forward',
    totalDistance: 340, estimatedDuration: 360,
    stops: [
      { stopName: 'Chennai',       stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '06:00', scheduledDeparture: '06:00' },
      { stopName: 'Tindivanam',    stopOrder: 2, distanceFromOrigin: 95,  scheduledArrival: '07:45', scheduledDeparture: '07:55' },
      { stopName: 'Villupuram',    stopOrder: 3, distanceFromOrigin: 130, scheduledArrival: '08:30', scheduledDeparture: '08:40' },
      { stopName: 'Ulundurpet',    stopOrder: 4, distanceFromOrigin: 175, scheduledArrival: '09:20', scheduledDeparture: '09:30' },
      { stopName: 'Attur',         stopOrder: 5, distanceFromOrigin: 280, scheduledArrival: '11:00', scheduledDeparture: '11:10' },
      { stopName: 'Salem',         stopOrder: 6, distanceFromOrigin: 340, scheduledArrival: '12:00', scheduledDeparture: '12:00' },
    ],
    schedule: [
      { tripId: 'CHN003-F-T1', departureTime: '06:00', arrivalTime: '12:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN003-F-T2', departureTime: '22:00', arrivalTime: '04:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Chennai',    toStop: 'Tindivanam', fare: 110, fareClass: 'general' },
      { fromStop: 'Chennai',    toStop: 'Tindivanam', fare: 165, fareClass: 'AC' },
      { fromStop: 'Chennai',    toStop: 'Villupuram', fare: 150, fareClass: 'general' },
      { fromStop: 'Chennai',    toStop: 'Villupuram', fare: 225, fareClass: 'AC' },
      { fromStop: 'Chennai',    toStop: 'Ulundurpet', fare: 200, fareClass: 'general' },
      { fromStop: 'Chennai',    toStop: 'Ulundurpet', fare: 300, fareClass: 'AC' },
      { fromStop: 'Chennai',    toStop: 'Salem',      fare: 360, fareClass: 'general' },
      { fromStop: 'Chennai',    toStop: 'Salem',      fare: 540, fareClass: 'AC' },
      { fromStop: 'Tindivanam', toStop: 'Villupuram', fare: 50,  fareClass: 'general' },
      { fromStop: 'Tindivanam', toStop: 'Villupuram', fare: 75,  fareClass: 'AC' },
      { fromStop: 'Tindivanam', toStop: 'Salem',      fare: 260, fareClass: 'general' },
      { fromStop: 'Tindivanam', toStop: 'Salem',      fare: 390, fareClass: 'AC' },
      { fromStop: 'Villupuram', toStop: 'Salem',      fare: 220, fareClass: 'general' },
      { fromStop: 'Villupuram', toStop: 'Salem',      fare: 330, fareClass: 'AC' },
      { fromStop: 'Ulundurpet', toStop: 'Salem',      fare: 170, fareClass: 'general' },
      { fromStop: 'Ulundurpet', toStop: 'Salem',      fare: 255, fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'CHN-003', routeNumber: 'RT-CHN003-R', routeName: 'Salem → Chennai',
    origin: 'Salem', destination: 'Chennai', direction: 'return',
    totalDistance: 340, estimatedDuration: 360,
    stops: [
      { stopName: 'Salem',         stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '14:00', scheduledDeparture: '14:00' },
      { stopName: 'Attur',         stopOrder: 2, distanceFromOrigin: 60,  scheduledArrival: '15:00', scheduledDeparture: '15:10' },
      { stopName: 'Ulundurpet',    stopOrder: 3, distanceFromOrigin: 165, scheduledArrival: '16:45', scheduledDeparture: '16:55' },
      { stopName: 'Villupuram',    stopOrder: 4, distanceFromOrigin: 210, scheduledArrival: '17:40', scheduledDeparture: '17:50' },
      { stopName: 'Tindivanam',    stopOrder: 5, distanceFromOrigin: 245, scheduledArrival: '18:30', scheduledDeparture: '18:40' },
      { stopName: 'Chennai',       stopOrder: 6, distanceFromOrigin: 340, scheduledArrival: '20:00', scheduledDeparture: '20:00' },
    ],
    schedule: [
      { tripId: 'CHN003-R-T1', departureTime: '14:00', arrivalTime: '20:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN003-R-T2', departureTime: '08:00', arrivalTime: '14:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Salem',      toStop: 'Ulundurpet', fare: 170, fareClass: 'general' },
      { fromStop: 'Salem',      toStop: 'Ulundurpet', fare: 255, fareClass: 'AC' },
      { fromStop: 'Salem',      toStop: 'Villupuram', fare: 220, fareClass: 'general' },
      { fromStop: 'Salem',      toStop: 'Villupuram', fare: 330, fareClass: 'AC' },
      { fromStop: 'Salem',      toStop: 'Tindivanam', fare: 260, fareClass: 'general' },
      { fromStop: 'Salem',      toStop: 'Tindivanam', fare: 390, fareClass: 'AC' },
      { fromStop: 'Salem',      toStop: 'Chennai',    fare: 360, fareClass: 'general' },
      { fromStop: 'Salem',      toStop: 'Chennai',    fare: 540, fareClass: 'AC' },
      { fromStop: 'Villupuram', toStop: 'Chennai',    fare: 150, fareClass: 'general' },
      { fromStop: 'Villupuram', toStop: 'Chennai',    fare: 225, fareClass: 'AC' },
      { fromStop: 'Tindivanam', toStop: 'Chennai',    fare: 110, fareClass: 'general' },
      { fromStop: 'Tindivanam', toStop: 'Chennai',    fare: 165, fareClass: 'AC' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // CHN-004  Chennai–Karur Super Express (AC + WiFi)
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'CHN-004', routeNumber: 'RT-CHN004-F', routeName: 'Chennai → Karur',
    origin: 'Chennai', destination: 'Karur', direction: 'forward',
    totalDistance: 380, estimatedDuration: 420,
    stops: [
      { stopName: 'Chennai',          stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '06:30', scheduledDeparture: '06:30' },
      { stopName: 'Chengalpattu',     stopOrder: 2, distanceFromOrigin: 45,  scheduledArrival: '07:30', scheduledDeparture: '07:40' },
      { stopName: 'Villupuram',       stopOrder: 3, distanceFromOrigin: 135, scheduledArrival: '09:00', scheduledDeparture: '09:10' },
      { stopName: 'Tiruchirappalli',  stopOrder: 4, distanceFromOrigin: 290, scheduledArrival: '11:30', scheduledDeparture: '11:45' },
      { stopName: 'Namakkal',         stopOrder: 5, distanceFromOrigin: 340, scheduledArrival: '12:30', scheduledDeparture: '12:40' },
      { stopName: 'Karur',            stopOrder: 6, distanceFromOrigin: 380, scheduledArrival: '13:30', scheduledDeparture: '13:30' },
    ],
    schedule: [
      { tripId: 'CHN004-F-T1', departureTime: '06:30', arrivalTime: '13:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN004-F-T2', departureTime: '21:00', arrivalTime: '04:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Chennai',         toStop: 'Chengalpattu',    fare: 55,  fareClass: 'general' },
      { fromStop: 'Chennai',         toStop: 'Chengalpattu',    fare: 85,  fareClass: 'AC' },
      { fromStop: 'Chennai',         toStop: 'Villupuram',      fare: 155, fareClass: 'general' },
      { fromStop: 'Chennai',         toStop: 'Villupuram',      fare: 235, fareClass: 'AC' },
      { fromStop: 'Chennai',         toStop: 'Tiruchirappalli', fare: 310, fareClass: 'general' },
      { fromStop: 'Chennai',         toStop: 'Tiruchirappalli', fare: 465, fareClass: 'AC' },
      { fromStop: 'Chennai',         toStop: 'Namakkal',        fare: 360, fareClass: 'general' },
      { fromStop: 'Chennai',         toStop: 'Namakkal',        fare: 540, fareClass: 'AC' },
      { fromStop: 'Chennai',         toStop: 'Karur',           fare: 400, fareClass: 'general' },
      { fromStop: 'Chennai',         toStop: 'Karur',           fare: 600, fareClass: 'AC' },
      { fromStop: 'Villupuram',      toStop: 'Tiruchirappalli', fare: 165, fareClass: 'general' },
      { fromStop: 'Villupuram',      toStop: 'Tiruchirappalli', fare: 250, fareClass: 'AC' },
      { fromStop: 'Villupuram',      toStop: 'Karur',           fare: 255, fareClass: 'general' },
      { fromStop: 'Villupuram',      toStop: 'Karur',           fare: 385, fareClass: 'AC' },
      { fromStop: 'Tiruchirappalli', toStop: 'Namakkal',        fare: 60,  fareClass: 'general' },
      { fromStop: 'Tiruchirappalli', toStop: 'Namakkal',        fare: 90,  fareClass: 'AC' },
      { fromStop: 'Tiruchirappalli', toStop: 'Karur',           fare: 90,  fareClass: 'general' },
      { fromStop: 'Tiruchirappalli', toStop: 'Karur',           fare: 135, fareClass: 'AC' },
      { fromStop: 'Namakkal',        toStop: 'Karur',           fare: 40,  fareClass: 'general' },
      { fromStop: 'Namakkal',        toStop: 'Karur',           fare: 60,  fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'CHN-004', routeNumber: 'RT-CHN004-R', routeName: 'Karur → Chennai',
    origin: 'Karur', destination: 'Chennai', direction: 'return',
    totalDistance: 380, estimatedDuration: 420,
    stops: [
      { stopName: 'Karur',            stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '15:00', scheduledDeparture: '15:00' },
      { stopName: 'Namakkal',         stopOrder: 2, distanceFromOrigin: 40,  scheduledArrival: '15:50', scheduledDeparture: '16:00' },
      { stopName: 'Tiruchirappalli',  stopOrder: 3, distanceFromOrigin: 90,  scheduledArrival: '17:00', scheduledDeparture: '17:15' },
      { stopName: 'Villupuram',       stopOrder: 4, distanceFromOrigin: 245, scheduledArrival: '19:30', scheduledDeparture: '19:40' },
      { stopName: 'Chengalpattu',     stopOrder: 5, distanceFromOrigin: 335, scheduledArrival: '21:00', scheduledDeparture: '21:10' },
      { stopName: 'Chennai',          stopOrder: 6, distanceFromOrigin: 380, scheduledArrival: '22:00', scheduledDeparture: '22:00' },
    ],
    schedule: [
      { tripId: 'CHN004-R-T1', departureTime: '15:00', arrivalTime: '22:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'CHN004-R-T2', departureTime: '08:00', arrivalTime: '15:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Karur',           toStop: 'Namakkal',        fare: 40,  fareClass: 'general' },
      { fromStop: 'Karur',           toStop: 'Namakkal',        fare: 60,  fareClass: 'AC' },
      { fromStop: 'Karur',           toStop: 'Tiruchirappalli', fare: 90,  fareClass: 'general' },
      { fromStop: 'Karur',           toStop: 'Tiruchirappalli', fare: 135, fareClass: 'AC' },
      { fromStop: 'Karur',           toStop: 'Villupuram',      fare: 255, fareClass: 'general' },
      { fromStop: 'Karur',           toStop: 'Villupuram',      fare: 385, fareClass: 'AC' },
      { fromStop: 'Karur',           toStop: 'Chennai',         fare: 400, fareClass: 'general' },
      { fromStop: 'Karur',           toStop: 'Chennai',         fare: 600, fareClass: 'AC' },
      { fromStop: 'Tiruchirappalli', toStop: 'Chennai',         fare: 310, fareClass: 'general' },
      { fromStop: 'Tiruchirappalli', toStop: 'Chennai',         fare: 465, fareClass: 'AC' },
      { fromStop: 'Villupuram',      toStop: 'Chennai',         fare: 155, fareClass: 'general' },
      { fromStop: 'Villupuram',      toStop: 'Chennai',         fare: 235, fareClass: 'AC' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // SLM-001  Salem–Krishnagiri Express (AC)
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'SLM-001', routeNumber: 'RT-SLM001-F', routeName: 'Salem → Krishnagiri',
    origin: 'Salem', destination: 'Krishnagiri', direction: 'forward',
    totalDistance: 94, estimatedDuration: 130,
    stops: [
      { stopName: 'Salem',        stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '06:00', scheduledDeparture: '06:00' },
      { stopName: 'Mettur Dam',   stopOrder: 2, distanceFromOrigin: 35, scheduledArrival: '06:50', scheduledDeparture: '06:55' },
      { stopName: 'Harur',        stopOrder: 3, distanceFromOrigin: 58, scheduledArrival: '07:25', scheduledDeparture: '07:30' },
      { stopName: 'Dharmapuri',   stopOrder: 4, distanceFromOrigin: 75, scheduledArrival: '07:55', scheduledDeparture: '08:00' },
      { stopName: 'Krishnagiri',  stopOrder: 5, distanceFromOrigin: 94, scheduledArrival: '08:30', scheduledDeparture: '08:30' },
    ],
    schedule: [
      { tripId: 'SLM001-F-T1', departureTime: '06:00', arrivalTime: '08:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM001-F-T2', departureTime: '14:00', arrivalTime: '16:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Salem',       toStop: 'Mettur Dam',  fare: 40,  fareClass: 'general' },
      { fromStop: 'Salem',       toStop: 'Mettur Dam',  fare: 60,  fareClass: 'AC' },
      { fromStop: 'Salem',       toStop: 'Dharmapuri',  fare: 80,  fareClass: 'general' },
      { fromStop: 'Salem',       toStop: 'Dharmapuri',  fare: 120, fareClass: 'AC' },
      { fromStop: 'Salem',       toStop: 'Krishnagiri', fare: 110, fareClass: 'general' },
      { fromStop: 'Salem',       toStop: 'Krishnagiri', fare: 165, fareClass: 'AC' },
      { fromStop: 'Dharmapuri',  toStop: 'Krishnagiri', fare: 45,  fareClass: 'general' },
      { fromStop: 'Dharmapuri',  toStop: 'Krishnagiri', fare: 70,  fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'SLM-001', routeNumber: 'RT-SLM001-R', routeName: 'Krishnagiri → Salem',
    origin: 'Krishnagiri', destination: 'Salem', direction: 'return',
    totalDistance: 94, estimatedDuration: 130,
    stops: [
      { stopName: 'Krishnagiri',  stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '09:00', scheduledDeparture: '09:00' },
      { stopName: 'Dharmapuri',   stopOrder: 2, distanceFromOrigin: 19, scheduledArrival: '09:30', scheduledDeparture: '09:35' },
      { stopName: 'Harur',        stopOrder: 3, distanceFromOrigin: 36, scheduledArrival: '10:00', scheduledDeparture: '10:05' },
      { stopName: 'Mettur Dam',   stopOrder: 4, distanceFromOrigin: 59, scheduledArrival: '10:40', scheduledDeparture: '10:45' },
      { stopName: 'Salem',        stopOrder: 5, distanceFromOrigin: 94, scheduledArrival: '11:30', scheduledDeparture: '11:30' },
    ],
    schedule: [
      { tripId: 'SLM001-R-T1', departureTime: '09:00', arrivalTime: '11:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM001-R-T2', departureTime: '17:00', arrivalTime: '19:30', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Krishnagiri', toStop: 'Dharmapuri', fare: 45,  fareClass: 'general' },
      { fromStop: 'Krishnagiri', toStop: 'Dharmapuri', fare: 70,  fareClass: 'AC' },
      { fromStop: 'Krishnagiri', toStop: 'Salem',      fare: 110, fareClass: 'general' },
      { fromStop: 'Krishnagiri', toStop: 'Salem',      fare: 165, fareClass: 'AC' },
      { fromStop: 'Dharmapuri',  toStop: 'Salem',      fare: 80,  fareClass: 'general' },
      { fromStop: 'Dharmapuri',  toStop: 'Salem',      fare: 120, fareClass: 'AC' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // SLM-002  Salem–Erode Ordinary
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'SLM-002', routeNumber: 'RT-SLM002-F', routeName: 'Salem → Erode',
    origin: 'Salem', destination: 'Erode', direction: 'forward',
    totalDistance: 65, estimatedDuration: 100,
    stops: [
      { stopName: 'Salem',       stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '07:00', scheduledDeparture: '07:00' },
      { stopName: 'Yercaud',     stopOrder: 2, distanceFromOrigin: 15, scheduledArrival: '07:25', scheduledDeparture: '07:30' },
      { stopName: 'Sankari',     stopOrder: 3, distanceFromOrigin: 30, scheduledArrival: '07:55', scheduledDeparture: '08:00' },
      { stopName: 'Namakkal',    stopOrder: 4, distanceFromOrigin: 45, scheduledArrival: '08:25', scheduledDeparture: '08:30' },
      { stopName: 'Erode',       stopOrder: 5, distanceFromOrigin: 65, scheduledArrival: '09:00', scheduledDeparture: '09:00' },
    ],
    schedule: [
      { tripId: 'SLM002-F-T1', departureTime: '07:00', arrivalTime: '09:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM002-F-T2', departureTime: '13:00', arrivalTime: '15:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Salem',    toStop: 'Sankari',  fare: 30, fareClass: 'general' },
      { fromStop: 'Salem',    toStop: 'Namakkal', fare: 45, fareClass: 'general' },
      { fromStop: 'Salem',    toStop: 'Erode',    fare: 65, fareClass: 'general' },
      { fromStop: 'Namakkal', toStop: 'Erode',    fare: 30, fareClass: 'general' },
    ],
  },
  {
    _transportNumber: 'SLM-002', routeNumber: 'RT-SLM002-R', routeName: 'Erode → Salem',
    origin: 'Erode', destination: 'Salem', direction: 'return',
    totalDistance: 65, estimatedDuration: 100,
    stops: [
      { stopName: 'Erode',    stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '10:00', scheduledDeparture: '10:00' },
      { stopName: 'Namakkal', stopOrder: 2, distanceFromOrigin: 20, scheduledArrival: '10:35', scheduledDeparture: '10:40' },
      { stopName: 'Sankari',  stopOrder: 3, distanceFromOrigin: 35, scheduledArrival: '11:05', scheduledDeparture: '11:10' },
      { stopName: 'Yercaud',  stopOrder: 4, distanceFromOrigin: 50, scheduledArrival: '11:35', scheduledDeparture: '11:40' },
      { stopName: 'Salem',    stopOrder: 5, distanceFromOrigin: 65, scheduledArrival: '12:00', scheduledDeparture: '12:00' },
    ],
    schedule: [
      { tripId: 'SLM002-R-T1', departureTime: '10:00', arrivalTime: '12:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'SLM002-R-T2', departureTime: '16:00', arrivalTime: '18:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Erode',    toStop: 'Namakkal', fare: 30, fareClass: 'general' },
      { fromStop: 'Erode',    toStop: 'Salem',    fare: 65, fareClass: 'general' },
      { fromStop: 'Namakkal', toStop: 'Salem',    fare: 45, fareClass: 'general' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // MDU-001  Madurai–Dindigul Deluxe (AC)
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'MDU-001', routeNumber: 'RT-MDU001-F', routeName: 'Madurai → Dindigul',
    origin: 'Madurai', destination: 'Dindigul', direction: 'forward',
    totalDistance: 64, estimatedDuration: 90,
    stops: [
      { stopName: 'Madurai',      stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '06:30', scheduledDeparture: '06:30' },
      { stopName: 'Vedasandur',   stopOrder: 2, distanceFromOrigin: 25, scheduledArrival: '07:05', scheduledDeparture: '07:10' },
      { stopName: 'Natham',       stopOrder: 3, distanceFromOrigin: 38, scheduledArrival: '07:30', scheduledDeparture: '07:35' },
      { stopName: 'Oddanchatram', stopOrder: 4, distanceFromOrigin: 50, scheduledArrival: '07:55', scheduledDeparture: '08:00' },
      { stopName: 'Dindigul',     stopOrder: 5, distanceFromOrigin: 64, scheduledArrival: '08:20', scheduledDeparture: '08:20' },
    ],
    schedule: [
      { tripId: 'MDU001-F-T1', departureTime: '06:30', arrivalTime: '08:20', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'MDU001-F-T2', departureTime: '12:30', arrivalTime: '14:20', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Madurai', toStop: 'Natham',   fare: 40, fareClass: 'general' },
      { fromStop: 'Madurai', toStop: 'Natham',   fare: 60, fareClass: 'AC' },
      { fromStop: 'Madurai', toStop: 'Dindigul', fare: 80, fareClass: 'general' },
      { fromStop: 'Madurai', toStop: 'Dindigul', fare: 120, fareClass: 'AC' },
      { fromStop: 'Natham',  toStop: 'Dindigul', fare: 45, fareClass: 'general' },
      { fromStop: 'Natham',  toStop: 'Dindigul', fare: 70, fareClass: 'AC' },
    ],
  },
  {
    _transportNumber: 'MDU-001', routeNumber: 'RT-MDU001-R', routeName: 'Dindigul → Madurai',
    origin: 'Dindigul', destination: 'Madurai', direction: 'return',
    totalDistance: 64, estimatedDuration: 90,
    stops: [
      { stopName: 'Dindigul',     stopOrder: 1, distanceFromOrigin: 0,  scheduledArrival: '09:00', scheduledDeparture: '09:00' },
      { stopName: 'Oddanchatram', stopOrder: 2, distanceFromOrigin: 14, scheduledArrival: '09:20', scheduledDeparture: '09:25' },
      { stopName: 'Natham',       stopOrder: 3, distanceFromOrigin: 26, scheduledArrival: '09:50', scheduledDeparture: '09:55' },
      { stopName: 'Vedasandur',   stopOrder: 4, distanceFromOrigin: 39, scheduledArrival: '10:15', scheduledDeparture: '10:20' },
      { stopName: 'Madurai',      stopOrder: 5, distanceFromOrigin: 64, scheduledArrival: '11:00', scheduledDeparture: '11:00' },
    ],
    schedule: [
      { tripId: 'MDU001-R-T1', departureTime: '09:00', arrivalTime: '11:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'MDU001-R-T2', departureTime: '16:00', arrivalTime: '18:00', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Dindigul', toStop: 'Natham',  fare: 45,  fareClass: 'general' },
      { fromStop: 'Dindigul', toStop: 'Natham',  fare: 70,  fareClass: 'AC' },
      { fromStop: 'Dindigul', toStop: 'Madurai', fare: 80,  fareClass: 'general' },
      { fromStop: 'Dindigul', toStop: 'Madurai', fare: 120, fareClass: 'AC' },
      { fromStop: 'Natham',   toStop: 'Madurai', fare: 40,  fareClass: 'general' },
      { fromStop: 'Natham',   toStop: 'Madurai', fare: 60,  fareClass: 'AC' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // MDU-002  Madurai–Ramanathapuram Express
  // ══════════════════════════════════════════════════════════════════════
  {
    _transportNumber: 'MDU-002', routeNumber: 'RT-MDU002-F', routeName: 'Madurai → Ramanathapuram',
    origin: 'Madurai', destination: 'Ramanathapuram', direction: 'forward',
    totalDistance: 120, estimatedDuration: 160,
    stops: [
      { stopName: 'Madurai',        stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '07:00', scheduledDeparture: '07:00' },
      { stopName: 'Paramakudi',     stopOrder: 2, distanceFromOrigin: 45,  scheduledArrival: '07:55', scheduledDeparture: '08:00' },
      { stopName: 'Sivaganga',      stopOrder: 3, distanceFromOrigin: 65,  scheduledArrival: '08:25', scheduledDeparture: '08:30' },
      { stopName: 'Kalaiyarkovil',  stopOrder: 4, distanceFromOrigin: 90,  scheduledArrival: '09:00', scheduledDeparture: '09:05' },
      { stopName: 'Ramanathapuram', stopOrder: 5, distanceFromOrigin: 120, scheduledArrival: '09:40', scheduledDeparture: '09:40' },
    ],
    schedule: [
      { tripId: 'MDU002-F-T1', departureTime: '07:00', arrivalTime: '09:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'MDU002-F-T2', departureTime: '15:00', arrivalTime: '17:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
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
      { stopName: 'Ramanathapuram', stopOrder: 1, distanceFromOrigin: 0,   scheduledArrival: '10:30', scheduledDeparture: '10:30' },
      { stopName: 'Kalaiyarkovil',  stopOrder: 2, distanceFromOrigin: 30,  scheduledArrival: '11:05', scheduledDeparture: '11:10' },
      { stopName: 'Sivaganga',      stopOrder: 3, distanceFromOrigin: 55,  scheduledArrival: '11:40', scheduledDeparture: '11:45' },
      { stopName: 'Paramakudi',     stopOrder: 4, distanceFromOrigin: 75,  scheduledArrival: '12:10', scheduledDeparture: '12:15' },
      { stopName: 'Madurai',        stopOrder: 5, distanceFromOrigin: 120, scheduledArrival: '13:10', scheduledDeparture: '13:10' },
    ],
    schedule: [
      { tripId: 'MDU002-R-T1', departureTime: '10:30', arrivalTime: '13:10', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
      { tripId: 'MDU002-R-T2', departureTime: '18:00', arrivalTime: '20:40', daysOfOperation: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive: true },
    ],
    fareTable: [
      { fromStop: 'Ramanathapuram', toStop: 'Sivaganga', fare: 70,  fareClass: 'general' },
      { fromStop: 'Ramanathapuram', toStop: 'Madurai',   fare: 130, fareClass: 'general' },
      { fromStop: 'Sivaganga',      toStop: 'Madurai',   fare: 70,  fareClass: 'general' },
    ],
  },
];

// ─── Commuter users ───────────────────────────────────────────────────────
const COMMUTER_COUNT = 10;

// ─── Main seed function ────────────────────────────────────────────────────
async function seedDatabase() {
  // 1. Connect
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✔ Connected to MongoDB');

  // 2. Drop database for a clean slate
  console.log('⚠ Dropping existing database…');
  await mongoose.connection.db.dropDatabase();
  console.log('✔ Database dropped');

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, 12);
  console.log('✔ Password hashed');

  // 4. Create Authorities
  const authorityMap = {};
  for (const def of AUTHORITY_DEFS) {
    const { _key, ...fields } = def;
    const auth = await Authority.create({ ...fields, passwordHash: PLAIN_PASSWORD });
    authorityMap[_key] = auth;
  }
  console.log(`✔ Created ${Object.keys(authorityMap).length} authorities`);

  // 5. Create commuter users
  const commuterDocs = [];
  for (let i = 1; i <= COMMUTER_COUNT; i++) {
    commuterDocs.push({
      name: `Commuter ${i}`,
      email: `commuter${i}@example.com`,
      phone: `9${String(i).padStart(9, '0')}`,
      role: 'commuter',
      passwordHash: hashedPassword,
    });
  }
  const commuters = await User.insertMany(commuterDocs);
  console.log(`✔ Created ${commuters.length} commuter users`);

  // 6. Create staff users
  const staffDocs = STAFF_DEFS.map(({ _div, ...fields }) => ({
    ...fields,
    passwordHash: hashedPassword,
  }));
  const staffUsers = await User.insertMany(staffDocs);
  const staffMap = {};
  for (const u of staffUsers) staffMap[u.email] = u;
  console.log(`✔ Created ${staffUsers.length} staff users`);

  // 7. Create Transports + Routes
  let transportCount = 0;
  let routeCount = 0;

  for (const tDef of TRANSPORT_DEFS) {
    const { _div, _driverKey, _conductorKey, ...tFields } = tDef;

    const authority  = authorityMap[_div];
    const driver     = staffMap[_driverKey];
    const conductor  = staffMap[_conductorKey];

    if (!authority) throw new Error(`No authority for _div="${_div}"`);
    if (!driver)    console.warn(`⚠ No driver found for email "${_driverKey}"`);
    if (!conductor) console.warn(`⚠ No conductor found for email "${_conductorKey}"`);

    const transport = await Transport.create({
      ...tFields,
      authorityId:       authority._id,
      assignedDriver:    driver?._id || null,
      assignedConductor: conductor?._id || null,
    });
    transportCount++;

    // Mirror assignment on Authority
    await Authority.findByIdAndUpdate(authority._id, {
      $addToSet: {
        managedTransports: transport._id,
        ...(driver    ? { managedDrivers: driver._id }       : {}),
        ...(conductor ? { managedConductors: conductor._id } : {}),
      },
    });

    // Mirror on User docs
    const now = new Date();
    if (driver)    await User.findByIdAndUpdate(driver._id,    { $set: { assignedTransport: transport._id, assignedBy: authority._id, assignedAt: now } });
    if (conductor) await User.findByIdAndUpdate(conductor._id, { $set: { assignedTransport: transport._id, assignedBy: authority._id, assignedAt: now } });

    // Create routes
    const routes = ROUTE_DEFS.filter(r => r._transportNumber === tDef.transportNumber);
    for (const rDef of routes) {
      const { _transportNumber, ...rFields } = rDef;
      await Route.create({ ...rFields, transportId: transport._id });
      routeCount++;
    }
  }

  console.log(`✔ Created ${transportCount} transports`);
  console.log(`✔ Created ${routeCount} routes`);

  // 8. Summary
  console.log('\n═══════════════════════════════════');
  console.log('        SEED COMPLETE 🚀          ');
  console.log('═══════════════════════════════════');
  console.log(`  Authorities  : ${Object.keys(authorityMap).length}`);
  console.log(`  Commuters    : ${commuters.length}`);
  console.log(`  Staff        : ${staffUsers.length}`);
  console.log(`  Transports   : ${transportCount}`);
  console.log(`  Routes       : ${routeCount} (with 5-6 stops + multi-class fares)`);
  console.log('\nLogin credentials (all accounts):');
  console.log(`  Password: ${PLAIN_PASSWORD}`);
  console.log('\nAuthority accounts:');
  AUTHORITY_DEFS.forEach(a => console.log(`  ${a.authorityCode.padEnd(14)} ${a.email}`));
  console.log('\nKey routes available:');
  console.log('  Chennai → Salem     (CHN-003, AC available)');
  console.log('  Chennai → Karur     (CHN-004, AC available)');
  console.log('  Chennai → Vellore   (CHN-001, AC + WiFi)');
  console.log('  Chennai → Kancheepuram  (CHN-002)');
  console.log('  Salem → Krishnagiri (SLM-001, AC available)');
  console.log('  Salem → Erode       (SLM-002)');
  console.log('  Madurai → Dindigul  (MDU-001, AC available)');
  console.log('  Madurai → Ramanathapuram (MDU-002)');

  await mongoose.disconnect();
  console.log('\n✔ Disconnected');
}

seedDatabase().catch(err => {
  console.error('Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
