const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema(
  {
    transportNumber: {
      type: String,
      required: [true, 'Transport number is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Transport name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['bus', 'train'],
      required: [true, 'Transport type is required'],
    },
    operator: {
      type: String,
      trim: true,
    },
    authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authority',
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    totalSeats: {
      type: Number,
      min: [1, 'totalSeats must be at least 1'],
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedConductor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index: same number under same authority is unique
transportSchema.index({ transportNumber: 1, authorityId: 1 }, { unique: true });

module.exports = mongoose.model('Transport', transportSchema);
