const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    stopName:             { type: String, required: true, trim: true },
    stopOrder:            { type: Number, required: true },
    distanceFromOrigin:   { type: Number, required: true }, // km
    scheduledArrival:     { type: String, default: null },   // "HH:MM"
    scheduledDeparture:   { type: String, default: null },   // "HH:MM"
    platformNumber:       { type: String, default: null },   // trains only
  },
  { _id: false }
);

const scheduleEntrySchema = new mongoose.Schema(
  {
    tripId:          { type: String, required: true },
    departureTime:   { type: String, required: true }, // "HH:MM"
    arrivalTime:     { type: String, required: true }, // "HH:MM"
    daysOfOperation: {
      type: [String],
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const fareEntrySchema = new mongoose.Schema(
  {
    fromStop:  { type: String, required: true },
    toStop:    { type: String, required: true },
    fare:      { type: Number, required: true }, // ₹
    fareClass: {
      type: String,
      enum: ['general', 'AC', 'sleeper'],
      default: 'general',
    },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    transportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transport',
      required: true,
    },
    routeNumber: {
      type: String,
      required: [true, 'Route number is required'],
      trim: true,
      uppercase: true,
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    origin:      { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    direction: {
      type: String,
      enum: ['forward', 'return'],
      default: 'forward',
    },

    stops:     [stopSchema],
    schedule:  [scheduleEntrySchema],
    fareTable: [fareEntrySchema],

    totalDistance:     { type: Number, default: 0 }, // km
    estimatedDuration: { type: Number, default: 0 }, // minutes
  },
  { timestamps: true }
);

routeSchema.index({ transportId: 1 });
routeSchema.index({ transportId: 1, routeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);
