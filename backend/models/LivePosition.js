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

    currentStop: { type: String, default: null },
    nextStop:    { type: String, default: null },
    stopIndex:   { type: Number, default: 0 },

    delayMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['on-time', 'delayed', 'cancelled', 'completed'],
      default: 'on-time',
    },

    updatedByModel: {
      type: String,
      enum: ['User', 'Authority'],
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'updatedByModel',
      required: true,
    },
    updatedByRole: {
      type: String,
      enum: ['driver', 'conductor', 'authority'],
      required: true,
    },
  },
  { timestamps: true }
);

// One live record per route (upsert on transportId + routeId)
livePositionSchema.index({ transportId: 1, routeId: 1 }, { unique: true });

module.exports = mongoose.model('LivePosition', livePositionSchema);
