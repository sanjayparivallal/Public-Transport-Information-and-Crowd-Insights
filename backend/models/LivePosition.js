const mongoose = require('mongoose');

const livePositionSchema = new mongoose.Schema(
  {
    transportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transport',
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    tripId: { type: String, required: true },

    currentStop: { type: String, default: null },
    nextStop:    { type: String, default: null },
    stopIndex:   { type: Number, default: 0 },

    delayMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['on-time', 'delayed', 'cancelled', 'completed'],
      default: 'on-time',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedByRole: {
      type: String,
      enum: ['driver', 'conductor'],
      required: true,
    },
  },
  { timestamps: true }
);

// One live record per trip (upsert on transportId + tripId)
livePositionSchema.index({ transportId: 1, tripId: 1 }, { unique: true });

module.exports = mongoose.model('LivePosition', livePositionSchema);
