const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * pendingAction — stores state for multi-turn authority workflows
 * (e.g. collecting all fields needed before writing to DB).
 */
const pendingActionSchema = new mongoose.Schema(
  {
    intent:          { type: String, default: null },
    collectedFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    missingFields:   { type: [String], default: [] },
    awaitingConfirm: { type: Boolean, default: false },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: true,
      index:    true,
      // Polymorphic — can be either User._id or Authority._id
    },
    userRole: {
      type:     String,
      enum:     ['commuter', 'driver', 'conductor', 'authority'],
      required: true,
    },
    messages:      { type: [messageSchema],      default: [] },
    pendingAction: { type: pendingActionSchema,   default: () => ({}) },
  },
  { timestamps: true }
);

// Keep only the last 100 messages per user
chatHistorySchema.methods.addMessage = function (role, content) {
  this.messages.push({ role, content, timestamp: new Date() });
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
