const mongoose = require('mongoose');

// ⚠️  NO passengerCount / totalCapacity / seatCount — by design
const crowdLevelSchema = new mongoose.Schema(
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

    crowdLevel: {
      type: String,
      enum: ['empty', 'average', 'crowded'],
      required: true,
    },
    currentStop: { type: String, default: null },

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

// One crowd-level record per trip (upsert on transportId + tripId)
crowdLevelSchema.index({ transportId: 1, tripId: 1 }, { unique: true });

module.exports = mongoose.model('CrowdLevel', crowdLevelSchema);
