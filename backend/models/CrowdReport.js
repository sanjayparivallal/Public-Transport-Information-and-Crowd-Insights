const mongoose = require('mongoose');

const crowdReportSchema = new mongoose.Schema(
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
    crowdLevel: {
      type: String,
      enum: ['empty', 'average', 'crowded'],
      required: true,
    },
    boardingStop: { type: String, trim: true, default: null },
    reportedAt:   { type: Date, default: Date.now },
  },
  { timestamps: false }
);

crowdReportSchema.index({ transportId: 1, reportedAt: -1 });

module.exports = mongoose.model('CrowdReport', crowdReportSchema);
