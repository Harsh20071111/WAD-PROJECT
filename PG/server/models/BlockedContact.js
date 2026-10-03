const mongoose = require('mongoose');

const blockedContactSchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['PHONE', 'EMAIL', 'IP'],
      required: true,
    },
    reason: {
      type: String,
      default: 'Too many enquiry attempts',
    },
  },
  { timestamps: true }
);

blockedContactSchema.index({ pgId: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('BlockedContact', blockedContactSchema);
