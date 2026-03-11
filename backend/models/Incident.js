const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
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
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterRole: {
      type: String,
      enum: ['commuter', 'driver', 'conductor'],
      required: true,
    },

    incidentType: {
      type: String,
      enum: ['delay', 'breakdown', 'accident', 'overcrowding', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    description: { type: String, trim: true, default: '' },
    location:    { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved'],
      default: 'open',
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authority',
      default: null,
    },
    resolvedAt: { type: Date, default: null },
    reportedAt: { type: Date, default: Date.now },

    // Optional base64-encoded photo evidence ("data:image/<type>;base64,...")
    img: {
      type: String,
      default: null,
      validate: {
        validator: (v) => {
          if (!v) return true;
          return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
        },
        message: 'img must be a valid base64 image string: data:image/<type>;base64,...',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
